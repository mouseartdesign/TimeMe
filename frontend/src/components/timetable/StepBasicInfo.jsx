import { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PRESET_COLORS = ['#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#14B8A6', '#EC4899', '#6366F1'];
const PRESET_ICONS = ['📅', '🎓', '💼', '🏋️', '🎨', '🎵', '🏠', '🚀'];

const StepBasicInfo = ({ data, onUpdate, onNext }) => {
    const [name, setName] = useState(data.name || '');
    const [activeDays, setActiveDays] = useState(data.activeDays || []);
    const [icon, setIcon] = useState(data.icon || PRESET_ICONS[0]);
    const [color, setColor] = useState(data.color || PRESET_COLORS[0]);

    const toggleDay = (day) => {
        setActiveDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleContinue = () => {
        if (!name.trim()) return alert('Please enter a timetable name');
        if (activeDays.length === 0) return alert('Select at least one day');
        onUpdate({ name: name.trim(), activeDays, icon, color });
        onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Your Timetable</h2>
                <p className="text-gray-500 text-sm">Give it a name and pick your active days.</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Timetable Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. College Schedule, Work Week"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                    {PRESET_ICONS.map(i => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setIcon(i)}
                            className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer border ${
                                icon === i ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                        >
                            {i}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color Theme</label>
                <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                                color === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Active Days</label>
                <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                                activeDays.includes(day)
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleContinue}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                >
                    Continue →
                </button>
            </div>
        </div>
    );
};

export default StepBasicInfo;
