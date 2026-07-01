import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const PRESET_COLORS = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
    '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#6366F1',
    '#A855F7', '#F43F5E', '#64748B', '#D946EF'
];

const ICONS = ['📚', '☕', '💼', '🏋️', '🙏', '🎨', '🎵', '💻', '📝', '🔬', '🧮', '🌐', '🍽️', '😴'];

const StepCategories = ({ data, onUpdate, onNext, onBack }) => {
    const [categories, setCategories] = useState(
        data.categories?.length > 0
            ? data.categories
            : [
                { id: crypto.randomUUID(), name: 'Study', color: '#3B82F6', icon: '📚' },
                { id: crypto.randomUUID(), name: 'Break', color: '#22C55E', icon: '☕' },
            ]
    );
    const [activeColorPicker, setActiveColorPicker] = useState(null);
    const [activeIconPicker, setActiveIconPicker] = useState(null);

    const addCategory = () => {
        setCategories([...categories, {
            id: crypto.randomUUID(),
            name: '',
            color: PRESET_COLORS[categories.length % PRESET_COLORS.length],
            icon: ''
        }]);
    };

    const updateCategory = (id, field, value) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const removeCategory = (id) => {
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    const handleContinue = () => {
        const valid = categories.filter(c => c.name.trim());
        if (valid.length === 0) return alert('Add at least one category with a name.');
        onUpdate({ categories: valid });
        onNext();
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Categories</h2>
                <p className="text-gray-500 text-sm">Define the types of activities for your timetable.</p>
            </div>

            <div className="flex flex-col gap-3">
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all">
                        {/* Color chip */}
                        <div className="relative">
                            <button
                                onClick={() => setActiveColorPicker(activeColorPicker === cat.id ? null : cat.id)}
                                className="w-9 h-9 rounded-lg shadow-sm border-2 border-white cursor-pointer transition-transform hover:scale-110"
                                style={{ backgroundColor: cat.color }}
                            />
                            {activeColorPicker === cat.id && (
                                <div className="absolute top-12 left-0 z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-3 grid grid-cols-5 gap-2 w-48">
                                    {PRESET_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => { updateCategory(cat.id, 'color', c); setActiveColorPicker(null); }}
                                            className={`w-7 h-7 rounded-lg cursor-pointer transition-transform hover:scale-110 ${cat.color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Icon selector */}
                        <div className="relative">
                            <button
                                onClick={() => setActiveIconPicker(activeIconPicker === cat.id ? null : cat.id)}
                                className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg cursor-pointer hover:bg-gray-200 transition-colors"
                            >
                                {cat.icon || '➕'}
                            </button>
                            {activeIconPicker === cat.id && (
                                <div className="absolute top-12 left-0 z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-3 grid grid-cols-5 gap-2 w-48">
                                    {ICONS.map(ic => (
                                        <button
                                            key={ic}
                                            onClick={() => { updateCategory(cat.id, 'icon', ic); setActiveIconPicker(null); }}
                                            className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-lg cursor-pointer transition-colors"
                                        >
                                            {ic}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <input
                            type="text"
                            value={cat.name}
                            onChange={e => updateCategory(cat.id, 'name', e.target.value)}
                            placeholder="Category name..."
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 transition-all"
                        />

                        {/* Preview tag */}
                        <div
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: cat.color }}
                        >
                            {cat.icon && <span>{cat.icon}</span>}
                            {cat.name || 'Untitled'}
                        </div>

                        <button onClick={() => removeCategory(cat.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <button
                    onClick={addCategory}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-semibold cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={onBack} className="px-6 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all cursor-pointer">← Back</button>
                <button onClick={handleContinue} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 cursor-pointer">Continue →</button>
            </div>
        </div>
    );
};

export default StepCategories;
