import React, { useState } from "react";
import { Utensils, Plus, Tag, Search, Clock, Zap, Flame, Coffee } from "lucide-react";
import { motion } from "motion/react";

export default function MealPlanLibraryView() {
    const [searchTerm, setSearchTerm] = useState("");

    const templates = [
        { title: "High Protein / Lean Muscle", calories: 2800, macros: "40/30/30", time: "Moderate", type: "Bulking" },
        { title: "Keto / Low Carb Shred", calories: 1800, macros: "10/30/60", time: "Complex", type: "Cutting" },
        { title: "Endurance Fuel Plan", calories: 3500, macros: "60/20/20", time: "Simple", type: "Performance" },
        { title: "Vegan Metabolic Boost", calories: 2200, macros: "50/25/25", time: "Moderate", type: "Wellness" },
    ];

    return (
        <div className="flex flex-col gap-6 pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-1 uppercase">Meal Plans</h2>
                    <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase font-medium">Template Library</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-[#FFB800] border border-[#FFB800]/20 flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,184,0,0.3)] hover:scale-105 transition-transform active:scale-95">
                    <Plus size={20} />
                </button>
            </header>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {["All", "Bulking", "Cutting", "Performance", "Wellness"].map((cat) => (
                    <button
                        key={cat}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap hover:bg-[#FFB800] hover:text-black transition-all"
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-4">
                {templates.map((plan, idx) => (
                    <motion.div
                        key={plan.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group hover:border-[#FFB800]/30 transition-all"
                    >
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center group-hover:bg-[#FFB800]/10 transition-colors">
                                <Flame size={18} className="text-[#FFB800]" />
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 bg-white/5`}>
                                {plan.type}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 relative z-10">{plan.title}</h3>

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="flex items-center gap-1.5">
                                <Flame size={12} className="text-orange-400" />
                                <span className="text-[10px] font-mono text-gray-400">{plan.calories} kcal</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Zap size={12} className="text-blue-400" />
                                <span className="text-[10px] font-mono text-gray-400">{plan.macros} (P/C/F)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            <button className="py-2.5 bg-black/40 border border-white/5 rounded-xl text-[9px] font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors">
                                Edit Plan
                            </button>
                            <button className="py-2.5 bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-xl text-[9px] font-bold uppercase tracking-wider text-[#FFB800] hover:bg-[#FFB800] hover:text-black transition-colors">
                                Assign to Client
                            </button>
                        </div>

                        {/* Aesthetic Glow */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FFB800]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#FFB800]/10 transition-colors" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
