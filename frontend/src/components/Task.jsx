import React, { useState, useEffect } from "react";
import api from "../config/api";
import { Check, Trash2, PenLine, X, Clock, Calendar, AlertCircle, CheckCircle2, Timer } from "lucide-react";

const STATUS_CONFIG = {
    pending:   { label: 'Pending',   color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-100' },
    completed: { label: 'Done',      color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    missed:    { label: 'Missed',    color: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-100' },
    due:       { label: 'Due Today', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
};

const Task = ({ refreshTrigger, showAll = false, filterStatus = 'all' }) => {
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const endpoint = showAll ? '/api/tasks?all=true' : '/api/tasks';
                const res = await api.get(endpoint);
                if (res.status === 200) setTasks(res.data);
            } catch (error) {
                console.error('error fetching data', error);
            }
        };
        fetchTasks();
    }, [refreshTrigger]);

    const getDaysLeft = (scheduledDateStr) => {
        if (!scheduledDateStr) return null;
        const scheduledDate = new Date(scheduledDateStr);
        const today = new Date();
        scheduledDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return Math.ceil((scheduledDate - today) / (1000 * 60 * 60 * 24));
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await api.delete(`/api/tasks/${id}`);
            setTasks(tasks.filter(t => t._id !== id));
        } catch (error) {
            console.error('Error deleting task', error);
        }
    };

    const handleComplete = async (id) => {
        try {
            await api.put(`/api/tasks/${id}/complete`);
            setTasks(tasks.map(t => t._id === id ? { ...t, isCompleted: true, status: 'completed' } : t));
        } catch (error) {
            console.error('Error completing task', error);
        }
    };

    const handleEditSubmit = async (e, id) => {
        e.preventDefault();
        const updatedData = {
            title: e.target.title.value,
            description: e.target.description.value,
            duration: e.target.duration.value,
            scheduledDate: e.target.scheduledDate.value,
        };
        try {
            const res = await api.put(`/api/tasks/${id}`, updatedData);
            const today = new Date(); today.setHours(0, 0, 0, 0);
            let newStatus = 'pending';
            if (res.data.isCompleted) {
                newStatus = 'completed';
            } else {
                const scheduled = new Date(res.data.scheduledDate);
                scheduled.setHours(0, 0, 0, 0);
                if (scheduled.getTime() === today.getTime()) newStatus = 'due';
                else if (scheduled.getTime() < today.getTime()) newStatus = 'missed';
            }
            setTasks(tasks.map(t => t._id === id ? { ...res.data, status: newStatus } : t));
            setEditingTask(null);
        } catch (error) {
            console.error('Error updating task', error);
        }
    };

    const filteredTasks = tasks.filter(t => filterStatus === 'all' || t.status === filterStatus);

    if (filteredTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">No tasks to show</p>
                <p className="text-xs text-gray-400 mt-1">Add a task using the + button below</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {filteredTasks.map(task => {
                const daysLeft = getDaysLeft(task.scheduledDate);
                const isToday = daysLeft === 0;
                const isOverdue = daysLeft < 0;
                const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;

                let daysLeftText = '';
                if (task.status !== 'completed') {
                    if (isToday) daysLeftText = 'Due Today';
                    else if (daysLeft === 1) daysLeftText = '1 day left';
                    else if (daysLeft > 1) daysLeftText = `${daysLeft} days left`;
                    else if (isOverdue) daysLeftText = `${Math.abs(daysLeft)}d overdue`;
                }

                return (
                    <div
                        key={task._id}
                        className={`rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden transition-all`}
                    >
                        {/* Status accent bar */}
                        <div className={`h-0.5 w-full ${
                            task.status === 'completed' ? 'bg-green-400' :
                            task.status === 'missed'    ? 'bg-red-400' :
                            task.status === 'due'       ? 'bg-amber-400' : 'bg-blue-400'
                        }`} />

                        {editingTask === task._id ? (
                            /* ── EDIT FORM ── */
                            <form onSubmit={(e) => handleEditSubmit(e, task._id)} className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-gray-800">Edit Task</p>
                                    <button type="button" onClick={() => setEditingTask(null)} className="p-1 rounded-lg hover:bg-white/60 text-gray-400 cursor-pointer">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    name="title"
                                    defaultValue={task.title}
                                    placeholder="Title"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <textarea
                                    name="description"
                                    defaultValue={task.description}
                                    placeholder="Description"
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                                <div className="flex gap-2">
                                    <input
                                        name="scheduledDate"
                                        type="date"
                                        defaultValue={task.scheduledDate ? task.scheduledDate.slice(0, 10) : ''}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <input
                                        name="duration"
                                        type="number"
                                        defaultValue={task.duration}
                                        placeholder="mins"
                                        className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-blue-700 transition-all cursor-pointer">
                                    Save Changes
                                </button>
                            </form>
                        ) : (
                            /* ── TASK VIEW ── */
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold text-gray-900 text-sm leading-tight ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                                            {task.title}
                                        </h3>
                                        {task.description && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
                                        )}
                                    </div>
                                    {/* Status badge */}
                                    <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg ${cfg.color} ${task.status === 'completed' ? 'bg-green-100' : task.status === 'missed' ? 'bg-red-100' : task.status === 'due' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Meta */}
                                <div className="flex items-center gap-3 mt-2.5">
                                    {task.scheduledDate && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            {task.scheduledDate.slice(0, 10)}
                                        </div>
                                    )}
                                    {task.duration && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Timer className="w-3 h-3" />
                                            {task.duration} min
                                        </div>
                                    )}
                                    {daysLeftText && (
                                        <div className={`flex items-center gap-1 text-xs font-semibold ${
                                            isToday ? 'text-amber-600' : isOverdue ? 'text-red-500' : 'text-gray-500'
                                        }`}>
                                            <AlertCircle className="w-3 h-3" />
                                            {daysLeftText}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-black/5">
                                    <button
                                        onClick={() => handleDelete(task._id)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                    <button
                                        onClick={() => setEditingTask(task._id)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-white/60 transition-all cursor-pointer"
                                    >
                                        <PenLine className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    {task.status !== 'completed' && (
                                        <button
                                            onClick={() => handleComplete(task._id)}
                                            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 transition-all cursor-pointer"
                                        >
                                            <Check className="w-3.5 h-3.5" /> Mark Done
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Task;