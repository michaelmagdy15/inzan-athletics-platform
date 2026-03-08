import React, { useState } from "react";
import { Search, Filter, Plus, ChevronRight, UserPlus, Scale } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../../context/DataContext";

export default function ClientAssessmentsView() {
    const { profiles } = useData();
    const [searchTerm, setSearchTerm] = useState("");

    const members = profiles.filter(p =>
        p.role === 'member' &&
        (p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex flex-col gap-6 h-full pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-light tracking-tight text-white mb-1 uppercase">Clients</h2>
                    <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase font-medium">Nutritional Oversight</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FFB800] hover:text-black transition-colors">
                    <UserPlus size={18} />
                </button>
            </header>

            {/* Search & Filter */}
            <div className="relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#FFB800] transition-colors" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all outline-none"
                />
            </div>

            {/* Client List */}
            <div className="flex flex-col gap-4">
                {members.map((member, idx) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-5 relative overflow-hidden group hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-4">
                                <img
                                    src={member.avatar_url || `https://i.pravatar.cc/150?u=${member.id}`}
                                    alt={member.full_name}
                                    className="w-12 h-12 rounded-full border border-white/10"
                                />
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-0.5">{member.full_name}</h4>
                                    <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">ID: {member.member_code || 'N/A'}</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-white/20 group-hover:text-[#FFB800] transition-colors" />
                        </div>

                        {/* Quick Metrics (Placeholder) */}
                        <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center border border-white/5">
                                    <Scale size={14} className="text-[#FFB800]" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Body Fat</p>
                                    <p className="text-xs font-bold text-white leading-none">18.5%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex-1 py-2 bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-xl text-[9px] font-black text-[#FFB800] uppercase tracking-widest hover:bg-[#FFB800] hover:text-black transition-all">
                                    New Assessment
                                </button>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold/5 effectively to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                ))}

                {members.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <p className="text-xs">No clients found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
