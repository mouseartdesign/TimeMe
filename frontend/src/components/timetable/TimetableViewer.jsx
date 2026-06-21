import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableViewer = ({ timetable, onBack }) => {
    const { name, activeDays, periods, categories, schedule } = timetable;

    // Default to today's day if it's in activeDays, otherwise fall back to index 0
    const todayName = FULL_DAYS[new Date().getDay()];
    const todayIndex = activeDays.indexOf(todayName);
    const [dayIndex, setDayIndex] = useState(todayIndex >= 0 ? todayIndex : 0);
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');

    const currentDay = activeDays[dayIndex];
    const sortedPeriods = [...periods].sort((a, b) => a.order - b.order);

    const fmtTime = (t) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    const getEntry = (day, periodId) => schedule.find(s => s.day === day && s.periodId === periodId);

    const filteredPeriods = sortedPeriods.filter(period => {
        if (selectedCategoryId === 'all') return true;
        const entry = getEntry(currentDay, period.id);
        if (selectedCategoryId === 'free') return !entry;
        return entry?.categoryId === selectedCategoryId;
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                {onBack && (
                    <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                )}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                    <p className="text-sm text-gray-500">{activeDays.length} days · {periods.length} periods</p>
                </div>
            </div>

            {/* Day Switcher */}
            <div className="flex items-center justify-center gap-3">
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
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

            {/* Full Day heading */}
            <h3 className="text-center text-lg font-bold text-gray-800">{currentDay}</h3>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 items-center justify-center border-b border-gray-100 pb-4">
                <button
                    onClick={() => setSelectedCategoryId('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                        selectedCategoryId === 'all'
                            ? 'bg-blue-600 border-transparent text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    All
                </button>
                {categories.map(c => (
                    <button
                        key={c.id}
                        onClick={() => setSelectedCategoryId(c.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                            selectedCategoryId === c.id
                                ? 'text-white shadow-sm border-transparent'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                        style={selectedCategoryId === c.id ? { backgroundColor: c.color } : {}}
                    >
                        {c.icon && <span>{c.icon}</span>}
                        {c.name}
                    </button>
                ))}
                <button
                    onClick={() => setSelectedCategoryId('free')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                        selectedCategoryId === 'free'
                            ? 'bg-gray-600 border-transparent text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    Free Slots
                </button>
            </div>

            {/* Schedule Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPeriods.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white border border-gray-150 rounded-2xl">
                        <p className="text-sm text-gray-400 italic">No periods match the selected filter.</p>
                    </div>
                ) : (
                    filteredPeriods.map(period => {
                        const entry = getEntry(currentDay, period.id);
                        const cat = entry ? categories.find(c => c.id === entry.categoryId) : null;

                        return (
                            <div
                                key={period.id}
                                className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
                                style={cat ? { borderColor: cat.color + '30' } : { borderColor: '#e5e7eb' }}
                            >
                                {/* Color accent bar */}
                                <div className="h-1.5" style={{ backgroundColor: cat ? cat.color : '#e5e7eb' }} />

                                <div className="p-4 flex flex-col gap-2.5">
                                    {/* Top row: time + period name */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{period.name}</span>
                                        <div className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                                            <span className="text-[11px] font-semibold text-gray-600">{fmtTime(period.startTime)}</span>
                                            <span className="text-[10px] text-gray-400">–</span>
                                            <span className="text-[11px] font-semibold text-gray-600">{fmtTime(period.endTime)}</span>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    {cat ? (
                                        <div className="flex items-center gap-2">
                                            {cat.icon && <span className="text-xl">{cat.icon}</span>}
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-gray-900">{cat.name}</span>
                                                {entry?.label && (
                                                    <span className="text-xs text-gray-500 mt-0.5">{entry.label}</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 py-1">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-400 text-sm">—</span>
                                            </div>
                                            <span className="text-xs text-gray-400 italic">Free slot</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-2 pt-2">
                {categories.map(c => (
                    <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: c.color }}>
                        {c.icon && <span>{c.icon}</span>} {c.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimetableViewer;
