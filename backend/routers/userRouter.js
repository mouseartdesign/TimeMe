const express = require('express')
const router = express.Router()
const Task = require('../models/taskModel')
const requireAuth = require('../middleware/authMiddleware')

router.use(requireAuth)

// Helper to generate future occurrences for recurring tasks
const generateOccurrences = async (parentTask) => {
    if (!parentTask.isRecurring || parentTask.parentId) return;
    
    // Clean up any existing future pending occurrences first
    await Task.deleteMany({ parentId: parentTask._id.toString(), isCompleted: false });
    
    const occurrences = [];
    const rule = parentTask.recurrenceRule;
    if (!rule || rule.frequency === 'none') return;
    
    const startDate = new Date(parentTask.scheduledDate);
    const maxCount = 30; // maximum occurrences
    let currentDate = new Date(startDate);
    let count = 0;

    const createOccurrenceObj = (parent, date) => {
        const scheduled = new Date(date);
        // Copy time from parent's scheduledDate
        scheduled.setHours(startDate.getHours(), startDate.getMinutes(), startDate.getSeconds(), startDate.getMilliseconds());
        
        return {
            title: parent.title,
            description: parent.description,
            scheduledDate: scheduled,
            taskDate: scheduled.toISOString().slice(0, 10),
            startTime: parent.startTime,
            endTime: parent.endTime,
            duration: parent.duration,
            category: parent.category,
            userId: parent.userId,
            timetableId: parent.timetableId,
            reminderBefore: parent.reminderBefore,
            isCompleted: false,
            status: 'Pending',
            isRecurring: true,
            parentId: parent._id.toString(),
            recurrenceRule: parent.recurrenceRule
        };
    };

    if (rule.frequency === 'daily') {
        for (let i = 1; i <= maxCount; i++) {
            currentDate.setDate(currentDate.getDate() + 1);
            occurrences.push(createOccurrenceObj(parentTask, currentDate));
        }
    } else if (rule.frequency === 'weekly') {
        for (let i = 1; i <= 12; i++) {
            currentDate.setDate(currentDate.getDate() + 7);
            occurrences.push(createOccurrenceObj(parentTask, currentDate));
        }
    } else if (rule.frequency === 'monthly') {
        for (let i = 1; i <= 12; i++) {
            currentDate.setMonth(currentDate.getMonth() + 1);
            occurrences.push(createOccurrenceObj(parentTask, currentDate));
        }
    } else if (rule.frequency === 'custom') {
        const interval = rule.interval || 1;
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
            // Specific weekdays: generate for next 60 days
            for (let i = 1; i <= 60; i++) {
                const tempDate = new Date(startDate);
                tempDate.setDate(tempDate.getDate() + i);
                const dayName = tempDate.toLocaleDateString('en-US', { weekday: 'long' });
                if (rule.daysOfWeek.includes(dayName)) {
                    occurrences.push(createOccurrenceObj(parentTask, tempDate));
                    count++;
                    if (count >= maxCount) break;
                }
            }
        } else if (rule.dayOfMonth) {
            // Specific day of month: generate for next 12 months
            for (let i = 1; i <= 12; i++) {
                let nextMonth = new Date(startDate);
                nextMonth.setMonth(nextMonth.getMonth() + i);
                nextMonth.setDate(rule.dayOfMonth);
                occurrences.push(createOccurrenceObj(parentTask, nextMonth));
            }
        } else if (rule.interval) {
            // Every X days or weeks
            const customType = rule.customType || 'days';
            if (customType === 'days') {
                for (let i = 1; i <= maxCount; i++) {
                    currentDate.setDate(currentDate.getDate() + interval);
                    occurrences.push(createOccurrenceObj(parentTask, currentDate));
                }
            } else if (customType === 'weeks') {
                for (let i = 1; i <= 12; i++) {
                    currentDate.setDate(currentDate.getDate() + (interval * 7));
                    occurrences.push(createOccurrenceObj(parentTask, currentDate));
                }
            }
        }
    }

    if (occurrences.length > 0) {
        await Task.insertMany(occurrences);
    }
};

router.get('/', (req,res)=>{
    res.send('Router is working')
    console.log('Router is working')
})

//get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? { userId: req.user._id } : { isCompleted: false, userId: req.user._id };
        
        // Filter by timetableId if specified
        if (req.query.timetableId) {
            filter.timetableId = req.query.timetableId === 'null' ? null : req.query.timetableId;
        }

        const tasks = await Task.find(filter).sort({ scheduledDate: 1 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updatedTasks = tasks.map(task => {
            const taskObj = task.toObject();

            if (task.isCompleted) {
                taskObj.status = 'completed';
                return taskObj;
            }
            
            const scheduled = new Date(task.scheduledDate);
            scheduled.setHours(0, 0, 0, 0);

            if (scheduled.getTime() === today.getTime()) {
                taskObj.status = 'due';
            } else if (scheduled.getTime() < today.getTime()) {
                taskObj.status = 'missed';
            } else {
                taskObj.status = 'pending';
            }

            return taskObj;
        });

        res.status(200).json(updatedTasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//post a task
router.post('/tasks', async (req, res) => {
    try {
        const {
            title, description, scheduledDate, duration, category,
            taskDate, startTime, endTime, reminderBefore, timetableId,
            isRecurring, recurrenceRule
        } = req.body;
        
        const newTask = new Task({
            title, description, scheduledDate, duration, category,
            taskDate, startTime, endTime, reminderBefore, timetableId,
            isRecurring, recurrenceRule,
            userId: req.user._id
        });
        
        await newTask.save();
        
        // Generate occurrences if recurring
        if (isRecurring) {
            await generateOccurrences(newTask);
        }
        
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

//update a task
router.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, description, scheduledDate, duration, category,
            taskDate, startTime, endTime, reminderBefore, timetableId,
            isRecurring, recurrenceRule
        } = req.body;
        
        const updatedTask = await Task.findByIdAndUpdate(id, {
            title, description, scheduledDate, duration, category,
            taskDate, startTime, endTime, reminderBefore, timetableId,
            isRecurring, recurrenceRule
        }, { new: true });
        
        // Regenerate/generate occurrences if it's the parent task
        if (updatedTask && updatedTask.isRecurring && !updatedTask.parentId) {
            await generateOccurrences(updatedTask);
        } else if (updatedTask && !updatedTask.isRecurring && !updatedTask.parentId) {
            // If it was changed to non-recurring, clean up pending occurrences
            await Task.deleteMany({ parentId: id, isCompleted: false });
        }
        
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

//delete a task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);
        if (deletedTask && !deletedTask.parentId) {
            // Delete all occurrence copies
            await Task.deleteMany({ parentId: id });
        }
        res.status(200).json(deletedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

//complete a task
router.put('/tasks/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = await Task.findByIdAndUpdate(id, { isCompleted: true }, { new: true });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

module.exports = router;