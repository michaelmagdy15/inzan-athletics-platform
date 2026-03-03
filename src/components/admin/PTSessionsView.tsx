import React, { useState, useMemo } from 'react';
import { Calendar, Users, XCircle, CheckCircle2, AlertTriangle, Clock, Filter, RefreshCw, Search } from 'lucide-react';
import { useData, SessionStatus, SESSION_TYPE_LABELS } from '../../context/DataContext';

const STATUS_CONFIG: Record<SessionStatus, { color: string; label: string }> = {
    scheduled: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', label: 'Scheduled' },
    completed: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', label: 'Completed' },
    canceled: { color: 'text-red-400 bg-red-500/10 border-red-500/20', label: 'Canceled' },
    no_show: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', label: 'No Show' },
    rescheduled: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', label: 'Rescheduled' },
};

export default function PTSessionsView() {
    const { ptSessions, members, updateSessionStatus, cancelPTSession } = useData();
    const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
    const [coachFilter, setCoachFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);

    const coaches = members.filter(m => m.role === 'coach');
    const today = new Date().toISOString().split('T')[0];

    const filtered = useMemo(() => {
        return ptSessions.filter(s => {
            if (statusFilter !== 'all' && s.status !== statusFilter) return false;
            if (coachFilter && s.coach_id !== coachFilter) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return s.member_name?.toLowerCase().includes(term) || s.coach_name?.toLowerCase().includes(term);
            }
            return true;
        });
    }, [ptSessions, statusFilter, coachFilter, searchTerm]);

    const todaySessions = ptSessions.filter(s => s.scheduled_date === today);
    const todayScheduled = todaySessions.filter(s => s.status === 'scheduled').length;
    const todayCompleted = todaySessions.filter(s => s.status === 'completed').length;
    const todayNoShows = todaySessions.filter(s => s.status === 'no_show').length;
    const totalCanceled = ptSessions.filter(s => s.status === 'canceled').length;

    const handleAction = async (sessionId: string, status: SessionStatus) => {
        setProcessing(sessionId);
        try { await updateSessionStatus(sessionId, status); }
        catch (err: any) { alert(err.message); }
        finally { setProcessing(null); }
    };

    const handleCancel = async (sessionId: string) => {
        setProcessing(sessionId);
        try { await cancelPTSession(sessionId); }
        catch (err: any) { alert(err.message); }
        finally { setProcessing(null); }
    };

    const formatTime = (t: string) => {
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-10">
            <div>
                <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">PT Sessions</h1>
                <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">Front Desk Session Management</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Today Scheduled', value: todayScheduled, color: 'text-blue-400' },
                    { label: 'Today Completed', value: todayCompleted, color: 'text-emerald-400' },
                    { label: 'Today No-Shows', value: todayNoShows, color: 'text-orange-400' },
                    { label: 'Total Canceled', value: totalCanceled, color: 'text-red-400' },
                ].map(stat => (
                    <div key={stat.label} className="glass-card rounded-2xl p-5 border border-white/5">
                        <p className="text-[9px] text-white/30 tracking-widest uppercase mb-2">{stat.label}</p>
                        <p className={`text-3xl font-heading ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                        type="text" placeholder="Search member or coach..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/20"
                    />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm">
                    <option value="all">All Statuses</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={coachFilter} onChange={e => setCoachFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm">
                    <option value="">All Coaches</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Sessions Table */}
            <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                {['Member', 'Coach', 'Type', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-[9px] text-white/30 uppercase tracking-widest font-bold text-left px-5 py-4">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} className="text-center text-white/20 text-sm py-12">No sessions found.</td></tr>
                            )}
                            {filtered.map(session => {
                                const cfg = STATUS_CONFIG[session.status];
                                return (
                                    <tr key={session.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-4 text-sm font-bold text-white">{session.member_name}</td>
                                        <td className="px-5 py-4 text-sm text-white/60">{session.coach_name}</td>
                                        <td className="px-5 py-4 text-[10px] text-white/40 uppercase tracking-widest">{session.session_type.replace('_', ' ')}</td>
                                        <td className="px-5 py-4 text-sm text-white/60">{new Date(session.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                        <td className="px-5 py-4 text-sm text-white/60">{formatTime(session.scheduled_time)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-bold tracking-widest uppercase border ${cfg.color}`}>{cfg.label}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {session.status === 'scheduled' && (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleAction(session.id, 'completed')} disabled={processing === session.id} className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors" title="Complete">
                                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                                    </button>
                                                    <button onClick={() => handleAction(session.id, 'no_show')} disabled={processing === session.id} className="p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 transition-colors" title="No Show">
                                                        <AlertTriangle size={14} className="text-orange-400" />
                                                    </button>
                                                    <button onClick={() => handleCancel(session.id)} disabled={processing === session.id} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors" title="Cancel">
                                                        <XCircle size={14} className="text-red-400" />
                                                    </button>
                                                </div>
                                            )}
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
