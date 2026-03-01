import React from 'react';
import { Member } from '../../context/DataContext';
import { AlertCircle, Plus, Search, Filter, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface MembersViewProps {
    members: Member[];
    selectedMember: Member | null;
    setSelectedMember: (member: Member) => void;
    onNewMember: () => void;
}

export default function MembersView({ members, selectedMember, setSelectedMember, onNewMember }: MembersViewProps) {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-heading tracking-tight text-white mb-1 uppercase">Registry Management</h1>
                    <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">Core Intelligence Database</p>
                </div>
                <button
                    onClick={onNewMember}
                    className="premium-button px-8 py-4 rounded-2xl flex items-center gap-3 shadow-2xl transition-all hover:scale-[1.02]"
                >
                    <Plus size={16} className="text-black" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-black">Initialize Entity</span>
                </button>
            </div>

            {/* Neural Retention Engine Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8 flex items-center justify-between relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] group-hover:scale-110 transition-transform duration-700">
                        <AlertCircle className="text-red-500" size={28} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-1">Neural Retention Protocol</h3>
                        <p className="text-[11px] text-white/40 leading-relaxed font-light">3 high-net entities identified with potential churn vectors based on engagement metrics.</p>
                    </div>
                </div>
                <button className="px-8 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[9px] font-black text-red-100 tracking-[0.2em] uppercase hover:bg-red-500/20 transition-all relative z-10">
                    Deploy Stabilization Campaign
                </button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Scorecard title="Total Entities" value="1,432" trend="+2.1%" />
                <Scorecard title="Active Flux" value="1,118" trend="+0.8%" />
                <Scorecard title="New Arrivals" value="87" subtitle="Current Cycle" />
                <Scorecard title="Live Syncs" value="24" highlight />
            </div>

            {/* Member Management Table */}
            <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative">
                <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={16} className="text-gold/50" />
                        <h3 className="text-[10px] font-black text-white/30 tracking-[0.3em] uppercase">Registry Oversight</h3>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-white/5 rounded-xl text-[9px] font-bold text-white/40 tracking-widest uppercase border border-white/5 hover:text-white hover:border-gold/30 transition-all"><Filter size={12} /> Filter</button>
                        <button className="px-6 py-2.5 bg-gold/10 rounded-xl text-[9px] font-black text-gold tracking-widest uppercase border border-gold/20">All Status</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0c0c0c]/50">
                            <tr>
                                <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.3em] font-black border-b border-white/5">Identity Profile</th>
                                <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.3em] font-black border-b border-white/5">Access Tier</th>
                                <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.3em] font-black border-b border-white/5">Registry Status</th>
                                <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.3em] font-black border-b border-white/5">Auth Date</th>
                                <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.3em] font-black border-b border-white/5 text-right">Risk Vector</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members.map((member, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={member.id}
                                    onClick={() => setSelectedMember(member)}
                                    className={`cursor-pointer transition-all duration-500 group relative ${selectedMember?.id === member.id ? 'bg-gold/5' : 'hover:bg-white/[0.03]'}`}
                                >
                                    <td className="px-10 py-8 relative">
                                        {selectedMember?.id === member.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold shadow-[0_0_15px_rgba(202,138,4,0.5)]" />
                                        )}
                                        <div className="flex items-center gap-5">
                                            <div className="relative group/avatar">
                                                <div className="absolute inset-0 bg-gold blur-lg opacity-0 group-hover/avatar:opacity-20 transition-opacity" />
                                                <img src={member.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5 shadow-2xl relative z-10" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-heading text-lg tracking-tight text-white group-hover:text-gold transition-colors">{member.name}</span>
                                                <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold group-hover:text-white/40 transition-colors">Protocol #{member.id.substring(0, 8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-[10px] text-white/40 tracking-[0.1em] font-light uppercase group-hover:text-white/60 transition-colors italic">{member.role}</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(202,138,4,0.5)]" />
                                            <span className="text-[10px] font-black text-gold tracking-[0.2em] uppercase">Authorized</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-[11px] text-white/30 font-mono tracking-widest uppercase">09/11/2023</td>
                                    <td className="px-10 py-8 text-right">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg ${member.riskStatus === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                            {member.riskStatus.toUpperCase()}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Scorecard({ title, value, trend, subtitle, highlight }: any) {
    return (
        <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden transition-all duration-700 group cursor-pointer ${highlight ? 'bg-gold/10 border-gold/20 shadow-[0_0_50px_rgba(202,138,4,0.1)]' : 'bg-[#121212]/30 border-white/5 hover:border-gold/20'
            }`}>
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <Search size={14} className="text-gold/30" />
            </div>

            <h3 className="text-[9px] font-black tracking-[0.3em] text-white/20 uppercase mb-5 group-hover:text-gold/50 transition-colors">{title}</h3>
            <div className="flex items-baseline gap-4">
                <span className={`text-5xl font-heading tracking-tight ${highlight ? 'text-gradient-gold' : 'text-white'}`}>{value}</span>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded italic">{trend}</span>
                )}
            </div>
            {subtitle && (
                <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] mt-3 font-bold">{subtitle}</p>
            )}

            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}

