import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const StepPreview = ({ data, onUpdate, onBack, onSave, saving }) => {
    const { name, activeDays, periods, categories, schedule: initSchedule } = data;
    const [schedule, setSchedule] = useState(initSchedule || []);
    const [dayIndex, setDayIndex] = useState(0);
    const currentDay = activeDays[dayIndex];

    const fmtTime = (t) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    const getEntry = (day, periodId) => schedule.find(s => s.day === day && s.periodId === periodId);

    const assignCategory = (day, periodId, categoryId) => {
        setSchedule(prev => {
            const existing = prev.findIndex(s => s.day === day && s.periodId === periodId);
            if (categoryId === '') {
                return existing >= 0 ? prev.filter((_, i) => i !== existing) : prev;
            }
            const oldLabel = existing >= 0 ? prev[existing].label : '';
            const entry = { day, periodId, categoryId, label: oldLabel };
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = entry;
                return updated;
            }
            return [...prev, entry];
        });
    };

    const updateLabel = (day, periodId, label) => {
        setSchedule(prev => prev.map(s =>
            s.day === day && s.periodId === periodId ? { ...s, label } : s
        ));
    };

    const handleSave = () => {
        onUpdate({ schedule });
        onSave({ ...data, schedule });
    };

    const sortedPeriods = [...periods].sort((a, b) => a.order - b.order);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Preview & Assign</h2>
                <p className="text-gray-500 text-sm">Click slots to assign categories. Navigate between days.</p>
            </div>

            {/* Day Switcher */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => setDayIndex(Math.max(0, dayIndex - 1))}
                    disabled={dayIndex === 0}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-default"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                    {activeDays.map((day, i) => (
                        <button
                            key={day}
                            onClick={() => setDayIndex(i)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                i === dayIndex
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setDayIndex(Math.min(activeDays.length - 1, dayIndex + 1))}
                    disabled={dayIndex === activeDays.length - 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-default"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Schedule Grid */}
            <div className="flex flex-col gap-2">
                {sortedPeriods.map(period => {
                    const entry = getEntry(currentDay, period.id);
                    const cat = entry ? categories.find(c => c.id === entry.categoryId) : null;

                    return (
                        <div key={period.id} className="flex items-stretch gap-3">
                            {/* Time Label */}
                            <div className="w-28 flex-shrink-0 flex flex-col justify-center text-right pr-3 border-r-2 border-gray-200">
                                <span className="text-xs font-bold text-gray-700">{fmtTime(period.startTime)}</span>
                                <span className="text-[10px] text-gray-400">{fmtTime(period.endTime)}</span>
                            </div>

                            {/* Slot */}
                            <div className="flex-1 relative group">
                                <div
                                    className="p-4 rounded-xl border-2 transition-all min-h-[64px] flex flex-col gap-2"
                                    style={cat ? {
                                        borderColor: cat.color + '40',
                                        backgroundColor: cat.color + '10'
                                    } : {
                                        borderColor: '#e5e7eb',
                                        backgroundColor: '#fafafa'
                                    }}
                                >
                                    {cat ? (
                                        <>
                                            <div className="flex items-center gap-2 flex-1">
                                                {cat.icon && <span className="text-lg">{cat.icon}</span>}
                                                <span className="font-semibold text-sm text-gray-900">{cat.name}</span>
                                                <span className="text-xs text-gray-400 ml-auto">{period.name}</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={entry?.label || ''}
                                                onChange={e => updateLabel(currentDay, period.id, e.target.value)}
                                                placeholder="Add a note..."
                                                className="w-full text-xs px-2 py-1.5 rounded-lg bg-white/60 border border-gray-200 text-gray-600 placeholder-gray-400 outline-none focus:border-blue-400 transition-all"
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">{period.name} — Empty</span>
                                    )}
                                </div>

                                {/* Dropdown on hover */}
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <select
                                        value={entry?.categoryId || ''}
                                        onChange={e => assignCategory(currentDay, period.id, e.target.value)}
                                        className="text-xs px-2 py-1 rounded-lg border border-gray-300 bg-white outline-none cursor-pointer shadow-sm"
                                    >
                                        <option value="">— None —</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap gap-2 pt-2">
                {categories.map(c => (
                    <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: c.color }}>
                        {c.icon && <span>{c.icon}</span>} {c.name}
                    </div>
                ))}
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={onBack} className="px-6 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer">← Back</button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-600/30 cursor-pointer disabled:opacity-60"
                >
                    {saving ? 'Saving...' : '✓ Save Timetable'}
                </button>
            </div>
        </div>
    );
};

export default StepPreview;
