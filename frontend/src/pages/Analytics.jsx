import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footbar from '../components/footbar';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    TrendingUp, CheckCircle2, XCircle, Clock, Flame, Target,
    BarChart2, Calendar, Zap, Award, Activity,
    AlertCircle, ListChecks, Timer,
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmtDate = (iso) => {
    const d = new Date(iso);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
};

// ─── Derived stats from real tasks ─────────────────────────────────────────
const buildStats = (tasks) => {
    const now = new Date(); now.setHours(0,0,0,0);

    const completed  = tasks.filter(t => t.status === 'completed');
    const missed     = tasks.filter(t => t.status === 'missed');
    const pending    = tasks.filter(t => t.status === 'pending');
    const due        = tasks.filter(t => t.status === 'due');

    const totalFocusMin = completed.reduce((s, t) => s + (Number(t.duration) || 0), 0);
    const completionPct = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
    const productivityScore = Math.min(100, completionPct + (missed.length === 0 ? 10 : 0));

    // weekly chart — last 7 days
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
        const label = DAY_NAMES[d.getDay()];
        const dayTasks = tasks.filter(t => {
            if (!t.scheduledDate) return false;
            const td = new Date(t.scheduledDate); td.setHours(0,0,0,0);
            return td.getTime() === d.getTime();
        });
        return {
            day: label,
            completed: dayTasks.filter(t => t.status === 'completed').length,
            missed:    dayTasks.filter(t => t.status === 'missed').length,
            total:     dayTasks.length,
        };
    });

    // category breakdown (by status)
    const pieData = [
        { name: 'Completed', value: completed.length, color: '#22c55e' },
        { name: 'Pending',   value: pending.length,   color: '#3b82f6' },
        { name: 'Due Today', value: due.length,        color: '#f59e0b' },
        { name: 'Missed',    value: missed.length,     color: '#ef4444' },
    ].filter(d => d.value > 0);

    // heatmap — last 28 days
    const heatmap = Array.from({ length: 28 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (27 - i)); d.setHours(0,0,0,0);
        const dayTasks = tasks.filter(t => {
            if (!t.scheduledDate) return false;
            const td = new Date(t.scheduledDate); td.setHours(0,0,0,0);
            return td.getTime() === d.getTime();
        });
        const done = dayTasks.filter(t => t.status === 'completed').length;
        return { date: d, done, total: dayTasks.length };
    });

    // most active day
    const dayBuckets = Array(7).fill(0);
    completed.forEach(t => {
        if (t.scheduledDate) dayBuckets[new Date(t.scheduledDate).getDay()]++;
    });
    const mostActiveDay = DAY_NAMES[dayBuckets.indexOf(Math.max(...dayBuckets))];

    // streak — consecutive days with ≥1 completed task (going backwards from today)
    let streak = 0;
    for (let i = 0; i < 30; i++) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
        const hasDone = completed.some(t => {
            if (!t.scheduledDate) return false;
            const td = new Date(t.scheduledDate); td.setHours(0,0,0,0);
            return td.getTime() === d.getTime();
        });
        if (hasDone) streak++;
        else if (i > 0) break;
    }

    // recent activity timeline (last 8 tasks sorted by date desc)
    const recent = [...tasks]
        .filter(t => t.scheduledDate)
        .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate))
        .slice(0, 8);

    return {
        completed: completed.length,
        pending: pending.length,
        due: due.length,
        missed: missed.length,
        total: tasks.length,
        totalFocusHrs: (totalFocusMin / 60).toFixed(1),
        completionPct,
        productivityScore,
        weeklyData,
        pieData,
        heatmap,
        mostActiveDay,
        streak,
        recent,
        avgDuration: completed.length
            ? Math.round(completed.reduce((s,t) => s + (Number(t.duration)||0), 0) / completed.length)
            : 0,
    };
};

