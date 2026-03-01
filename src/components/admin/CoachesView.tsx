import React from 'react';
import { UserCheck, Zap, Activity, Award, ChevronRight } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const coachRoiData = [
    { name: 'Adam A.', retention: 92, spend: 150, clients: 42 },
    { name: 'Elena V.', retention: 95, spend: 110, clients: 35 },
    { name: 'Marcus R.', retention: 88, spend: 180, clients: 38 },
    { name: 'Sarah J.', retention: 90, spend: 130, clients: 40 },
    { name: 'Noura S.', retention: 85, spend: 90, clients: 32 },
];

export default function CoachesView() {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-heading tracking-tight text-white mb-1 uppercase">Coaches & Trainers</h1>
                    <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">Coach Performance & Analytics</p>
                </div>
                <div className="flex items-center gap-4 font-bold">
                    <button className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-all">Download Report</button>
                    <button className="premium-button px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase text-black">Add New Coach</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-bold">
                <Scorecard title="Avg. Coach Rating" value="4.92" trend="+0.05" highlight icon={<Award size={16} />} />
                <Scorecard title="Client Load" value="18.5" trend="-1.2" subtitle="Avg. per Coach" icon={<Activity size={16} />} />
                <Scorecard title="Sessions Taught" value="420" trend="+15%" subtitle="This Week" icon={<Zap size={16} />} />
                <Scorecard title="Retention Rate" value="94%" trend="+2%" subtitle="Team Average" icon={<UserCheck size={16} />} />
            </div>

            {/* Performance Chart */}
            <div className="glass-card rounded-[3rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex justify-between items-center mb-10 relative z-10 font-bold">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-gold rounded-full shadow-[0_0_10px_rgba(202,138,4,0.5)]" />
                        <h3 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Coach Performance Chart</h3>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-[8px] text-white/20 uppercase tracking-widest font-black">Bubble Size: Total Sessions</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gold/50 border border-gold" />
                            <span className="text-[8px] text-gold font-black tracking-widest uppercase">Active Coaches</span>
                        </div>
                    </div>
                </div>

                <div className="h-96 w-full relative z-10 font-bold">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 0 }}>
                            <CartesianGrid strokeDasharray="10 10" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis
                                type="number"
                                dataKey="retention"
                                name="Retention"
                                unit="%"
                                domain={[80, 100]}
                                stroke="rgba(255,255,255,0.1)"
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
                                label={{ value: 'RETENTION RATE (%)', position: 'bottom', fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 900, offset: 0, letterSpacing: '0.2em' }}
                            />
                            <YAxis
                                type="number"
                                dataKey="spend"
                                name="Avg Spend"
                                unit="EGP"
                                domain={[50, 200]}
                                stroke="rgba(255,255,255,0.1)"
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
                                label={{ value: 'CLIENT SPEND (EGP)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 900, letterSpacing: '0.2em' }}
                            />
                            <ZAxis type="number" dataKey="clients" range={[400, 2000]} />
                            <Tooltip
                                cursor={{ stroke: 'rgba(202, 138, 4, 0.2)', strokeWidth: 2 }}
                                contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: '#CA8A04', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            />
                            <Scatter name="Instructors" data={coachRoiData} fill="#CA8A04" shape="circle" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Coach Profiles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <CoachCard name="Adam Althenbarden" tier="High Performance" clients={42} rating={4.9} avatar="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop" />
                <CoachCard name="Elena Volkov" tier="Handstands & Flow" clients={35} rating={5.0} avatar="https://i.pravatar.cc/150?u=4" />
                <CoachCard name="Marcus Reed" tier="Power & Strength" clients={38} rating={4.8} avatar="https://i.pravatar.cc/150?u=5" />
            </div>
        </div>
    );
}

function Scorecard({ title, value, trend, subtitle, highlight, icon }: any) {
    return (
        <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden transition-all duration-700 group cursor-pointer font-bold ${highlight ? 'bg-gold/10 border-gold/20 shadow-[0_0_50px_rgba(202,138,4,0.15)]' : 'bg-[#121212]/30 border-white/5 hover:border-gold/20'
            }`}>
            <div className="flex justify-between items-start mb-6">
                <div className="text-white/20 group-hover:text-gold/50 transition-colors duration-500">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${trend.startsWith('+') ? 'text-emerald-400 bg-emerald-400/5' : 'text-red-400 bg-red-400/5'}`}>{trend}</span>
                )}
            </div>

            <h3 className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase mb-4 group-hover:text-gold transition-colors">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-heading tracking-tight ${highlight ? 'text-gold' : 'text-white'}`}>{value}</span>
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
            className="glass-card rounded-[3rem] border border-white/5 p-10 flex flex-col items-center text-center shadow-2xl group hover:border-gold/30 transition-all duration-500 relative overflow-hidden font-bold"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gold blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                <img src={avatar} className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-white/5 group-hover:ring-gold/30 transition-all duration-700 shadow-2xl relative z-10" alt="" />
                <div className="absolute -bottom-3 -right-3 bg-gold text-black w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-[#050505] shadow-lg relative z-20">
                    <UserCheck size={18} />
                </div>
            </div>

            <h4 className="text-xl font-heading text-white mb-1 group-hover:text-gold transition-colors">{name}</h4>
            <p className="text-[9px] text-white/30 tracking-[0.3em] font-black uppercase mb-8 italic">{tier}</p>

            <div className="w-full h-px bg-white/5 mb-8" />

            <div className="grid grid-cols-2 w-full">
                <div className="border-r border-white/5">
                    <p className="text-3xl font-heading text-white">{clients}</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] mt-2 font-bold select-none">CLIENTS</p>
                </div>
                <div>
                    <p className="text-3xl font-heading text-gold group-hover:text-white transition-colors">{rating}</p>
                    <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] mt-2 font-bold select-none">RATING</p>
                </div>
            </div>

            <button className="w-full mt-10 py-5 bg-white/5 hover:bg-gold/10 border border-white/5 hover:border-gold/30 rounded-2xl flex justify-between items-center px-8 group/btn transition-all duration-500">
                <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/30 group-hover/btn:text-gold transition-colors">Coach Profile</span>
                <ChevronRight size={14} className="text-white/10 group-hover/btn:text-gold transition-all" />
            </button>
        </motion.div>
    );
}

