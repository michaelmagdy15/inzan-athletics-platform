import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Zap, Clock, User, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClassesView() {
    const { classes } = useData();
    const [activeDay, setActiveDay] = useState('THU');
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return (
        <div className="flex flex-col gap-6 lg:gap-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">Class Schedule</h1>
                    <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">Class Attendance & Capacity</p>
                </div>
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 font-bold">
                    {['Grid', 'List'].map((mode) => (
                        <button key={mode} className={`px-4 lg:px-5 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all ${mode === 'List' ? 'bg-gold text-black shadow-lg' : 'text-white/30 hover:text-white'}`}>
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            {/* Attendance Insight */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col lg:flex-row items-center justify-between shadow-2xl relative overflow-hidden group font-bold gap-6"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-50 shadow-[0_0_15px_rgba(202,138,4,0.3)]" />
                <div className="flex flex-col sm:flex-row items-start lg:items-center gap-6 lg:gap-8 relative z-10 w-full lg:w-auto">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-[0_0_30px_rgba(202,138,4,0.1)] group-hover:scale-110 transition-transform duration-700 shrink-0">
                        <Zap className="text-gold" size={24} lg:size={28} />
                    </div>
                    <div className="max-w-xl">
                        <h3 className="text-[10px] font-black text-gold tracking-[0.4em] uppercase mb-2 lg:mb-4">Attendance Insight</h3>
                        <p className="text-sm text-white/70 leading-relaxed font-light">
                            Thursday 14:00 <span className="text-white font-medium">"Flow"</span> classes are showing low attendance. <span className="text-white font-medium">Adjust scheduling accordingly</span> during this slot.
                        </p>
                    </div>
                </div>
                <button className="w-full lg:w-auto premium-button px-8 lg:px-10 py-4 lg:py-5 rounded-2xl transition-all hover:scale-[1.05] relative z-10 shadow-2xl shadow-gold/20">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-black">Update Schedule</span>
                </button>
            </motion.div>

            {/* Day Selector */}
            <div className="flex gap-2 lg:gap-4 p-2 bg-black/40 rounded-[1.5rem] lg:rounded-3xl border border-white/5 font-bold overflow-x-auto scrollbar-hide">
                {days.map(day => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`flex-1 min-w-[70px] py-4 lg:py-5 rounded-xl lg:rounded-2xl text-[10px] font-black tracking-[0.4em] transition-all duration-500 relative overflow-hidden group ${activeDay === day
                            ? 'text-white'
                            : 'text-white/20 hover:text-white/50'
                            }`}
                    >
                        {activeDay === day && (
                            <motion.div layoutId="active-day-bg" className="absolute inset-0 bg-white/10 border border-white/10" />
                        )}
                        <span className="relative z-10">{day}</span>
                    </button>
                ))}
            </div>

            {/* Classes List */}
            <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 p-6 lg:p-10 shadow-2xl flex flex-col gap-6 lg:gap-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 font-bold">
                    <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Upcoming Classes</h3>
                    <span className="text-[9px] text-gold/60 font-bold tracking-widest uppercase">3 Classes Scheduled</span>
                </div>
                <div className="flex flex-col gap-4 font-bold">
                    {classes.map((c, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={c.id}
                            className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-gold/20 rounded-[1.5rem] lg:rounded-3xl p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-500 cursor-pointer shadow-inner relative overflow-hidden gap-6"
                        >
                            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-gold/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center gap-6 lg:gap-8 relative z-10">
                                <div className="flex flex-col items-center min-w-[60px]">
                                    <span className="text-xl lg:text-2xl font-heading text-white group-hover:text-gold transition-colors">{c.time.split(' ')[0]}</span>
                                    <span className="text-[9px] text-white/20 font-black tracking-widest uppercase">{c.time.split(' ')[1]}</span>
                                </div>
                                <div className="w-px h-10 lg:h-12 bg-white/5" />
                                <div className="flex flex-col gap-1 lg:gap-1.5">
                                    <h4 className="text-lg lg:text-xl font-heading text-white tracking-tight uppercase group-hover:text-gold transition-colors">{c.title}</h4>
                                    <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                        <div className="flex items-center gap-1.5 group-hover:text-white/50 transition-colors">
                                            <User size={12} className="text-gold/50" />
                                            <span>{c.trainer}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 group-hover:text-white/50 transition-colors">
                                            <Clock size={12} className="text-gold/50" />
                                            <span>60 MIN</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full sm:w-auto flex justify-between sm:justify-end items-center gap-6 lg:gap-8 relative z-10 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                                <div className="flex flex-col gap-1 text-left sm:text-right">
                                    <div className="text-sm font-mono tracking-[0.2em] text-white/80">
                                        <span className={c.spots_left === 0 ? 'text-red-500' : 'text-gold'}>
                                            {c.total_spots - c.spots_left}
                                        </span>
                                        <span className="text-white/20 mx-2">/</span>
                                        <span className="text-white/40">{c.total_spots}</span>
                                    </div>
                                    <div className="flex items-center justify-start sm:justify-end gap-2">
                                        {c.spots_left > 0 && <CheckCircle2 size={10} className="text-emerald-500/50" />}
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${c.spots_left === 0 ? 'text-red-500' : 'text-white/20'}`}>
                                            {c.spots_left === 0 ? 'Full' : 'Open'}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold/30 transition-all">
                                    <ChevronRight size={16} className="text-white/10 group-hover:text-gold transition-all" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

