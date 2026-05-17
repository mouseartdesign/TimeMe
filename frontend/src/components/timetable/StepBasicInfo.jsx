import { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const StepBasicInfo = ({ data, onUpdate, onNext }) => {
    const [name, setName] = useState(data.name || '');
    const [activeDays, setActiveDays] = useState(data.activeDays || []);

    const toggleDay = (day) => {
        setActiveDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleContinue = () => {
        if (!name.trim()) return alert('Please enter a timetable name');
        if (activeDays.length === 0) return alert('Select at least one day');
        onUpdate({ name: name.trim(), activeDays });
        onNext();
    };

    return (
        <div className="flex flex-col gap-8">
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">Active Days</label>
                <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                        <button
                            key={day}
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
