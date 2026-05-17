import { Calendar, Clock, Trash2 } from 'lucide-react';

const TimetableCard = ({ timetable, onSelect, onDelete }) => {
    const periodCount = timetable.periods?.length || 0;
    const dayCount = timetable.activeDays?.length || 0;
    const catColors = (timetable.categories || []).slice(0, 5);

    return (
        <div
            onClick={() => onSelect(timetable)}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group relative"
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-lg">{timetable.name}</h3>
                <button
                    onClick={e => { e.stopPropagation(); onDelete(timetable._id); }}
                    className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {dayCount} days</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {periodCount} periods</span>
            </div>

            {/* Day pills */}
            <div className="flex flex-wrap gap-1 mb-3">
                {(timetable.activeDays || []).map(d => (
                    <span key={d} className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">{d.slice(0, 3)}</span>
                ))}
            </div>

            {/* Category dots */}
            {catColors.length > 0 && (
                <div className="flex gap-1.5">
                    {catColors.map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: c.color }}>
                            {c.icon || ''}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimetableCard;
