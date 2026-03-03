import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Zap, Clock, User, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClassesView() {
    const { classes, addClass, members } = useData();
    const coaches = members.filter(m => m.role === 'coach');

    // Generate next 30 days
    const next30Days = React.useMemo(() => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, []);

    const [activeDate, setActiveDate] = useState<Date>(next30Days[0]);
    const [viewMode, setViewMode] = useState<'List' | 'Grid'>('List');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<any | null>(null);

    const enrolledMembers = React.useMemo(() => {
        if (!selectedClass) return [];
        return members.filter(m => m.bookedClasses.includes(selectedClass.id));
    }, [selectedClass, members]);

    const handleAddClass = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const dateInput = formData.get('date') as string;
        const timeInput = formData.get('time') as string;
        const [hours, minutes] = timeInput.split(':');

        const scheduledDate = new Date(dateInput);
        scheduledDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        try {
            await addClass({
                title: formData.get('title') as string,
                trainer: formData.get('trainer') as string,
                location: formData.get('location') as string,
                time: scheduledDate.toISOString(),
                duration: parseInt(formData.get('duration') as string, 10),
                total_spots: parseInt(formData.get('spots') as string, 10),
                spots_left: parseInt(formData.get('spots') as string, 10)
            });
            setShowAddModal(false);
        } catch (error) {
            console.error('Failed to add class:', error);
            alert('Failed to schedule class. Please try again.');
        }
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">Class Schedule</h1>
                    <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">Class Attendance & Capacity</p>
                </div>
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 font-bold">
                    {['Grid', 'List'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode as 'List' | 'Grid')}
                            className={`px-4 lg:px-5 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all ${viewMode === mode ? 'bg-gold text-black shadow-lg' : 'text-white/30 hover:text-white'}`}>
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
                <button onClick={() => setShowAddModal(true)} className="w-full lg:w-auto premium-button px-8 lg:px-10 py-4 lg:py-5 rounded-2xl transition-all hover:scale-[1.05] relative z-10 shadow-2xl shadow-gold/20">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-black">Update Schedule</span>
                </button>
            </motion.div>

            {/* Day Selector */}
            <div className="flex gap-2 lg:gap-4 p-2 bg-black/40 rounded-[1.5rem] lg:rounded-3xl border border-white/5 font-bold overflow-x-auto scrollbar-hide">
                {next30Days.map(date => {
                    const isSelected = activeDate.toDateString() === date.toDateString();
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const dayNumber = date.getDate();
                    const monthName = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => setActiveDate(date)}
                            className={`flex flex-col items-center justify-center min-w-[70px] lg:min-w-[80px] py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-all duration-500 relative overflow-hidden group ${isSelected
                                ? 'text-white'
                                : 'text-white/30 hover:text-white/70'
                                }`}
                        >
                            {isSelected && (
                                <motion.div layoutId="active-day-bg" className="absolute inset-0 bg-gold/10 border border-gold/30" />
                            )}
                            <span className="relative z-10 text-[9px] tracking-widest mb-1">{dayName}</span>
                            <span className="relative z-10 text-xl font-heading">{dayNumber}</span>
                            <span className="relative z-10 text-[8px] tracking-[0.2em] mt-1">{monthName}</span>
                        </button>
                    )
                })}
            </div>

            {/* Classes List */}
            <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 p-6 lg:p-10 shadow-2xl flex flex-col gap-6 lg:gap-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 font-bold">
                    <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Upcoming Classes</h3>
                    <span className="text-[9px] text-gold/60 font-bold tracking-widest uppercase">3 Classes Scheduled</span>
                </div>
                <div className={viewMode === 'List' ? "flex flex-col gap-4 font-bold" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-bold"}>
                    {classes.map((c, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={c.id}
                            onClick={() => setSelectedClass(c)}
                            className={`group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-gold/20 rounded-[1.5rem] lg:rounded-3xl p-6 lg:p-8 flex ${viewMode === 'List' ? 'flex-col sm:flex-row justify-between items-start sm:items-center' : 'flex-col justify-between items-start gap-8'} transition-all duration-500 cursor-pointer shadow-inner relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-gold/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className={`flex ${viewMode === 'List' ? 'items-center gap-6 lg:gap-8' : 'flex-col gap-5'} relative z-10 w-full`}>
                                <div className={`flex flex-col ${viewMode === 'List' ? 'items-center' : 'items-start'} min-w-[60px]`}>
                                    <span className="text-xl lg:text-2xl font-heading text-white group-hover:text-gold transition-colors">{c.time.split(' ')[0]}</span>
                                    <span className="text-[9px] text-white/20 font-black tracking-widest uppercase">{c.time.split(' ')[1]}</span>
                                </div>
                                {viewMode === 'List' && <div className="w-px h-10 lg:h-12 bg-white/5" />}
                                <div className="flex flex-col gap-1 lg:gap-1.5 flex-1">
                                    <h4 className="text-lg lg:text-xl font-heading text-white tracking-tight uppercase group-hover:text-gold transition-colors">{c.title}</h4>
                                    <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                        <div className="flex items-center gap-1.5 group-hover:text-white/50 transition-colors">
                                            <User size={12} className="text-gold/50" />
                                            <span className="truncate max-w-[120px]">{c.trainer}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 group-hover:text-white/50 transition-colors">
                                            <Clock size={12} className="text-gold/50" />
                                            <span>60 MIN</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`w-full ${viewMode === 'List' ? 'sm:w-auto flex justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0' : 'flex justify-between border-t pt-5'} items-center gap-6 lg:gap-8 relative z-10 border-white/5`}>
                                <div className="flex flex-col gap-1 text-left sm:text-right">
                                    <div className="text-sm font-mono tracking-[0.2em] text-white/80">
                                        <span className={c.spots_left === 0 ? 'text-red-500' : 'text-gold'}>
                                            {c.total_spots - c.spots_left}
                                        </span>
                                        <span className="text-white/20 mx-2">/</span>
                                        <span className="text-white/40">{c.total_spots}</span>
                                    </div>
                                    <div className={`flex items-center justify-start gap-2 ${viewMode === 'List' && 'sm:justify-end'}`}>
                                        {c.spots_left > 0 && <CheckCircle2 size={10} className="text-emerald-500/50" />}
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${c.spots_left === 0 ? 'text-red-500' : 'text-white/20'}`}>
                                            {c.spots_left === 0 ? 'Full' : 'Open'}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold/30 transition-all shrink-0">
                                    <ChevronRight size={16} className="text-white/10 group-hover:text-gold transition-all" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Add Class Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
                        <motion.form
                            onSubmit={handleAddClass}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0a0a0a] rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 w-full max-w-lg flex flex-col gap-6 lg:gap-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 max-h-[90vh] overflow-y-auto scrollbar-hide relative"
                        >
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-white/50" />
                            </button>

                            <div className="text-center font-bold">
                                <h2 className="text-2xl lg:text-3xl font-heading tracking-[0.2em] uppercase text-white mb-2">Deploy Class</h2>
                                <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 font-bold">New Schedule Entry</p>
                            </div>

                            <div className="flex flex-col gap-4 font-bold">
                                <input name="title" required placeholder="CLASS DESIGNATION (e.g. Flow, Core)" className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold placeholder-white/20" />

                                <div className="relative group">
                                    <select name="trainer" required className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white appearance-none uppercase tracking-widest cursor-pointer focus:border-gold/30 transition-all font-bold">
                                        <option value="" disabled selected className="text-white/20">SELECT INSTRUCTOR</option>
                                        {coaches.map(coach => (
                                            <option key={coach.id} value={coach.name} className="bg-black">{coach.name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-gold rotate-90 transition-colors pointer-events-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input name="date" type="date" required className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all uppercase tracking-widest" />
                                    <input name="time" type="time" required className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all uppercase tracking-widest" />
                                </div>

                                <input name="location" required placeholder="LOCATION (e.g. Studio 1)" className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold placeholder-white/20" />

                                <div className="grid grid-cols-2 gap-4">
                                    <input name="duration" type="number" required placeholder="DURATION (MINS)" defaultValue="60" className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold placeholder-white/20" />
                                    <input name="spots" type="number" required placeholder="CAPACITY LIMIT" defaultValue="20" className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold placeholder-white/20" />
                                </div>
                            </div>

                            <div className="flex gap-4 lg:gap-6 pt-2 font-bold">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-white/20 uppercase text-[10px] font-bold tracking-[0.3em] hover:text-white transition-colors">Abort</button>
                                <button type="submit" className="premium-button flex-1 h-14 rounded-2xl text-black font-black tracking-[0.3em] uppercase text-[10px] shadow-2xl shadow-gold/20">Initialize</button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>

            {/* Class Details Sidebar */}
            <AnimatePresence>
                {selectedClass && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm z-40"
                            onClick={() => setSelectedClass(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[#0a0a0a] border-l border-white/10 shadow-2xl z-50 flex flex-col"
                        >
                            <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                                <div>
                                    <h3 className="text-2xl font-heading text-white mb-1 uppercase">{selectedClass.title}</h3>
                                    <p className="text-[10px] text-gold tracking-widest font-bold uppercase">{selectedClass.time} • {selectedClass.trainer}</p>
                                </div>
                                <button onClick={() => setSelectedClass(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={20} className="text-white/50" />
                                </button>
                            </div>

                            <div className="p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 scrollbar-hide">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
                                        <span className="text-2xl font-heading text-white mb-1">{selectedClass.total_spots - selectedClass.spots_left}</span>
                                        <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Enrolled</span>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
                                        <span className="text-2xl font-heading text-gold mb-1">{selectedClass.spots_left}</span>
                                        <span className="text-[8px] text-gold/50 uppercase tracking-widest font-bold">Spots Left</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase mb-4">Roster</h4>
                                    {enrolledMembers.length === 0 ? (
                                        <div className="text-center py-10 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <p className="text-sm text-white/30 font-medium">No members enrolled yet.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {enrolledMembers.map(member => (
                                                <div key={member.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-gold/20 transition-colors">
                                                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-sm font-bold text-white truncate">{member.name}</span>
                                                        <span className="text-[9px] text-white/30 uppercase tracking-widest">{member.role} • {member.membershipStatus}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-black/40">
                                <button className="w-full py-4 premium-button rounded-xl font-black text-[10px] tracking-[0.3em] uppercase text-black">
                                    Message Roster
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

