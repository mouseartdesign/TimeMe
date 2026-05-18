import { useState, useEffect } from 'react';
import api from '../../config/api';
import { Clock, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const fmtTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

const TodaySchedule = () => {
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/api/timetables');
                setTimetable(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading || !timetable) return null;

    const today = DAYS[new Date().getDay()];
    if (!timetable.activeDays.includes(today)) return null;

    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const sortedPeriods = [...timetable.periods].sort((a, b) => a.order - b.order);
    const upcoming = sortedPeriods.filter(p => toMin(p.endTime) > nowMin);

    if (upcoming.length === 0) return null;

    const getEntry = (periodId) =>
        (timetable.schedule || []).find(s => s.day === today && s.periodId === periodId);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-gray-900">Today's Schedule</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">{upcoming.length} upcoming</span>
                    <button
                        onClick={() => navigate('/timetable')}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-all cursor-pointer"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Period cards */}
            <div className="divide-y divide-gray-50">
                {upcoming.map(period => {
                    const entry = getEntry(period.id);
                    const cat = entry ? timetable.categories.find(c => c.id === entry.categoryId) : null;
                    const isNow = toMin(period.startTime) <= nowMin && toMin(period.endTime) > nowMin;

                    return (
                        <div
                            key={period.id}
                            className={`flex items-center gap-3 px-5 py-3 transition-all ${isNow ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                        >
                            {/* Color dot / icon */}
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                                style={{ backgroundColor: cat ? cat.color + '22' : '#f3f4f6' }}
                            >
                                {cat?.icon || <Clock className="w-4 h-4 text-gray-400" />}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900 truncate">
                                        {cat ? cat.name : period.name}
                                    </span>
                                    {isNow && (
                                        <span className="flex-shrink-0 px-1.5 py-0.5 bg-blue-600 rounded-md text-[10px] font-bold text-white uppercase tracking-wide">
                                            Now
                                        </span>
                                    )}
                                </div>
                                {entry?.label && (
                                    <p className="text-xs text-gray-400 truncate mt-0.5">{entry.label}</p>
                                )}
                            </div>

                            {/* Time */}
                            <div className="text-right flex-shrink-0">
                                <div className="text-xs font-semibold text-gray-700">{fmtTime(period.startTime)}</div>
                                <div className="text-[10px] text-gray-400">{fmtTime(period.endTime)}</div>
                            </div>

                            {/* Left accent */}
                            {isNow && (
                                <div
                                    className="absolute left-0 w-0.5 h-8 rounded-r-full bg-blue-500"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TodaySchedule;
