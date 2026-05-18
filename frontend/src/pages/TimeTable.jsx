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

    const fetchTimetable = async () => {
        try {
            const res = await api.get('/api/timetables');
            setTimetable(res.data);
        } catch (err) {
            console.error('Failed to fetch timetable:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTimetable(); }, []);

    const handleSaved = (saved) => {
        setTimetable(saved);
    };

    const handleDelete = async () => {
        if (!confirm('Delete your timetable? This cannot be undone.')) return;
        try {
            await api.delete('/api/timetables');
            setTimetable(null);
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
                        name: timetable.name,
                        activeDays: timetable.activeDays,
                        periods: timetable.periods,
                        categories: timetable.categories,
                        schedule: timetable.schedule || []
                    } : null}
                    initialStep={editMode && timetable ? 3 : 0}
                />
            )}

            <Footbar />
        </>
    );
};

export default TimeTable;