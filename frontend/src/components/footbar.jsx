import { Plus, HomeIcon, List, Table, BarChart2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Footbar = ({ onAddClick }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItem = (path, Icon, label) => (
        <button
            onClick={() => navigate(path)}
            title={label}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
                isActive(path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-semibold tracking-wide">{label}</span>
        </button>
    );

    return (
        <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 px-4 py-2 z-10">
            <div className="max-w-sm mx-auto flex justify-between items-center">
                {navItem('/', HomeIcon, 'Home')}
                {navItem('/tasks', List, 'Tasks')}
                <button
                    onClick={onAddClick}
                    className="bg-blue-600 text-white p-3 rounded-2xl -mt-6 shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                </button>
                {navItem('/analytics', BarChart2, 'Analytics')}
                {navItem('/timetable', Table, 'Timetable')}
            </div>
        </div>
    );
};

export default Footbar;