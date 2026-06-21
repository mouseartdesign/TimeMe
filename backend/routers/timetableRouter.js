const express = require('express');
const router = express.Router();
const TimeTable = require('../models/timeTableModel');
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth);

// Get the user's timetables
router.get('/', async (req, res) => {
    try {
        if (req.query.all === 'true') {
            const timetables = await TimeTable.find({ userId: req.user._id }).sort({ createdAt: -1 });
            return res.status(200).json(timetables);
        }
        if (req.query.id) {
            const timetable = await TimeTable.findOne({ _id: req.query.id, userId: req.user._id });
            return res.status(200).json(timetable);
        }
        // Get default timetable
        let timetable = await TimeTable.findOne({ userId: req.user._id, isDefault: true });
        if (!timetable) {
            timetable = await TimeTable.findOne({ userId: req.user._id });
        }
        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new timetable
router.post('/', async (req, res) => {
    try {
        const { name, activeDays, periods, categories, schedule, icon, color, isDefault } = req.body;
        const count = await TimeTable.countDocuments({ userId: req.user._id });
        const shouldBeDefault = count === 0 || isDefault === true;

        if (shouldBeDefault) {
            await TimeTable.updateMany({ userId: req.user._id }, { isDefault: false });
        }

        const timetable = new TimeTable({
            name,
            activeDays,
            periods,
            categories,
            schedule,
            icon: icon || '',
            color: color || '#3B82F6',
            isDefault: shouldBeDefault,
            userId: req.user._id
        });
        await timetable.save();
        res.status(201).json(timetable);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a specific timetable
router.put('/:id', async (req, res) => {
    try {
        const { name, activeDays, periods, categories, schedule, icon, color, isDefault } = req.body;

        if (isDefault === true) {
            await TimeTable.updateMany({ userId: req.user._id }, { isDefault: false });
        }

        const timetable = await TimeTable.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { name, activeDays, periods, categories, schedule, icon, color, isDefault },
            { new: true }
        );
        if (!timetable) return res.status(404).json({ error: 'Timetable not found' });
        res.status(200).json(timetable);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Set a timetable as homepage default
router.put('/:id/default', async (req, res) => {
    try {
        await TimeTable.updateMany({ userId: req.user._id }, { isDefault: false });
        const timetable = await TimeTable.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isDefault: true },
            { new: true }
        );
        if (!timetable) return res.status(404).json({ error: 'Timetable not found' });
        res.status(200).json(timetable);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update schedule of specific timetable
router.patch('/:id/schedule', async (req, res) => {
    try {
        const { schedule } = req.body;
        const timetable = await TimeTable.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { schedule },
            { new: true }
        );
        if (!timetable) return res.status(404).json({ error: 'Timetable not found' });
        res.status(200).json(timetable);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Backwards-compatible route to update schedule of the default timetable
router.patch('/schedule', async (req, res) => {
    try {
        const { schedule } = req.body;
        let timetable = await TimeTable.findOne({ userId: req.user._id, isDefault: true });
        if (!timetable) {
            timetable = await TimeTable.findOne({ userId: req.user._id });
        }
        if (!timetable) return res.status(404).json({ error: 'Timetable not found' });
        
        timetable.schedule = schedule;
        await timetable.save();
        res.status(200).json(timetable);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a specific timetable
router.delete('/:id', async (req, res) => {
    try {
        const timetable = await TimeTable.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!timetable) return res.status(404).json({ error: 'Timetable not found' });

        if (timetable.isDefault) {
            const another = await TimeTable.findOne({ userId: req.user._id });
            if (another) {
                another.isDefault = true;
                await another.save();
            }
        }
        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Backwards-compatible route to delete default timetable
router.delete('/', async (req, res) => {
    try {
        let timetable = await TimeTable.findOne({ userId: req.user._id, isDefault: true });
        if (!timetable) {
            timetable = await TimeTable.findOne({ userId: req.user._id });
        }
        if (!timetable) return res.status(404).json({ error: 'Timetable not found' });
        
        await TimeTable.deleteOne({ _id: timetable._id });
        
        const another = await TimeTable.findOne({ userId: req.user._id });
        if (another) {
            another.isDefault = true;
            await another.save();
        }
        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
