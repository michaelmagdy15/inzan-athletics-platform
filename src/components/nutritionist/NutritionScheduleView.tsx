import React, { useState } from "react";
import { Calendar, Clock, Plus, Filter, MoreVertical, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function NutritionScheduleView() {
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    const days = [
        { name: "Mon", date: 8 },
        { name: "Tue", date: 9 },
        { name: "Wed", date: 10 },
        { name: "Thu", date: 11 },
        { name: "Fri", date: 12 },
        { name: "Sat", date: 13 },
        { name: "Sun", date: 14 },
    ];

    return (
        <div className="flex flex-col gap-8 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-1 uppercase">Schedule</h2>
                    <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase font-medium">Consultations & Assessments</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FFB800] hover:text-black transition-colors">
                    <Plus size={18} />
                </button>
            </header>

            {/* Day Selector */}
            <div className="flex justify-between gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {days.map((day) => (
                    <button
                        key={day.date}
                        onClick={() => setSelectedDay(day.date)}
                        className={`flex flex-col items-center min-w-[50px] py-4 rounded-[1.5rem] border transition-all ${selectedDay === day.date
                                ? "bg-[#FFB800] border-[#FFB800] text-black shadow-[0_10px_20px_rgba(255,184,0,0.2)]"
                                : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                            }`}
                    >
                        <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${selectedDay === day.date ? "text-black/60" : "text-gray-600"}`}>
                            {day.name}
                        </span>
                        <span className="text-xl font-heading font-bold">{day.date}</span>
                    </button>
                ))}
            </div>

            {/* Time Slots */}
            <div className="flex flex-col gap-4">
                {[
                    { time: "09:00 AM", client: "Dina Salah", type: "First Assessment", status: "completed" },
                    { time: "10:30 AM", client: "Youssef Ali", type: "Follow-up", status: "scheduled" },
                    { time: "01:00 PM", client: "Sarah J.", type: "Meal Plan Review", status: "scheduled" },
                    { time: "04:30 PM", client: "Ahmed M.", type: "Metabolic Test", status: "scheduled" },
                ].map((slot, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative p-5 rounded-3xl border transition-all group ${slot.status === 'completed'
                                ? "bg-emerald-500/5 border-emerald-500/10 opacity-60"
                                : "bg-white/5 border-white/10 hover:border-[#FFB800]/30"
                            }`}
                    >
                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-[#FFB800] mb-0.5">{slot.time.split(" ")[1]}</span>
                                    <span className="text-sm font-heading tracking-tighter">{slot.time.split(" ")[0]}</span>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10 mx-1" />
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-0.5">{slot.client}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{slot.type}</p>
                                </div>
                            </div>

                            {slot.status === 'completed' ? (
                                <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                                <button className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                                    <MoreVertical size={16} className="text-gray-600 group-hover:text-white" />
                                </button>
                            )}
                        </div>

                        {slot.status === 'scheduled' && (
                            <div className="mt-4 flex gap-2 overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-500">
                                <button className="flex-1 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[9px] font-bold uppercase tracking-wider">
                                    Check-in
                                </button>
                                <button className="flex-1 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-bold uppercase tracking-wider">
                                    No Show
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Availability Management */}
            <section className="mt-4 bg-white/5 border border-white/5 rounded-3xl p-6">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Availability Stats</h3>
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <span className="text-2xl font-heading text-white">4 / 8</span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Slots Booked today</span>
                    </div>
                    <button className="text-[10px] font-bold text-[#FFB800] uppercase tracking-widest border-b border-[#FFB800]/30 pb-0.5">
                        Optimize Hours
                    </button>
                </div>
            </section>
        </div>
    );
}
