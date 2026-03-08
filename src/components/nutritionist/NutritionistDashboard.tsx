import React from "react";
import { Users, Utensils, Calendar, ChevronRight, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { useData } from "../../context/DataContext";

export default function NutritionistDashboard() {
    const { profiles, currentUser } = useData();

    // Placeholder stats - in a real app these would be fetched from the new tables
    const stats = [
        { label: "Active Clients", value: "24", icon: <Users className="text-blue-400" />, trend: "+12%" },
        { label: "Meal Plans", value: "15", icon: <Utensils className="text-emerald-400" />, trend: "+5%" },
        { label: "Consultations", value: "8", icon: <Calendar className="text-gold" />, trend: "Today" },
    ];

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-light tracking-tight text-white mb-2">
                    Welcome back, <span className="font-bold text-[#FFB800]">{currentUser?.full_name?.split(' ')[0]}</span>
                </h1>
                <p className="text-sm text-gray-400">Here's your nutritional oversight for today.</p>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-6 flex justify-between items-center group hover:bg-white/10 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5">
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-heading text-white">{stat.value}</span>
                                    <span className="text-[9px] text-emerald-400 font-bold">{stat.trend}</span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                    </motion.div>
                ))}
            </div>

            {/* Upcoming Consultations */}
            <section className="flex flex-col gap-4">
                <div className="flex justify-between items-end px-1">
                    <h3 className="font-medium text-lg tracking-tight">Today's Schedule</h3>
                    <button className="text-[10px] text-gray-400 tracking-widest uppercase hover:text-[#FFB800] transition-colors">
                        View Full
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center border border-gold/10">
                                    <span className="text-xs font-bold text-gold">C{i + 1}</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white">Client Name {i + 1}</h4>
                                    <p className="text-[10px] text-gray-500">Nutritional Assessment • {10 + i}:00 AM</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                                    Remind
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Critical Alerts / Tasks */}
            <section className="bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="text-[#FFB800]" size={20} />
                    <h3 className="font-bold text-[#FFB800] text-xs uppercase tracking-widest">Priority Tasks</h3>
                </div>
                <ul className="flex flex-col gap-4">
                    <li className="flex gap-4 items-start">
                        <div className="w-1 h-1 rounded-full bg-gold mt-2 shrink-0" />
                        <p className="text-xs text-gray-300">
                            3 client assessments are awaiting your review and meal plan assignment.
                        </p>
                    </li>
                    <li className="flex gap-4 items-start">
                        <div className="w-1 h-1 rounded-full bg-gold mt-2 shrink-0" />
                        <p className="text-xs text-gray-300">
                            Weekly nutrition report for Admin is due in 2 days.
                        </p>
                    </li>
                </ul>
            </section>
        </div>
    );
}
