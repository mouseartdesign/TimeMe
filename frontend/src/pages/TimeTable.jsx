import { useState, useEffect } from 'react';
import api from '../config/api';
import Navbar from '../components/Navbar';
import Footbar from '../components/footbar';
import TimetableWizard from '../components/timetable/TimetableWizard';
import TimetableViewer from '../components/timetable/TimetableViewer';
import { Plus, Calendar, RefreshCw, Trash2, Pencil } from 'lucide-react';

const TimeTable = () => {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timetables, setTimetables] = useState([]);
    const [selectedTimetableId, setSelectedTimetableId] = useState('');

    const fetchTimetables = async (selectId = null) => {
        try {
            const res = await api.get('/api/timetables?all=true');
            setTimetables(res.data);
            if (res.data.length > 0) {
                let activeId = selectId;
                if (!activeId) {
                    const defaultTable = res.data.find(t => t.isDefault);
                    activeId = defaultTable ? defaultTable._id : res.data[0]._id;
                }
                setSelectedTimetableId(activeId);
                const activeTable = res.data.find(t => t._id === activeId);
                setTimetable(activeTable || null);
            } else {
                setSelectedTimetableId('');
                setTimetable(null);
            }
        } catch (err) {
            console.error('Failed to fetch timetables:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTimetables(); }, []);

    const handleSelectChange = (id) => {
        setSelectedTimetableId(id);
        const activeTable = timetables.find(t => t._id === id);
        setTimetable(activeTable || null);
    };

    const handleSetDefault = async () => {
        if (!selectedTimetableId) return;
        try {
            await api.put(`/api/timetables/${selectedTimetableId}/default`);
            await fetchTimetables(selectedTimetableId);
            alert('Homepage default timetable updated!');
        } catch (err) {
            console.error('Failed to set default:', err);
        }
    };

    const handleSaved = (saved) => {
        fetchTimetables(saved._id);
    };

    const handleDelete = async () => {
        if (!selectedTimetableId) return;
        if (!confirm('Delete this timetable? This cannot be undone.')) return;
        try {
            await api.delete(`/api/timetables/${selectedTimetableId}`);
            await fetchTimetables();
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    return (
        <>
            <Navbar />
            <div className="bg-gray-50 w-full min-h-screen pb-20">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                    ) : timetable ? (
                        <>
                            {/* Timetable Switcher */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                            style={{ backgroundColor: timetable ? timetable.color + '22' : '#f3f4f6' }}
                                        >
                                            {timetable?.icon || '📅'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h1 className="text-lg font-bold text-gray-900">{timetable?.name || 'My Timetable'}</h1>
                                                {timetable?.isDefault && (
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">Switch or manage your timetables below</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={selectedTimetableId}
                                            onChange={(e) => handleSelectChange(e.target.value)}
                                            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            {timetables.map(t => (
                                                <option key={t._id} value={t._id}>{t.name} {t.isDefault ? '(Default)' : ''}</option>
                                            ))}
                                        </select>
                                        {!timetable?.isDefault && (
                                            <button
                                                onClick={handleSetDefault}
                                                className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                            >
                                                Set Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions bar */}
                            <div className="flex justify-end gap-2 mb-4">
                                <button
                                    onClick={() => { setEditMode(true); setIsWizardOpen(true); }}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all cursor-pointer"
                                >
                                    <Pencil className="w-4 h-4" /> Edit Schedule
                                </button>
                                <button
                                    onClick={() => { setEditMode(false); setIsWizardOpen(true); }}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
                                >
                                    <RefreshCw className="w-4 h-4" /> New
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                            <TimetableViewer timetable={timetable} onBack={null} />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                                <Calendar className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">No timetable yet</h3>
                            <p className="text-sm text-gray-500 mb-6">Create your timetable to get started.</p>
                            <button
                                onClick={() => setIsWizardOpen(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Create Timetable
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isWizardOpen && (
                <TimetableWizard
                    onClose={() => { setIsWizardOpen(false); setEditMode(false); }}
                    onSaved={handleSaved}
                    initialData={editMode && timetable ? {
                        _id: timetable._id,
                        name: timetable.name,
                        activeDays: timetable.activeDays,
                        periods: timetable.periods,
                        categories: timetable.categories,
                        schedule: timetable.schedule || [],
                        icon: timetable.icon,
                        color: timetable.color,
                        isDefault: timetable.isDefault
                    } : null}
                    initialStep={editMode && timetable ? 3 : 0}
                />
            )}

            <Footbar />
        </>
    );
};

export default TimeTable;