import { useState, useRef } from 'react';
import { GripVertical, Trash2, Plus, AlertTriangle } from 'lucide-react';

const StepPeriods = ({ data, onUpdate, onNext, onBack }) => {
    const [periods, setPeriods] = useState(
        data.periods?.length > 0
            ? data.periods
            : [{ id: crypto.randomUUID(), name: 'Period 1', startTime: '08:00', endTime: '08:45', order: 0 }]
    );
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const addPeriod = () => {
        const last = periods[periods.length - 1];
        let start = '09:00';
        if (last) {
            const [h, m] = last.endTime.split(':').map(Number);
            const nm = m + 15;
            start = `${String(Math.floor((h * 60 + nm) / 60)).padStart(2, '0')}:${String((h * 60 + nm) % 60).padStart(2, '0')}`;
        }
        const [sh, sm] = start.split(':').map(Number);
        const endMin = sh * 60 + sm + 45;
        const end = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
        setPeriods([...periods, {
            id: crypto.randomUUID(),
            name: `Period ${periods.length + 1}`,
            startTime: start,
            endTime: end,
            order: periods.length
        }]);
    };

    const updatePeriod = (id, field, value) => {
        setPeriods(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const removePeriod = (id) => {
        if (periods.length <= 1) return;
        setPeriods(prev => prev.filter(p => p.id !== id));
    };

    const handleDragStart = (index) => { dragItem.current = index; };
    const handleDragEnter = (index) => { dragOverItem.current = index; };
    const handleDragEnd = () => {
        const items = [...periods];
        const [dragged] = items.splice(dragItem.current, 1);
        items.splice(dragOverItem.current, 0, dragged);
        setPeriods(items.map((p, i) => ({ ...p, order: i })));
        dragItem.current = null;
        dragOverItem.current = null;
    };

    // Validation
    const getConflicts = () => {
        const issues = [];
        periods.forEach((p, i) => {
            const s = toMin(p.startTime), e = toMin(p.endTime);
            if (e <= s) issues.push({ id: p.id, msg: `${p.name}: end time must be after start` });
            periods.forEach((q, j) => {
                if (i >= j) return;
                const qs = toMin(q.startTime), qe = toMin(q.endTime);
                if (s < qe && e > qs) issues.push({ id: p.id, id2: q.id, msg: `${p.name} overlaps with ${q.name}` });
            });
        });
        return issues;
    };
    const conflicts = getConflicts();
    const conflictIds = new Set(conflicts.flatMap(c => [c.id, c.id2].filter(Boolean)));

    const fmtTime = (t) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    const handleContinue = () => {
        if (conflicts.length > 0) return alert('Fix period conflicts before continuing.');
        if (periods.length === 0) return alert('Add at least one period.');
        onUpdate({ periods: periods.map((p, i) => ({ ...p, order: i })) });
        onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Build Periods</h2>
                <p className="text-gray-500 text-sm">Add and arrange your class or session periods.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Period List */}
                <div className="flex-1 flex flex-col gap-3">
                    {periods.map((p, idx) => (
                        <div
                            key={p.id}
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragEnter={() => handleDragEnter(idx)}
                            onDragEnd={handleDragEnd}
                            onDragOver={e => e.preventDefault()}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all bg-white ${
                                conflictIds.has(p.id) ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab flex-shrink-0" />
                            <input
                                type="text"
                                value={p.name}
                                onChange={e => updatePeriod(p.id, 'name', e.target.value)}
                                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 transition-all"
                                placeholder="Period name"
                            />
                            <input
                                type="time"
                                value={p.startTime}
                                onChange={e => updatePeriod(p.id, 'startTime', e.target.value)}
                                className="px-2 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 outline-none focus:border-blue-500 transition-all"
                            />
                            <span className="text-gray-400 text-xs">to</span>
                            <input
                                type="time"
                                value={p.endTime}
                                onChange={e => updatePeriod(p.id, 'endTime', e.target.value)}
                                className="px-2 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 outline-none focus:border-blue-500 transition-all"
                            />
                            <button onClick={() => removePeriod(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addPeriod}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-semibold cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Period
                    </button>
                </div>

                {/* Preview */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="sticky top-0 bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Live Preview</h3>
                        <div className="flex flex-col gap-2">
                            {periods.length === 0 && <p className="text-xs text-gray-400 italic">No periods yet</p>}
                            {periods.map(p => (
                                <div key={p.id} className={`text-xs p-2.5 rounded-lg border ${conflictIds.has(p.id) ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-700'}`}>
                                    <div className="font-semibold">{p.name}</div>
                                    <div className="text-[11px] mt-0.5 opacity-70">{fmtTime(p.startTime)} – {fmtTime(p.endTime)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {conflicts.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700">{conflicts.map(c => c.msg).join('. ')}</div>
                </div>
            )}

            <div className="flex justify-between pt-4">
                <button onClick={onBack} className="px-6 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer">← Back</button>
                <button onClick={handleContinue} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 cursor-pointer">Continue →</button>
            </div>
        </div>
    );
};

function toMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; }

export default StepPeriods;
