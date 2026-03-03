import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight, Users } from 'lucide-react';
import { useData, SessionStatus, SESSION_TYPE_LABELS } from '../../context/DataContext';

const STATUS_CONFIG: Record<SessionStatus, { color: string; icon: React.ReactNode; label: string }> = {
    scheduled: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: <Clock size={14} />, label: 'Scheduled' },
    completed: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 size={14} />, label: 'Completed' },
    canceled: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <XCircle size={14} />, label: 'Canceled' },
    no_show: { color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', icon: <AlertTriangle size={14} />, label: 'No Show' },
    rescheduled: { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: <Clock size={14} />, label: 'Rescheduled' },
};

export default function CoachSessionsView() {
    const { currentUser, ptSessions, updateSessionStatus } = useData();
    const [filter, setFilter] = useState<'today' | 'upcoming' | 'past'>('today');
    const [processing, setProcessing] = useState<string | null>(null);

    if (!currentUser) return null;

    const mySessions = ptSessions.filter(s => s.coach_id === currentUser.id);
    const today = new Date().toISOString().split('T')[0];

    const filtered = mySessions.filter(s => {
        if (filter === 'today') return s.scheduled_date === today;
        if (filter === 'upcoming') return s.scheduled_date > today && s.status === 'scheduled';
        return s.scheduled_date < today || ['completed', 'canceled', 'no_show'].includes(s.status);
    });

    const todayScheduled = mySessions.filter(s => s.scheduled_date === today && s.status === 'scheduled').length;
    const todayCompleted = mySessions.filter(s => s.scheduled_date === today && s.status === 'completed').length;

    const handleStatusUpdate = async (sessionId: string, status: SessionStatus) => {
        setProcessing(sessionId);
        try { await updateSessionStatus(sessionId, status); }
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
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">My Sessions</h1>
                <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">View & update session statuses</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-white/5">
                    <p className="text-[9px] text-white/30 tracking-widest uppercase mb-2">Today Scheduled</p>
                    <p className="text-3xl font-heading text-[#FFB800]">{todayScheduled}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border border-white/5">
                    <p className="text-[9px] text-white/30 tracking-widest uppercase mb-2">Today Completed</p>
                    <p className="text-3xl font-heading text-emerald-400">{todayCompleted}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                {(['today', 'upcoming', 'past'] as const).map(tab => (
                    <button key={tab} onClick={() => setFilter(tab)} className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${filter === tab ? 'bg-[#FFB800] text-black shadow-lg' : 'text-white/30 hover:text-white'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Sessions List */}
            <div className="flex flex-col gap-4">
                {filtered.length === 0 && (
                    <p className="text-center text-white/20 text-sm py-8">No sessions found for this filter.</p>
                )}
                {filtered.map(session => {
                    const cfg = STATUS_CONFIG[session.status];
                    return (
                        <div key={session.id} className="glass-card rounded-[1.5rem] border border-white/5 p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-white text-lg">{session.member_name}</h4>
                                    <p className="text-[10px] text-white/40 tracking-widest uppercase mt-1">
                                        {SESSION_TYPE_LABELS[session.session_type]} • {session.duration_minutes} min
                                    </p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase border ${cfg.color}`}>
                                    {cfg.icon}
                                    {cfg.label}
                                </div>
                            </div>

                            <div className="flex gap-4 text-sm text-white/60">
                                <span>{new Date(session.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                <span>•</span>
                                <span>{formatTime(session.scheduled_time)}</span>
                            </div>

                            {session.status === 'scheduled' && (
                                <div className="flex gap-2 pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => handleStatusUpdate(session.id, 'completed')}
                                        disabled={processing === session.id}
                                        className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={14} />
                                        Completed
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(session.id, 'no_show')}
                                        disabled={processing === session.id}
                                        className="flex-1 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold tracking-widest uppercase hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <AlertTriangle size={14} />
                                        No Show
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(session.id, 'canceled')}
                                        disabled={processing === session.id}
                                        className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest uppercase hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={14} />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
