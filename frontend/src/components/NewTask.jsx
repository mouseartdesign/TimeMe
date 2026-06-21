import { useState, useEffect } from 'react';
import api from '../config/api';
import { X, FileText, Calendar, Clock, AlignLeft } from 'lucide-react';

const NewTask = ({ onClose, onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [duration, setDuration] = useState(30);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [reminderBefore, setReminderBefore] = useState(5);
    const [timetableId, setTimetableId] = useState('');
    const [timetables, setTimetables] = useState([]);
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState('daily');
    const [customInterval, setCustomInterval] = useState(1);
    const [customType, setCustomType] = useState('days');
    const [customDaysOfWeek, setCustomDaysOfWeek] = useState([]);
    const [customDayOfMonth, setCustomDayOfMonth] = useState('');

    useEffect(() => {
        const fetchTimetables = async () => {
            try {
                const res = await api.get('/api/timetables?all=true');
                if (res.status === 200) {
                    setTimetables(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch timetables:', err);
            }
        };
        fetchTimetables();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newTask = {
                title,
                description,
                scheduledDate,
                duration,
                taskDate: scheduledDate,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                reminderBefore: reminderBefore !== '' ? Number(reminderBefore) : 5,
                timetableId: timetableId || null,
                isRecurring,
                recurrenceRule: isRecurring ? {
                    frequency,
                    interval: frequency === 'custom' ? Number(customInterval) : 1,
                    daysOfWeek: frequency === 'custom' && customType === 'weeks' ? customDaysOfWeek : [],
                    dayOfMonth: frequency === 'custom' && customDayOfMonth !== '' ? Number(customDayOfMonth) : undefined,
                    customType: frequency === 'custom' ? customType : 'days'
                } : undefined
            };
            const response = await api.post('/api/tasks', newTask);
            if (response.status === 201) {
                onTaskAdded(response.data);
                onClose();
            }
        } catch (error) {
            console.error('Error posting task:', error);
            alert('Failed to add task.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">New Task</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Task title..."
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description..."
                                rows={3}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Duration</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="mins"
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Start Time and End Time */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End Time (Opt)</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reminder and Timetable Link */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reminder (mins before)</label>
                            <input
                                type="number"
                                value={reminderBefore}
                                onChange={(e) => setReminderBefore(e.target.value)}
                                placeholder="5"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Link Timetable</label>
                            <select
                                value={timetableId}
                                onChange={(e) => setTimetableId(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">None (Global)</option>
                                {timetables.map(t => (
                                    <option key={t._id} value={t._id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Recurrence Selector */}
                    <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                id="isRecurring"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="isRecurring" className="text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer">Repeat Task</label>
                        </div>
                        {isRecurring && (
                            <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 mt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Frequency</label>
                                    <select
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                {frequency === 'custom' && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Every</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={customInterval}
                                                    onChange={(e) => setCustomInterval(Number(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">Unit</label>
                                                <select
                                                    value={customType}
                                                    onChange={(e) => setCustomType(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
                                                >
                                                    <option value="days">Day(s)</option>
                                                    <option value="weeks">Week(s)</option>
                                                </select>
                                            </div>
                                        </div>
                                        {customType === 'weeks' && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 mb-1">On Weekdays</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                        <button
                                                            type="button"
                                                            key={day}
                                                            onClick={() => {
                                                                if (customDaysOfWeek.includes(day)) {
                                                                    setCustomDaysOfWeek(customDaysOfWeek.filter(d => d !== day));
                                                                } else {
                                                                    setCustomDaysOfWeek([...customDaysOfWeek, day]);
                                                                }
                                                            }}
                                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                                                customDaysOfWeek.includes(day)
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
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Specific Day of Month (Optional)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={customDayOfMonth}
                                                onChange={(e) => setCustomDayOfMonth(e.target.value)}
                                                placeholder="e.g. 15"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/25 mt-1 cursor-pointer"
                    >
                        Add Task
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewTask;
