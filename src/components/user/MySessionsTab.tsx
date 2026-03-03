import React, { useState } from 'react';
import { CalendarCheck, Package, Clock, XCircle, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useData, SessionStatus, SESSION_TYPE_LABELS } from '../../context/DataContext';

const STATUS_COLORS: Record<SessionStatus, string> = {
    scheduled: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    canceled: 'text-red-400 bg-red-500/10 border-red-500/20',
    no_show: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    rescheduled: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

export default function MySessionsTab() {
    const { currentUser, ptSessions, ptPackages, cancelPTSession, reschedulePTSession, coachAvailabilities } = useData();
    const [tab, setTab] = useState<'upcoming' | 'packages' | 'history'>('upcoming');
    const [processing, setProcessing] = useState<string | null>(null);
    const [rescheduleId, setRescheduleId] = useState<string | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    if (!currentUser) return null;

    const mySessions = ptSessions.filter(s => s.member_id === currentUser.id);
    const myPackages = ptPackages.filter(p => p.member_id === currentUser.id);
    const today = new Date().toISOString().split('T')[0];

    const upcoming = mySessions.filter(s => s.scheduled_date >= today && s.status === 'scheduled');
    const history = mySessions.filter(s => s.status !== 'scheduled' || s.scheduled_date < today);

    const handleCancel = async (sessionId: string) => {
        setProcessing(sessionId);
        try { await cancelPTSession(sessionId); }
        catch (err: any) { alert(err.message); }
        finally { setProcessing(null); }
    };

    const handleReschedule = async () => {
        if (!rescheduleId || !newDate || !newTime) return;
        setProcessing(rescheduleId);
        try {
            await reschedulePTSession(rescheduleId, newDate, newTime);
            setRescheduleId(null);
            setNewDate('');
            setNewTime('');
        }
        catch (err: any) { alert(err.message); }
        finally { setProcessing(null); }
    };

    const formatTime = (t: string) => {
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    return (
        <div className="p-6 pt-12 flex flex-col gap-6">
            <header className="flex justify-between items-center mb-2">
                <h2 className="text-3xl font-light tracking-tight">My Sessions</h2>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CalendarCheck size={18} className="text-emerald-400" />
                </div>
            </header>

            {/* Tab Switcher */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                {(['upcoming', 'packages', 'history'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-[11px] uppercase tracking-widest font-bold rounded-xl transition-all ${tab === t ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>{t}</button>
                ))}
            </div>

            {/* Upcoming Sessions */}
            {tab === 'upcoming' && (
                <div className="flex flex-col gap-4">
                    {upcoming.length === 0 && (
                        <div className="text-center py-12 text-white/20">
                            <CalendarCheck size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-sm">No upcoming sessions.</p>
                            <p className="text-[10px] text-white/10 mt-1">Book a session from the PT tab</p>
                        </div>
                    )}
                    {upcoming.map(session => (
                        <div key={session.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-white text-lg">{session.coach_name}</p>
                                    <p className="text-[10px] text-white/40 tracking-widest uppercase">{SESSION_TYPE_LABELS[session.session_type]}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase border ${STATUS_COLORS.scheduled}`}>
                                    Scheduled
                                </div>
                            </div>
                            <div className="flex gap-4 text-sm text-white/60">
                                <span className="flex items-center gap-1"><CalendarCheck size={14} className="text-[#FFB800]" /> {new Date(session.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                <span className="flex items-center gap-1"><Clock size={14} className="text-[#FFB800]" /> {formatTime(session.scheduled_time)}</span>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-white/5">
                                <button
                                    onClick={() => setRescheduleId(session.id)}
                                    disabled={processing === session.id}
                                    className="flex-1 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-purple-500/20 transition-colors"
                                >
                                    <RefreshCw size={14} />
                                    Reschedule
                                </button>
                                <button
                                    onClick={() => handleCancel(session.id)}
                                    disabled={processing === session.id}
                                    className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                                >
                                    <XCircle size={14} />
                                    {processing === session.id ? '...' : 'Cancel'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Packages */}
            {tab === 'packages' && (
                <div className="flex flex-col gap-4">
                    {myPackages.length === 0 && (
                        <p className="text-center text-white/20 text-sm py-8">No packages found.</p>
                    )}
                    {myPackages.map(pkg => (
                        <div key={pkg.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[9px] bg-[#FFB800]/10 text-[#FFB800] px-3 py-1 rounded-full font-bold tracking-widest uppercase border border-[#FFB800]/20">{SESSION_TYPE_LABELS[pkg.package_type]}</span>
                                <span className={`text-[9px] px-3 py-1 rounded-full font-bold tracking-widest uppercase border ${pkg.status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                        pkg.status === 'expired' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                                            'text-white/40 bg-white/5 border-white/10'
                                    }`}>{pkg.status}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-2xl font-bold text-white">{pkg.remaining_sessions}</p>
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Remaining</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white/40">{pkg.total_sessions}</p>
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Total</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white/40">{pkg.reschedules_used}</p>
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Reschedules</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-[10px] text-white/30">
                                <span>Coach: {pkg.coach_name}</span>
                                <span>Expires: {pkg.expires_at ? new Date(pkg.expires_at).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* History */}
            {tab === 'history' && (
                <div className="flex flex-col gap-3">
                    {history.length === 0 && <p className="text-center text-white/20 text-sm py-8">No session history.</p>}
                    {history.map(session => (
                        <div key={session.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold text-white/80">{session.coach_name}</p>
                                <p className="text-[9px] text-white/30 tracking-widest uppercase">{new Date(session.scheduled_date).toLocaleDateString()} • {formatTime(session.scheduled_time)}</p>
                            </div>
                            <div className={`px-3 py-1.5 rounded-full text-[8px] font-bold tracking-widest uppercase border ${STATUS_COLORS[session.status]}`}>
                                {session.status.replace('_', ' ')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleId && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-[#111] border border-white/10 rounded-[2rem] p-8 max-w-md w-full">
                        <h3 className="text-lg font-bold text-white mb-6">Reschedule Session</h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-[9px] text-white/40 uppercase tracking-widest mb-2 block">New Date</label>
                                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} min={today} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" />
                            </div>
                            <div>
                                <label className="text-[9px] text-white/40 uppercase tracking-widest mb-2 block">New Time</label>
                                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value + ':00')} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button onClick={() => { setRescheduleId(null); setNewDate(''); setNewTime(''); }} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-[10px] font-bold tracking-widest uppercase hover:bg-white/5 transition-colors">Cancel</button>
                                <button onClick={handleReschedule} disabled={!newDate || !newTime || processing === rescheduleId} className="flex-1 premium-button py-3 rounded-xl text-[10px] font-black tracking-widest uppercase text-black">
                                    {processing === rescheduleId ? 'Rescheduling...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
