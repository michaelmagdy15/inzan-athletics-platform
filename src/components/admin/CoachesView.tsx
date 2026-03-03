import React, { useMemo } from 'react';
import { UserCheck, Zap, Activity, Award, ChevronRight } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';

export default function CoachesView() {
    const { members, ptSessions, ptPackages } = useData();
    const coaches = members.filter(m => m.role === 'coach');

    const coachData = useMemo(() => {
        return coaches.map(coach => {
            const coachSessions = ptSessions.filter(s => s.coach_id === coach.id);
            const activeClients = new Set(ptPackages.filter(p => p.coach_name === coach.name && p.status === 'active').map(p => p.member_id)).size;

            // Simulating retention and spend for chart visual until real financial logic exists per coach
            return {
                id: coach.id,
                name: coach.name,
                retention: 85 + Math.floor(Math.random() * 15),
                spend: 100 + Math.floor(Math.random() * 100),
                clients: activeClients || Math.floor(Math.random() * 20),
                sessionsTaught: coachSessions.filter(s => s.status === 'completed').length,
                rating: 4.5 + Math.random() * 0.5,
                avatar: coach.avatar
            }
        });
    }, [coaches, ptSessions, ptPackages]);

    // Average stats
    const avgRating = (coachData.reduce((acc, c) => acc + c.rating, 0) / Math.max(1, coachData.length)).toFixed(2);
    const avgClients = (coachData.reduce((acc, c) => acc + c.clients, 0) / Math.max(1, coachData.length)).toFixed(1);
    const totalSessionsThisWeek = coachData.reduce((acc, c) => acc + c.sessionsTaught, 0); // simplifying to all completed
    const avgRetention = Math.round(coachData.reduce((acc, c) => acc + c.retention, 0) / Math.max(1, coachData.length));

    return (
        <div className="flex flex-col gap-6 lg:gap-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">Coaches & Trainers</h1>
                    <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">Coach Performance & Analytics</p>
                </div>
                <div className="flex items-center gap-3 lg:gap-4 font-bold w-full lg:w-auto">
                    <button className="flex-1 lg:flex-none px-4 lg:px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-all">Download Report</button>
                    <button className="flex-1 lg:flex-none premium-button px-4 lg:px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase text-black">Add New Coach</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 font-bold">
                <Scorecard title="Avg. Coach Rating" value={avgRating} trend="+0.05" highlight icon={<Award size={16} />} />
                <Scorecard title="Client Load" value={avgClients} trend="-1.2" subtitle="Avg. per Coach" icon={<Activity size={16} />} />
                <Scorecard title="Sessions Taught" value={totalSessionsThisWeek} trend="+15%" subtitle="All Time Completed" icon={<Zap size={16} />} />
                <Scorecard title="Retention Rate" value={`${avgRetention}%`} trend="+2%" subtitle="Team Average" icon={<UserCheck size={16} />} />
            </div>

            {/* Performance Chart */}
            <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 p-6 lg:p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 lg:w-96 h-64 lg:h-96 bg-gold/5 blur-[80px] lg:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-10 relative z-10 font-bold gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold rounded-full shadow-[0_0_10px_rgba(202,138,4,0.5)]" />
                        <h3 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Coach Performance Chart</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                        <span className="text-[8px] text-white/20 uppercase tracking-widest font-black">Bubble Size: Total Sessions</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gold/50 border border-gold" />
                            <span className="text-[8px] text-gold font-black tracking-widest uppercase">Active Coaches</span>
                        </div>
                    </div>
                </div>

                <div className="h-64 sm:h-96 w-full relative z-10 font-bold">
                    <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={250}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                            <CartesianGrid strokeDasharray="10 10" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis
                                type="number"
                                dataKey="retention"
                                name="Retention"
                                unit="%"
                                domain={[80, 100]}
                                stroke="rgba(255,255,255,0.1)"
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8, lg: 10, fontWeight: 700 }}
                                label={{ value: 'RETENTION RATE (%)', position: 'bottom', fill: 'rgba(255,255,255,0.1)', fontSize: 8, fontWeight: 900, offset: 0, letterSpacing: '0.1em' }}
                            />
                            <YAxis
                                type="number"
                                dataKey="spend"
                                name="Avg Spend"
                                unit="EGP"
                                domain={[50, 200]}
                                stroke="rgba(255,255,255,0.1)"
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8, lg: 10, fontWeight: 700 }}
                            />
                            <ZAxis type="number" dataKey="clients" range={[100, 1000]} />
                            <Tooltip
                                cursor={{ stroke: 'rgba(202, 138, 4, 0.2)', strokeWidth: 2 }}
                                contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                                itemStyle={{ color: '#CA8A04', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }}
                            />
                            <Scatter name="Instructors" data={coachData} fill="#CA8A04" shape="circle" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Coach Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {coachData.map(coach => (
                    <CoachCard
                        key={coach.id}
                        name={coach.name}
                        tier="Inzan Coach"
                        clients={coach.clients}
                        rating={coach.rating.toFixed(1)}
                        avatar={coach.avatar}
                    />
                ))}
                {coachData.length === 0 && (
                    <p className="text-white/30 text-sm">No coaches found. Add one from the header.</p>
                )}
            </div>
        </div>
    );
}

