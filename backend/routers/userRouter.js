const express = require('express')
const router = express.Router()
const Task = require('../models/taskModel')
const requireAuth = require('../middleware/authMiddleware')

router.use(requireAuth)

router.get('/', (req,res)=>{
    res.send('Router is working')
    console.log('Router is working')
})

//get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? { userId: req.user._id } : { isCompleted: false, userId: req.user._id };
        const tasks = await Task.find(filter).sort({ scheduledDate: 1 });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

    const updatedTasks = tasks.map(task => {
      // Convert to a plain object so we can add the 'status' property
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
        const { title, description, scheduledDate, duration, category } = req.body;
        const newTask = new Task({ title, description, scheduledDate, duration, category, userId: req.user._id });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

//update a task
router.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, scheduledDate, duration, category } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(id, { title, description, scheduledDate, duration, category }, { new: true });
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