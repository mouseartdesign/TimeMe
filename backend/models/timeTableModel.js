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
    activeDays: [{ type: String }],
    periods: [periodSchema],
    categories: [categorySchema],
    schedule: [scheduleEntrySchema],
    userId: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('TimeTable', timeTableSchema);