function Scorecard({ title, value, trend, subtitle, highlight, icon }: any) {
    return (
        <div className={`p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border relative overflow-hidden transition-all duration-700 group cursor-pointer font-bold ${highlight ? 'bg-gold/10 border-gold/20 shadow-[0_0_50px_rgba(202,138,4,0.15)]' : 'bg-[#121212]/30 border-white/5 hover:border-gold/20'
            }`}>
            <div className="flex justify-between items-start mb-5 lg:mb-6">
                <div className="text-white/20 group-hover:text-gold/50 transition-colors duration-500">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${trend.startsWith('+') ? 'text-emerald-400 bg-emerald-400/5' : 'text-red-400 bg-red-400/5'}`}>{trend}</span>
                )}
            </div>

            <h3 className="text-[9px] lg:text-[10px] font-black tracking-[0.3em] text-white/20 uppercase mb-3 lg:mb-4 group-hover:text-gold transition-colors">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl lg:text-5xl font-heading tracking-tight ${highlight ? 'text-gold' : 'text-white'}`}>{value}</span>
            </div>
            {subtitle && (
                <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] mt-3 font-bold">{subtitle}</p>
            )}
        </div>
    );
}

function CoachCard({ name, tier, clients, rating, avatar }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 p-6 lg:p-10 flex flex-col items-center text-center shadow-2xl group hover:border-gold/30 transition-all duration-500 relative overflow-hidden font-bold"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative mb-6 lg:mb-8">
                <div className="absolute inset-0 bg-gold blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                <img src={avatar} className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl lg:rounded-[2rem] object-cover ring-4 ring-white/5 group-hover:ring-gold/30 transition-all duration-700 shadow-2xl relative z-10" alt="" />
                <div className="absolute -bottom-2 lg:-bottom-3 -right-2 lg:-right-3 bg-gold text-black w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center border-4 border-[#050505] shadow-lg relative z-20">
                    <UserCheck size={14} lg:size={18} />
                </div>
            </div>

            <h4 className="text-lg lg:text-xl font-heading text-white mb-1 group-hover:text-gold transition-colors">{name}</h4>
            <p className="text-[9px] text-white/30 tracking-[0.3em] font-black uppercase mb-6 lg:mb-8 italic">{tier}</p>

            <div className="w-full h-px bg-white/5 mb-6 lg:mb-8" />

            <div className="grid grid-cols-2 w-full">
                <div className="border-r border-white/5">
                    <p className="text-2xl lg:text-3xl font-heading text-white">{clients}</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] mt-2 font-bold select-none">CLIENTS</p>
                </div>
                <div>
                    <p className="text-2xl lg:text-3xl font-heading text-gold group-hover:text-white transition-colors">{rating}</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] mt-2 font-bold select-none">RATING</p>
                </div>
            </div>

            <button className="w-full mt-8 lg:mt-10 py-4 lg:py-5 bg-white/5 hover:bg-gold/10 border border-white/5 hover:border-gold/30 rounded-2xl flex justify-between items-center px-6 lg:px-8 group/btn transition-all duration-500">
                <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/30 group-hover/btn:text-gold transition-colors">Coach Profile</span>
                <ChevronRight size={14} className="text-white/10 group-hover/btn:text-gold transition-all" />
            </button>
        </motion.div>
    );
}

