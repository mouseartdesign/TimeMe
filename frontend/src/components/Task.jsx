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
    const [timetables, setTimetables] = useState([]);

    // Edit fields state
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [editReminderBefore, setEditReminderBefore] = useState(5);
    const [editTimetableId, setEditTimetableId] = useState('');
    const [editIsRecurring, setEditIsRecurring] = useState(false);
    const [editFrequency, setEditFrequency] = useState('daily');
    const [editCustomInterval, setEditCustomInterval] = useState(1);
    const [editCustomType, setEditCustomType] = useState('days');
    const [editCustomDaysOfWeek, setEditCustomDaysOfWeek] = useState([]);
    const [editCustomDayOfMonth, setEditCustomDayOfMonth] = useState('');

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

    useEffect(() => {
        const fetchTimetables = async () => {
            try {
                const res = await api.get('/api/timetables?all=true');
                if (res.status === 200) setTimetables(res.data);
            } catch (err) {
                console.error('Error fetching timetables:', err);
            }
        };
        fetchTimetables();
    }, []);

    const startEditing = (task) => {
        setEditingTask(task._id);
        setEditStartTime(task.startTime || '');
        setEditEndTime(task.endTime || '');
        setEditReminderBefore(task.reminderBefore !== undefined ? task.reminderBefore : 5);
        setEditTimetableId(task.timetableId || '');
        setEditIsRecurring(task.isRecurring || false);
        setEditFrequency(task.recurrenceRule?.frequency || 'daily');
        setEditCustomInterval(task.recurrenceRule?.interval || 1);
        setEditCustomType(task.recurrenceRule?.customType || 'days');
        setEditCustomDaysOfWeek(task.recurrenceRule?.daysOfWeek || []);
        setEditCustomDayOfMonth(task.recurrenceRule?.dayOfMonth !== undefined ? task.recurrenceRule.dayOfMonth : '');
    };

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
            taskDate: e.target.scheduledDate.value,
            startTime: editStartTime || undefined,
            endTime: editEndTime || undefined,
            reminderBefore: editReminderBefore !== '' ? Number(editReminderBefore) : 5,
            timetableId: editTimetableId || null,
            isRecurring: editIsRecurring,
            recurrenceRule: editIsRecurring ? {
                frequency: editFrequency,
                interval: editFrequency === 'custom' ? Number(editCustomInterval) : 1,
                daysOfWeek: editFrequency === 'custom' && editCustomType === 'weeks' ? editCustomDaysOfWeek : [],
                dayOfMonth: editFrequency === 'custom' && editCustomDayOfMonth !== '' ? Number(editCustomDayOfMonth) : undefined,
                customType: editFrequency === 'custom' ? editCustomType : 'days'
            } : undefined
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
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={editStartTime}
                                            onChange={(e) => setEditStartTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={editEndTime}
                                            onChange={(e) => setEditEndTime(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Reminder (mins before)</label>
                                        <input
                                            type="number"
                                            value={editReminderBefore}
                                            onChange={(e) => setEditReminderBefore(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Link Timetable</label>
                                        <select
                                            value={editTimetableId}
                                            onChange={(e) => setEditTimetableId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">None (Global)</option>
                                            {timetables.map(t => (
                                                <option key={t._id} value={t._id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 pt-2">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <input
                                            type="checkbox"
                                            id={`editIsRecurring-${task._id}`}
                                            checked={editIsRecurring}
                                            onChange={(e) => setEditIsRecurring(e.target.checked)}
                                            className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <label htmlFor={`editIsRecurring-${task._id}`} className="text-[10px] font-bold text-gray-700 uppercase tracking-wider cursor-pointer">Repeat Task</label>
                                    </div>
                                    {editIsRecurring && (
                                        <div className="flex flex-col gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Frequency</label>
                                                <select
                                                    value={editFrequency}
                                                    onChange={(e) => setEditFrequency(e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs bg-white text-gray-900"
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="custom">Custom</option>
                                                </select>
                                            </div>
                                            {editFrequency === 'custom' && (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-1.5">
                                                        <div className="flex-1">
                                                            <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Every</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={editCustomInterval}
                                                                onChange={(e) => setEditCustomInterval(Number(e.target.value))}
                                                                className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs bg-white text-gray-900"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Unit</label>
                                                            <select
                                                                value={editCustomType}
                                                                onChange={(e) => setEditCustomType(e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs bg-white text-gray-900"
                                                            >
                                                                <option value="days">Day(s)</option>
                                                                <option value="weeks">Week(s)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    {editCustomType === 'weeks' && (
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-500 mb-0.5">On Weekdays</label>
                                                            <div className="flex flex-wrap gap-1">
                                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                                    <button
                                                                        type="button"
                                                                        key={day}
                                                                        onClick={() => {
                                                                            if (editCustomDaysOfWeek.includes(day)) {
                                                                                setEditCustomDaysOfWeek(editCustomDaysOfWeek.filter(d => d !== day));
                                                                            } else {
                                                                                setEditCustomDaysOfWeek([...editCustomDaysOfWeek, day]);
                                                                            }
                                                                        }}
                                                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                                                                            editCustomDaysOfWeek.includes(day)
                                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                                        }`}
                                                                    >
                                                                        {day.slice(0, 3)}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Specific Day of Month (Optional)</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="31"
                                                            value={editCustomDayOfMonth}
                                                            onChange={(e) => setEditCustomDayOfMonth(e.target.value)}
                                                            placeholder="e.g. 15"
                                                            className="w-full px-2 py-1 border border-gray-200 rounded-md text-xs bg-white text-gray-900"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                    {task.scheduledDate && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            {task.scheduledDate.slice(0, 10)}
                                        </div>
                                    )}
                                    {task.startTime && (
                                        <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                                            <Clock className="w-3 h-3" />
                                            {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
                                        </div>
                                    )}
                                    {task.duration && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Timer className="w-3 h-3" />
                                            {task.duration} min
                                        </div>
                                    )}
                                    {task.isRecurring && (
                                        <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                                            <span>Repeat:</span>
                                            <span className="capitalize">{task.recurrenceRule?.frequency}</span>
                                        </div>
                                    )}
                                    {task.timetableId && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                                            <span>Timetable:</span>
                                            <span className="font-medium">{timetables.find(t => t._id === task.timetableId)?.name || 'Linked'}</span>
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
                                        onClick={() => startEditing(task)}
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