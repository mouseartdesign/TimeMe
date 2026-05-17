const express = require('express');
const router = express.Router();
const TimeTable = require('../models/timeTableModel');
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth);

// Get the user's timetable (single)
router.get('/', async (req, res) => {
    try {
        const timetable = await TimeTable.findOne({ userId: req.user._id });
        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create or replace timetable (upsert — one per user)
router.post('/', async (req, res) => {
    try {
        const { name, activeDays, periods, categories, schedule } = req.body;
        const timetable = await TimeTable.findOneAndUpdate(
            { userId: req.user._id },
            { name, activeDays, periods, categories, schedule, userId: req.user._id },
            { new: true, upsert: true }
        );
        res.status(201).json(timetable);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update schedule only
router.patch('/schedule', async (req, res) => {
    try {
        const { schedule } = req.body;
        const timetable = await TimeTable.findOneAndUpdate(
            { userId: req.user._id },
            { schedule },
            { new: true }
        );
        if (!timetable) return res.status(404).json({ error: 'Timetable not found' });
        res.status(200).json(timetable);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete timetable
router.delete('/', async (req, res) => {
    try {
        const timetable = await TimeTable.findOneAndDelete({ userId: req.user._id });
        if (!timetable) return res.status(404).json({ error: 'Timetable not found' });
        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
