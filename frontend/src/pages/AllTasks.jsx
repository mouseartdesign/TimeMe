import { useState } from "react";
import Navbar from "../components/Navbar";
import Task from "../components/Task";
import Footbar from "../components/footbar";
import NewTask from "../components/NewTask";
import { Plus, ListChecks } from "lucide-react";

const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Done' },
    { value: 'missed', label: 'Missed' },
    { value: 'due', label: 'Due Today' },
];

const AllTasks = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTasks, setRefreshTasks] = useState(0);
    const [filterStatus, setFilterStatus] = useState('all');

    const handleTaskAdded = () => {
        setRefreshTasks(prev => prev + 1);
    };

    return (
        <>
            <Navbar />
            <div className="bg-gray-50 w-full min-h-screen pb-24">
                <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

                    {/* Page header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ListChecks className="w-5 h-5 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-900">All Tasks</h1>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> New Task
                        </button>
                    </div>

                    {/* Filter tabs */}
                    <div className="bg-white border border-gray-200 rounded-xl p-1 flex gap-1 shadow-sm">
                        {FILTERS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setFilterStatus(opt.value)}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                    filterStatus === opt.value
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Task list container */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <Task refreshTrigger={refreshTasks} showAll={true} filterStatus={filterStatus} />
                    </div>

                </div>
            </div>

            {isModalOpen && (
                <NewTask
                    onClose={() => setIsModalOpen(false)}
                    onTaskAdded={handleTaskAdded}
                />
            )}

            <Footbar onAddClick={() => setIsModalOpen(true)} />
        </>
    );
};

export default AllTasks;
