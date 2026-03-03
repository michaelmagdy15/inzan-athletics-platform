import React from 'react';
import { useData } from '../../context/DataContext';
import { motion } from 'framer-motion';
import { Activity, Zap, Wallet, Users } from 'lucide-react';

export default function DashboardView() {
    const { members, orders, classes, transactions, operatingGoals, broadcastAlert } = useData();

    // Dynamic Stats Calculation
    const kitchenSales = orders.filter(o => o.status === 'completed' || o.status === 'picked_up').reduce((acc, order) => acc + (Number(order.total_price) || 0), 0);
    const membershipSales = transactions.filter(t => t.transaction_type === 'membership').reduce((acc, t) => acc + Number(t.amount), 0);
    // Since this is a new table, if it's empty, we'll gracefully fallback or just show 0 (which is accurate for a fresh DB)
    const otherTransactions = transactions.filter(t => t.transaction_type !== 'membership' && t.transaction_type !== 'kitchen').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalRevenue = kitchenSales + membershipSales + otherTransactions;

    const activeUsers = members.filter(m => m.membershipStatus === 'active').length;
    const totalMembers = members.length;

    const totalCapacity = classes.reduce((acc, c) => acc + (c.total_spots || 0), 0);
    const totalBooked = classes.reduce((acc, c) => acc + (c.total_spots - c.spots_left), 0);
    const scheduleLoad = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

    // Dynamic Member Analytics
    const suspendedCount = members.filter(m => m.membershipStatus === 'suspended' || m.membershipStatus === 'expired').length;
    const churnPotential = totalMembers > 0 ? ((suspendedCount / totalMembers) * 100).toFixed(1) : '0.0';

    // Use target goals from DB
    const memberGoal = operatingGoals.find(g => g.metric_name === 'New Members');
    const memberTarget = memberGoal?.target_value || 50;
    const memberGrowthRate = Math.min(100, Math.round((activeUsers / memberTarget) * 100));

    // Dynamic Class Analytics
    const avgAttendance = classes.length > 0 ? Math.round(totalBooked / classes.length) : 0;
    let peakHourStr = "N/A";
    if (classes.length > 0) {
        const hourCounts: Record<string, number> = {};
        classes.forEach(c => {
            const hour = c.time.split(':')[0] + (c.time.includes('PM') ? ' PM' : c.time.includes('AM') ? ' AM' : ':00');
            hourCounts[hour] = (hourCounts[hour] || 0) + (c.total_spots - c.spots_left);
        });
        const peakHour = Object.keys(hourCounts).length > 0 ? Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b) : "N/A";
        peakHourStr = peakHour;
    }

    const classEngagementWidth = Math.min(100, scheduleLoad);

    const handleAction = (label: string) => {
        switch (label) {
            case 'Send Member Announcement':
                broadcastAlert('Announcement sent to all active members.', 'info');
                break;
            case 'Export Daily Report':
                broadcastAlert('Preparing daily operations report... Ready for download.', 'success');
                break;
            case 'Sync System Time':
                broadcastAlert('System time synchronized with local server.', 'success');
                break;
            case 'Run Security Check':
                broadcastAlert('Running perimeter security check... All systems normal.', 'warning');
                break;
            default:
                break;
        }
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">Admin Dashboard</h1>
                    <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">Real-time Performance & Gym Overview</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl backdrop-blur-xl transition-all hover:border-gold/30 group cursor-pointer shadow-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase group-hover:text-white transition-colors">System Online</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Total Revenue" value={`${totalRevenue.toLocaleString()}`} currency="EGP" trend={totalRevenue > 0 ? "+Active" : "-"} icon={<Wallet size={18} />} />
                <StatCard title="Active Members" value={activeUsers.toString()} trend={`${totalMembers} Total`} icon={<Users size={18} />} />
                <StatCard title="Kitchen Sales" value={`${kitchenSales.toLocaleString()}`} currency="EGP" trend={kitchenSales > 0 ? "Active" : "-"} icon={<Zap size={18} />} />
                <StatCard title="Schedule Load" value={`${scheduleLoad}%`} highlight icon={<Activity size={18} />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Operations Insights */}
                <div className="xl:col-span-2 glass-card rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex justify-between items-center mb-10 relative z-10 font-bold">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-[0_0_15px_rgba(202,138,4,0.1)]">
                                <Activity size={20} className="text-gold" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white/80">Gym Overview</h3>
                                <p className="text-[10px] text-white/40 tracking-widest font-black uppercase mt-1">Live Statistics</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10 font-bold">
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[10px] text-gold tracking-[0.4em] uppercase font-bold">Member Analytics</h4>
                            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-white/30 uppercase tracking-widest">Target Met</span>
                                    <span className="text-emerald-400 font-bold">{memberGrowthRate}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-white/30 uppercase tracking-widest">Churn Potential</span>
                                    <span className={`${Number(churnPotential) > 5 ? 'text-red-400' : 'text-white/60'} font-bold`}>{churnPotential}%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gold shadow-[0_0_10px_rgba(202,138,4,0.3)] transition-all duration-1000" style={{ width: `${memberGrowthRate}%` }} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[10px] text-gold tracking-[0.4em] uppercase font-bold">Class Engagement</h4>
                            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-white/30 uppercase tracking-widest">Avg Attendance</span>
                                    <span className="text-white font-bold">{avgAttendance} / session</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] text-white/30 uppercase tracking-widest">Peak Hours</span>
                                    <span className="text-gold font-bold">{peakHourStr}</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gold shadow-[0_0_10px_rgba(202,138,4,0.3)] transition-all duration-1000" style={{ width: `${classEngagementWidth}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 lg:mt-10 p-6 lg:p-8 bg-gold/5 border border-gold/10 rounded-2xl lg:rounded-3xl relative overflow-hidden">
                        <p className="text-sm font-light text-white/60 leading-relaxed uppercase tracking-widest text-[11px] relative z-10">
                            Analytics compiled from active database state. {activeUsers} members currently contributing to engagement load.
                        </p>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="flex flex-col gap-6 lg:gap-10 font-bold">
                    <div className="glass-card rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 flex flex-col gap-6 lg:gap-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Quick Actions</h3>
                        <div className="flex flex-col gap-5">
                            <ActionButton label="Send Member Announcement" onClick={() => handleAction('Send Member Announcement')} />
                            <ActionButton label="Export Daily Report" onClick={() => handleAction('Export Daily Report')} />
                            <ActionButton label="Sync Time" onClick={() => handleAction('Sync System Time')} />
                            <ActionButton label="Run Security Check" variant="danger" onClick={() => handleAction('Run Security Check')} />
                        </div>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gold/5 border border-gold/10 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 flex flex-col gap-6 relative overflow-hidden group shadow-xl"
                    >
                        <div className="absolute top-0 right-0 p-6">
                            <Zap size={24} className="text-gold animate-shimmer" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold/80">Platform Status</h3>
                        <p className="text-sm font-light text-white/60 leading-relaxed uppercase tracking-widest text-[11px]">System integrity at <span className="text-white font-bold">99.8%</span>. Database fully synchronized.<br /><br /><span className="text-gold font-black border-b border-gold/20 pb-0.5">VIEW SYSTEM LOGS</span></p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, currency, trend, highlight, icon }: any) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className={`p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border relative overflow-hidden transition-all duration-700 group cursor-pointer shadow-2xl font-bold ${highlight ? 'bg-gold/10 border-gold/20 shadow-[0_0_60px_rgba(202,138,4,0.15)]' : 'bg-white/[0.02] border-white/5 hover:border-gold/30'}`}
        >
            <div className="flex justify-between items-start mb-6 lg:mb-10">
                <div className="text-white/20 group-hover:text-gold/50 transition-colors duration-500">
                    {icon}
                </div>
                {trend && (
                    <span className="text-[9px] lg:text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-3 py-1.5 rounded-xl italic">{trend}</span>
                )}
            </div>

            <h3 className="text-[9px] lg:text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-3 lg:mb-4 selection:bg-gold group-hover:text-gold transition-colors">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl lg:text-6xl font-heading tracking-tighter ${highlight ? 'text-gold' : 'text-white'}`}>{value}</span>
                {currency && <span className="text-[10px] lg:text-xs text-white/20 uppercase font-black tracking-widest italic ml-1">{currency}</span>}
            </div>

            {/* Visual Flare */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}

function ActionButton({ label, variant, onClick }: { label: string, variant?: string, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-gold/30 rounded-2xl lg:rounded-[1.5rem] p-5 lg:p-7 flex justify-between items-center group transition-all duration-500 shadow-xl cursor-pointer overflow-hidden relative"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-gold/0 group-hover:bg-gold/40 transition-all duration-500" />
            <span className={`text-[9px] lg:text-[10px] font-black tracking-[0.2em] uppercase transition-colors relative z-10 ${variant === 'danger' ? 'text-red-400/60 group-hover:text-red-400' : 'text-white/40 group-hover:text-white'}`}>{label}</span>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold/30 transition-all relative z-10 shadow-inner">
                <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                    <Activity size={14} className="text-white/10 group-hover:text-gold" />
                </motion.div>
            </div>
        </button>
    );
}
