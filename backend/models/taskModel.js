const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    scheduledDate: { type: Date, required: true },
    taskDate: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    duration: { type: Number, default: 30 },
    reminderBefore: { type: Number, default: 5 },
    timetableId: { type: String, default: null },
    isCompleted: { type: Boolean, default: false },
    status: { type: String, default: 'Pending' },
    userId: { type: String, required: true },
    isRecurring: { type: Boolean, default: false },
    parentId: { type: String, default: null },
    recurrenceRule: {
        frequency: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'custom'], default: 'none' },
        interval: { type: Number, default: 1 },
        daysOfWeek: [{ type: String }],
        dayOfMonth: { type: Number },
        customType: { type: String, enum: ['days', 'weeks'], default: 'days' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
