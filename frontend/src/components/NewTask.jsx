import { useState } from 'react';
import api from '../config/api';
import { X, FileText, Calendar, Clock, AlignLeft } from 'lucide-react';

const NewTask = ({ onClose, onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [duration, setDuration] = useState(30);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newTask = { title, description, scheduledDate, duration };
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
