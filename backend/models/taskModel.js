const mongoose =require('mongoose');

const taskSchema = new mongoose.Schema({
    title:{ type:String , required:true, trim:true },
    description:{ type:String },
    scheduledDate:{ type:Date, required:true},
    duration: {type: Number, default: 30},
    isCompleted: {type: Boolean, default: false},
    status: {type: String, default: 'Pending'},
    userId: { type: String, required: true }
}, {timestamps: true});

module.exports = mongoose.model('Task', taskSchema);
