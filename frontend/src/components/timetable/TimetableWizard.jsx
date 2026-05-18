import { useState } from 'react';
import { X } from 'lucide-react';
import StepBasicInfo from './StepBasicInfo';
import StepPeriods from './StepPeriods';
import StepCategories from './StepCategories';
import StepPreview from './StepPreview';

const STEPS = ['Info', 'Periods', 'Categories', 'Preview'];

const TimetableWizard = ({ onClose, onSaved, initialData, initialStep }) => {
    const [step, setStep] = useState(initialStep || 0);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState(initialData || {
        name: '',
        activeDays: [],
        periods: [],
        categories: [],
        schedule: []
    });

    const updateData = (partial) => setData(prev => ({ ...prev, ...partial }));

    const handleSave = async (finalData) => {
        setSaving(true);
        try {
            const payload = {
                name: finalData.name,
                activeDays: finalData.activeDays,
                periods: finalData.periods.map(p => ({
                    id: p.id,
                    name: p.name,
                    startTime: p.startTime,
                    endTime: p.endTime,
                    order: p.order
                })),
                categories: finalData.categories.map(c => ({
                    id: c.id,
                    name: c.name,
                    color: c.color,
                    icon: c.icon
                })),
                schedule: finalData.schedule.map(s => ({
                    day: s.day,
                    periodId: s.periodId,
                    categoryId: s.categoryId,
                    label: s.label
                }))
            };

            const api = (await import('../../config/api')).default;
            const res = await api.post('/api/timetables', payload);
            if (res.status === 201) {
                onSaved(res.data);
                onClose();
            }
        } catch (err) {
            console.error('Error saving timetable:', err);
            alert('Failed to save timetable. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    {/* Stepper */}
                    <div className="flex items-center gap-2">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    i < step ? 'bg-green-500 text-white' :
                                    i === step ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' :
                                    'bg-gray-200 text-gray-500'
                                }`}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <span className={`text-xs font-semibold hidden sm:block ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
                                {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {step === 0 && <StepBasicInfo data={data} onUpdate={updateData} onNext={() => setStep(1)} />}
                    {step === 1 && <StepPeriods data={data} onUpdate={updateData} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
                    {step === 2 && <StepCategories data={data} onUpdate={updateData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                    {step === 3 && <StepPreview data={data} onUpdate={updateData} onBack={() => setStep(2)} onSave={handleSave} saving={saving} />}
                </div>
            </div>
        </div>
    );
};

export default TimetableWizard;
