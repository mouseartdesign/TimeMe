import { useState } from "react";
import Navbar from "../components/Navbar";
import Task from "../components/Task";
import TodayDate from "../components/Date";
import Footbar from "../components/footbar";
import NewTask from "../components/NewTask";
import TodaySchedule from "../components/timetable/TodaySchedule";
import { useNavigate } from "react-router-dom";
import { Calendar, ListChecks, Plus } from "lucide-react";

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTasks, setRefreshTasks] = useState(0);
    const navigate = useNavigate();

    const handleTaskAdded = (newTask) => {
        setRefreshTasks(prev => prev + 1);
    };

    return (
        <>
            <Navbar />
            <div className="bg-gray-50 w-full min-h-screen pb-24">
                <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">

                    {/* Date card */}
                    <TodayDate />

                    {/* Quick nav */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/timetable')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer"
                        >
                            <Calendar className="w-4 h-4" />
                            Timetable
                        </button>
                        <button
                            onClick={() => navigate('/tasks')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all cursor-pointer"
                        >
                            <ListChecks className="w-4 h-4" />
                            All Tasks
                        </button>
                    </div>

                    {/* Today's Schedule */}
                    <TodaySchedule />

                    {/* Today's Tasks */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-gray-900">Today's Tasks</h2>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/30 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> Add Task
                            </button>
                        </div>
                        <Task refreshTrigger={refreshTasks} />
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

export default Home;