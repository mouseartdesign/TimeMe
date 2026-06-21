const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    order: { type: Number, required: true }
}, { _id: false });

const categorySchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true, default: '#3B82F6' },
    icon: { type: String, default: '' }
}, { _id: false });

const scheduleEntrySchema = new mongoose.Schema({
    day: { type: String, required: true },
    periodId: { type: String, required: true },
    categoryId: { type: String, default: '' },
    label: { type: String, default: '' }
}, { _id: false });

const timeTableSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: '' },
    color: { type: String, default: '#3B82F6' },
    isDefault: { type: Boolean, default: false },
    activeDays: [{ type: String }],
    periods: [periodSchema],
    categories: [categorySchema],
    schedule: [scheduleEntrySchema],
    userId: { type: String, required: true }
}, { timestamps: true });

// Drop unique index if it exists to allow multiple timetables per user
mongoose.connection.on('connected', async () => {
    try {
        await mongoose.connection.db.collection('timetables').dropIndex('userId_1');
    } catch (e) {
        // Index might not exist or is already dropped
    }
});

module.exports = mongoose.model('TimeTable', timeTableSchema);