// ─── Sub-components ────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, gradient, iconColor }) => (
    <div className={`relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-all`}>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${gradient} rounded-2xl`} />
        <div className="relative z-10">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${iconColor}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
            {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
        </div>
    </div>
);

const HeatCell = ({ done, total }) => {
    const intensity = total === 0 ? 0 : done / total;
    const bg = intensity === 0 ? 'bg-gray-100'
        : intensity < 0.34 ? 'bg-blue-200'
        : intensity < 0.67 ? 'bg-blue-400'
        : 'bg-blue-600';
    return (
        <div
            className={`w-6 h-6 rounded-md ${bg} transition-all hover:scale-110 cursor-default`}
            title={`${done}/${total} completed`}
        />
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-bold text-gray-800 mb-1">{label}</p>
            {payload.map(p => (
                <p key={p.dataKey} style={{ color: p.color }} className="text-xs font-medium">
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
};

const EmptyState = ({ icon: Icon, title, sub }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-base font-bold text-gray-700 mb-1">{title}</h3>
        <p className="text-sm text-gray-400 max-w-xs">{sub}</p>
    </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────
const Analytics = () => {
    const [tasks, setTasks]     = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get('/api/tasks?all=true');
                setTasks(res.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const s = buildStats(tasks);

    const STAT_CARDS = [
        { icon: Target,      label: 'Productivity Score', value: `${s.productivityScore}%`,  sub: 'Overall performance',     gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50',   iconColor: 'bg-blue-100 text-blue-600' },
        { icon: CheckCircle2,label: 'Completed',          value: s.completed,                sub: 'Tasks finished',           gradient: 'bg-gradient-to-br from-green-50 to-emerald-50', iconColor: 'bg-green-100 text-green-600' },
        { icon: ListChecks,  label: 'Pending',            value: s.pending,                  sub: 'Yet to be done',           gradient: 'bg-gradient-to-br from-blue-50 to-sky-50',      iconColor: 'bg-sky-100 text-sky-600' },
        { icon: XCircle,     label: 'Missed',             value: s.missed,                   sub: 'Overdue tasks',            gradient: 'bg-gradient-to-br from-red-50 to-rose-50',      iconColor: 'bg-red-100 text-red-500' },
        { icon: Clock,       label: 'Focus Hours',        value: `${s.totalFocusHrs}h`,      sub: 'Total logged time',        gradient: 'bg-gradient-to-br from-violet-50 to-purple-50', iconColor: 'bg-violet-100 text-violet-600' },
        { icon: TrendingUp,  label: 'Completion Rate',    value: `${s.completionPct}%`,      sub: `${s.total} total tasks`,   gradient: 'bg-gradient-to-br from-amber-50 to-yellow-50',  iconColor: 'bg-amber-100 text-amber-600' },
    ];

    return (
        <>
            <Navbar />
            <div className="bg-gray-50 min-h-screen pb-28">
                <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">

                    {/* ── Page Header ── */}
                    <div className="flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-600" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Productivity Insights</h1>
                            <p className="text-sm text-gray-400">Track your performance, consistency, and activity.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <EmptyState
                                icon={BarChart2}
                                title="No analytics yet"
                                sub="Complete some tasks to start seeing your productivity insights here."
                            />
                        </div>
                    ) : (
                        <>
                            {/* ── Stat Cards Grid ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {STAT_CARDS.map(c => <StatCard key={c.label} {...c} />)}
                            </div>

                            {/* ── Weekly Chart ── */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900">Weekly Productivity</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">Completed vs missed sessions</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Completed</span>
                                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Missed</span>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={s.weeklyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gMissed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="completed" name="Completed" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gCompleted)" dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                        <Area type="monotone" dataKey="missed"    name="Missed"    stroke="#ef4444" strokeWidth={2}   fill="url(#gMissed)"    dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* ── Pie + Focus Stats ── */}
                            <div className="grid sm:grid-cols-2 gap-4">

                                {/* Donut chart */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <h2 className="text-sm font-bold text-gray-900 mb-1">Task Breakdown</h2>
                                    <p className="text-xs text-gray-400 mb-4">Distribution by status</p>
                                    {s.pieData.length === 0 ? (
                                        <EmptyState icon={Activity} title="No data" sub="Complete tasks to see breakdown." />
                                    ) : (
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={s.pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={80}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {s.pieData.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v, n) => [v, n]} />
                                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                {/* Focus stat cards */}
                                <div className="flex flex-col gap-3">
                                    {[
                                        { icon: Flame,    label: 'Current Streak',       value: `${s.streak} day${s.streak !== 1 ? 's' : ''}`, color: 'text-orange-500', bg: 'bg-orange-50' },
                                        { icon: Calendar, label: 'Most Active Day',       value: s.mostActiveDay,               color: 'text-blue-500',   bg: 'bg-blue-50' },
                                        { icon: Timer,    label: 'Avg Task Duration',     value: `${s.avgDuration} min`,        color: 'text-violet-500', bg: 'bg-violet-50' },
                                        { icon: Zap,      label: 'Completion Rate',       value: `${s.completionPct}%`,         color: 'text-green-500',  bg: 'bg-green-50' },
                                    ].map(item => (
                                        <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] text-gray-400 font-medium">{item.label}</p>
                                                <p className="text-base font-bold text-gray-900">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Activity Heatmap ── */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900">Activity Heatmap</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">Last 28 days of task completions</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <span>Less</span>
                                        {['bg-gray-100','bg-blue-200','bg-blue-400','bg-blue-600'].map(c => (
                                            <div key={c} className={`w-4 h-4 rounded-sm ${c}`} />
                                        ))}
                                        <span>More</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-1.5">
                                    {DAY_NAMES.map(d => (
                                        <p key={d} className="text-[10px] text-gray-400 text-center font-medium">{d}</p>
                                    ))}
                                    {s.heatmap.map((cell, i) => (
                                        <HeatCell key={i} done={cell.done} total={cell.total} />
                                    ))}
                                </div>
                            </div>

                            {/* ── Recent Activity Timeline ── */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h2 className="text-sm font-bold text-gray-900 mb-4">Recent Activity</h2>
                                {s.recent.length === 0 ? (
                                    <EmptyState icon={Activity} title="No recent activity" sub="Your completed and upcoming tasks will appear here." />
                                ) : (
                                    <div className="relative flex flex-col gap-0">
                                        {/* vertical line */}
                                        <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100" />

                                        {s.recent.map((task, i) => {
                                            const icon = task.status === 'completed' ? CheckCircle2
                                                       : task.status === 'missed'    ? XCircle
                                                       : AlertCircle;
                                            const iconColor = task.status === 'completed' ? 'text-green-500 bg-green-50'
                                                            : task.status === 'missed'    ? 'text-red-400 bg-red-50'
                                                            : 'text-blue-500 bg-blue-50';
                                            const Icon = icon;

                                            return (
                                                <div key={task._id} className="flex items-start gap-3 pl-0 py-2.5 group">
                                                    <div className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2 pt-1">
                                                        <div className="min-w-0">
                                                            <p className={`text-sm font-semibold truncate ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                                                {task.title}
                                                            </p>
                                                            {task.description && (
                                                                <p className="text-xs text-gray-400 truncate">{task.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex-shrink-0 text-right">
                                                            <p className="text-[11px] text-gray-400">{fmtDate(task.scheduledDate)}</p>
                                                            <p className={`text-[10px] font-semibold capitalize ${
                                                                task.status === 'completed' ? 'text-green-500' :
                                                                task.status === 'missed'    ? 'text-red-400' : 'text-blue-500'
                                                            }`}>{task.status}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ── Performance Summary ── */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Award className="w-4 h-4 text-blue-600" />
                                    <h2 className="text-sm font-bold text-gray-900">Performance Summary</h2>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        { label: 'Total Tasks Created', value: s.total,               icon: ListChecks, color: 'text-gray-600' },
                                        { label: 'Tasks Completed',     value: s.completed,           icon: CheckCircle2, color: 'text-green-600' },
                                        { label: 'Tasks Missed',        value: s.missed,              icon: XCircle,    color: 'text-red-500' },
                                        { label: 'Total Focus Time',    value: `${s.totalFocusHrs}h`, icon: Clock,      color: 'text-violet-600' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                                <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                                            </div>
                                            <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Completion progress bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-semibold text-gray-500">Overall Completion</p>
                                        <p className="text-xs font-bold text-blue-600">{s.completionPct}%</p>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                                            style={{ width: `${s.completionPct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                        </>
                    )}
                </div>
            </div>
            <Footbar />
        </>
    );
};

export default Analytics;
