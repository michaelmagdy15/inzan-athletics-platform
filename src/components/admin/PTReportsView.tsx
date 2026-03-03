import React, { useMemo } from 'react';
import { BarChart3, Users, TrendingUp, Calendar, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useData, SESSION_TYPE_LABELS } from '../../context/DataContext';

const COLORS = ['#FFB800', '#22c55e', '#ef4444', '#a855f7', '#3b82f6'];

export default function PTReportsView() {
    const { ptSessions, ptPackages, members } = useData();

    const coaches = members.filter(m => m.role === 'coach');

    // Sessions per coach
    const sessionsPerCoach = useMemo(() => {
        return coaches.map(c => ({
            name: c.name.split(' ')[0],
            completed: ptSessions.filter(s => s.coach_id === c.id && s.status === 'completed').length,
            scheduled: ptSessions.filter(s => s.coach_id === c.id && s.status === 'scheduled').length,
            canceled: ptSessions.filter(s => s.coach_id === c.id && s.status === 'canceled').length,
            noShow: ptSessions.filter(s => s.coach_id === c.id && s.status === 'no_show').length,
        }));
    }, [ptSessions, coaches]);

    // Status distribution pie chart
    const statusDistribution = useMemo(() => {
        const counts = { Completed: 0, Scheduled: 0, Canceled: 0, 'No Show': 0, Rescheduled: 0 };
        ptSessions.forEach(s => {
            if (s.status === 'completed') counts.Completed++;
            else if (s.status === 'scheduled') counts.Scheduled++;
            else if (s.status === 'canceled') counts.Canceled++;
            else if (s.status === 'no_show') counts['No Show']++;
            else if (s.status === 'rescheduled') counts.Rescheduled++;
        });
        return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
    }, [ptSessions]);

    // Revenue by package type
    const revenueByType = useMemo(() => {
        const map: Record<string, number> = {};
        ptPackages.forEach(p => {
            const label = SESSION_TYPE_LABELS[p.package_type] || p.package_type;
            map[label] = (map[label] || 0) + p.price_paid;
        });
        return Object.entries(map).map(([name, revenue]) => ({ name, revenue }));
    }, [ptPackages]);

    // Client balance summary (top 10 lowest balance)
    const clientBalances = useMemo(() => {
        const balanceMap: Record<string, { name: string; remaining: number; total: number }> = {};
        ptPackages.filter(p => p.status === 'active').forEach(p => {
            if (!balanceMap[p.member_id]) {
                balanceMap[p.member_id] = { name: p.member_name || 'Unknown', remaining: 0, total: 0 };
            }
            balanceMap[p.member_id].remaining += p.remaining_sessions;
            balanceMap[p.member_id].total += p.total_sessions;
        });
        return Object.values(balanceMap).sort((a, b) => a.remaining - b.remaining).slice(0, 10);
    }, [ptPackages]);

    const totalSessions = ptSessions.length;
    const completedSessions = ptSessions.filter(s => s.status === 'completed').length;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
    const totalRevenue = ptPackages.reduce((sum, p) => sum + p.price_paid, 0);

    return (
        <div className="flex flex-col gap-6 lg:gap-10">
            <div>
                <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">PT Reports</h1>
                <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">Analytics & Performance Tracking</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sessions', value: totalSessions, icon: <Calendar size={20} />, color: 'text-blue-400' },
                    { label: 'Completion Rate', value: `${completionRate}%`, icon: <TrendingUp size={20} />, color: 'text-emerald-400' },
                    { label: 'Active Packages', value: ptPackages.filter(p => p.status === 'active').length, icon: <Package size={20} />, color: 'text-purple-400' },
                    { label: 'Total Revenue', value: `${totalRevenue.toLocaleString()} EGP`, icon: <BarChart3 size={20} />, color: 'text-[#FFB800]' },
                ].map(kpi => (
                    <div key={kpi.label} className="glass-card rounded-2xl p-5 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[9px] text-white/30 tracking-widest uppercase">{kpi.label}</p>
                            <div className={`${kpi.color} opacity-40`}>{kpi.icon}</div>
                        </div>
                        <p className={`text-2xl lg:text-3xl font-heading ${kpi.color}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sessions Per Coach */}
                <div className="glass-card rounded-[2rem] border border-white/5 p-6">
                    <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase mb-6">Sessions Per Coach</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={sessionsPerCoach}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                            <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
                            <Bar dataKey="scheduled" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Scheduled" />
                            <Bar dataKey="canceled" fill="#ef4444" radius={[4, 4, 0, 0]} name="Canceled" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Distribution */}
                <div className="glass-card rounded-[2rem] border border-white/5 p-6">
                    <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase mb-6">Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {statusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Client Session Balances */}
            <div className="glass-card rounded-[2rem] border border-white/5 p-6">
                <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase mb-6">Client Session Balances (Lowest First)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                {['Client', 'Remaining', 'Total', 'Usage'].map(h => (
                                    <th key={h} className="text-[9px] text-white/30 uppercase tracking-widest font-bold text-left px-5 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {clientBalances.map((c, i) => {
                                const usage = c.total > 0 ? Math.round(((c.total - c.remaining) / c.total) * 100) : 0;
                                return (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3 text-sm font-bold text-white">{c.name}</td>
                                        <td className={`px-5 py-3 text-sm font-bold ${c.remaining <= 2 ? 'text-red-400' : 'text-emerald-400'}`}>{c.remaining}</td>
                                        <td className="px-5 py-3 text-sm text-white/40">{c.total}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#FFB800] rounded-full" style={{ width: `${usage}%` }} />
                                                </div>
                                                <span className="text-[10px] text-white/40 w-10 text-right">{usage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
