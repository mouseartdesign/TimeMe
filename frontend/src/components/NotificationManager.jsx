import React, { useEffect, useRef, useState } from 'react';
import api from '../config/api';
import { Bell, X } from 'lucide-react';

const NotificationManager = () => {
    const [showBanner, setShowBanner] = useState(false);
    const notifiedTaskIds = useRef(new Set(JSON.parse(localStorage.getItem('notifiedTaskIds') || '[]')));

    useEffect(() => {
        // Check if browser supports notifications
        if (typeof window !== 'undefined' && 'Notification' in window) {
            // Check if permission is default and the user has not dismissed it
            const isDismissed = localStorage.getItem('notificationsDismissed') === 'true';
            if (Notification.permission === 'default' && !isDismissed) {
                setShowBanner(true);
            }
        }

        const checkReminders = async () => {
            try {
                // Fetch upcoming/non-completed tasks
                const res = await api.get('/api/tasks');
                if (res.status !== 200) return;

                const tasks = res.data;
                const now = new Date();
                let updatedNotified = false;

                tasks.forEach(task => {
                    const taskDateStr = task.taskDate || (task.scheduledDate ? task.scheduledDate.slice(0, 10) : null);
                    if (!taskDateStr || !task.startTime || task.isCompleted) return;

                    const [hours, minutes] = task.startTime.split(':').map(Number);
                    
                    // Create date object in local timezone
                    const [year, month, day] = taskDateStr.split('-').map(Number);
                    const taskStartTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

                    const reminderMinutes = task.reminderBefore !== undefined ? task.reminderBefore : 5;
                    const reminderTime = new Date(taskStartTime.getTime() - reminderMinutes * 60 * 1000);

                    // Check if current time is within the reminder window (from reminderTime up to taskStartTime)
                    if (now >= reminderTime && now < taskStartTime && !notifiedTaskIds.current.has(task._id)) {
                         notifiedTaskIds.current.add(task._id);
                         updatedNotified = true;

                         if (Notification.permission === 'granted') {
                             const timeStr = task.startTime;
                             const categoryText = task.category ? ` (${task.category})` : '';
                             new Notification(`${task.title} starts in ${reminderMinutes} minutes`, {
                                 body: `Scheduled for ${timeStr}${categoryText}`,
                                 tag: task._id
                             });
                         }
                    }
                });

                if (updatedNotified) {
                    localStorage.setItem('notifiedTaskIds', JSON.stringify(Array.from(notifiedTaskIds.current)));
                }
            } catch (err) {
                console.error('Error checking reminders:', err);
            }
        };

        checkReminders();
        const interval = setInterval(checkReminders, 30000);

        return () => clearInterval(interval);
    }, []);

    // Clean up expired or deleted task IDs from localStorage occasionally
    useEffect(() => {
        const cleanupExpiredNotifiedIds = async () => {
            try {
                const res = await api.get('/api/tasks');
                if (res.status !== 200) return;
                const tasks = res.data;
                const taskIds = new Set(tasks.map(t => t._id));
                
                const currentNotified = Array.from(notifiedTaskIds.current);
                const activeNotified = currentNotified.filter(id => taskIds.has(id));
                
                if (activeNotified.length !== currentNotified.length) {
                    notifiedTaskIds.current = new Set(activeNotified);
                    localStorage.setItem('notifiedTaskIds', JSON.stringify(activeNotified));
                }
            } catch (err) {
                console.error('Failed to cleanup expired notifications:', err);
            }
        };
        cleanupExpiredNotifiedIds();
    }, []);

    const handleEnableNotifications = async () => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification('Notifications Enabled!', {
                    body: 'You will now receive reminders for your scheduled tasks.',
                });
            }
            setShowBanner(false);
        }
    };

    const handleDismissBanner = () => {
        localStorage.setItem('notificationsDismissed', 'true');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-150 dark:border-gray-700 p-4 transition-all duration-300 transform translate-y-0 flex gap-3 animate-slide-in">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Enable Task Reminders</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed font-normal">
                    Get notified before your scheduled tasks start so you never miss them.
                </p>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleEnableNotifications}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                        Enable
                    </button>
                    <button
                        onClick={handleDismissBanner}
                        className="px-3.5 py-1.5 bg-gray-150 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-750 dark:text-gray-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
            <button
                onClick={handleDismissBanner}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors h-fit cursor-pointer"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default NotificationManager;

