import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TodayDate = () => {
    const [today, setToday] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setToday(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Today</p>
                <p className="font-semibold text-gray-900 text-sm">{today.toLocaleDateString(undefined, dateOptions)}</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-blue-500" />
                <p className="font-bold text-blue-600 text-sm tabular-nums">{today.toLocaleTimeString(undefined, timeOptions)}</p>
            </div>
        </div>
    );
};

export default TodayDate;