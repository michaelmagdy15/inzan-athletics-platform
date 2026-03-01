import React, { useState } from 'react';
import { useData, IoTZone } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Cpu, Activity, Zap, Thermometer, Sun, Shield } from 'lucide-react';

export default function DashboardView() {
    const { iotZones } = useData();
    const [selectedZone, setSelectedZone] = useState<IoTZone | null>(iotZones[0] || null);

    // Stats calculation (Mocked for premium feel)
    const totalRevenue = 124500;
    const activeUsers = 842;
    const kitchenSales = 12300;
    const centerLoad = 68;

    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading tracking-tight text-white mb-1 uppercase">Operational Control</h1>
                    <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">Real-time System Oversight</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-5 py-2.5 rounded-2xl backdrop-blur-xl transition-all hover:border-gold/30 group cursor-pointer">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase group-hover:text-white transition-colors">Satellite Uplink Active</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} trend="+12.4%" icon={<DollarSignIcon />} />
                <StatCard title="Active Protocol" value={activeUsers.toString()} trend="+5.2%" icon={<UsersIcon />} />
                <StatCard title="Kitchen Output" value={`$${kitchenSales.toLocaleString()}`} trend="+8.1%" icon={<Zap size={18} />} />
                <StatCard title="Facility Load" value={`${centerLoad}%`} highlight icon={<Activity size={18} />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* IoT Control Panel */}
                <div className="xl:col-span-2 glass-card rounded-[3rem] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                <Cpu size={20} className="text-gold" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">Neural Infrastructure</h3>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20">
                            <div className="w-1 h-1 rounded-full bg-gold animate-ping" />
                            <span className="text-[9px] font-black text-gold uppercase tracking-widest">Live Optimization</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
                        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                            {iotZones.map((zone) => (
                                <button
                                    key={zone.id}
                                    onClick={() => setSelectedZone(zone)}
                                    className={`relative px-4 py-6 rounded-2xl border transition-all duration-500 group overflow-hidden ${selectedZone?.id === zone.id
                                        ? 'bg-gold border-gold shadow-[0_0_30px_rgba(202,138,4,0.3)] scale-[1.02]'
                                        : 'bg-white/[0.02] border-white/5 hover:border-gold/30 hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <span className={`text-[10px] font-black tracking-widest uppercase text-center relative z-10 block ${selectedZone?.id === zone.id ? 'text-black' : 'text-white/30 group-hover:text-white/60'
                                        }`}>
                                        {zone.name}
                                    </span>
                                    {selectedZone?.id === zone.id && (
                                        <motion.div layoutId="zone-glow" className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="lg:col-span-3 bg-black/40 rounded-[2rem] border border-white/5 flex flex-col p-10 relative overflow-hidden group/panel shadow-inner">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gold/5 blur-3xl opacity-0 group-hover/panel:opacity-100 transition-opacity duration-1000" />

                            <AnimatePresence mode="wait">
                                {selectedZone ? (
                                    <motion.div
                                        key={selectedZone.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="w-full h-full flex flex-col gap-10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xl font-heading text-white tracking-widest uppercase">{selectedZone.name}</h4>
                                            <div className="h-px flex-1 mx-6 bg-white/5" />
                                            <Shield size={14} className="text-gold/50" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-10">
                                            <div className="space-y-3 group/stat cursor-pointer">
                                                <div className="flex items-center gap-2 text-white/20 group-hover/stat:text-gold transition-colors">
                                                    <Thermometer size={14} />
                                                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold">ATMOSPHERICS</p>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <p className="text-5xl font-light text-white group-hover/stat:text-gradient-gold transition-all duration-700">{selectedZone.temp}</p>
                                                    <span className="text-xl font-light text-white/20 group-hover/stat:text-gold/50 transition-colors">°C</span>
                                                </div>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(selectedZone.temp / 40) * 100}%` }}
                                                        className="h-full bg-gold shadow-[0_0_10px_rgba(202,138,4,0.5)]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3 group/stat cursor-pointer">
                                                <div className="flex items-center gap-2 text-white/20 group-hover/stat:text-gold transition-colors">
                                                    <Sun size={14} />
                                                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold">LUMINANCE</p>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <p className="text-5xl font-light text-white group-hover/stat:text-gradient-gold transition-all duration-700">{selectedZone.lights}</p>
                                                    <span className="text-xl font-light text-white/20 group-hover/stat:text-gold/50 transition-colors">%</span>
                                                </div>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${selectedZone.lights}%` }}
                                                        className="h-full bg-gold shadow-[0_0_10px_rgba(202,138,4,0.5)]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button className="premium-button w-full h-14 rounded-xl flex items-center justify-center gap-3 relative z-10">
                                            <span className="text-[10px] font-black tracking-widest uppercase text-black">Override Hardware Settings</span>
                                        </button>
                                    </motion.div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-20">
                                        <Cpu size={48} className="mb-6 animate-pulse" />
                                        <p className="text-[10px] uppercase tracking-[0.4em] leading-loose">
                                            Select Peripheral Domain<br />to Establish Interface
                                        </p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="flex flex-col gap-8">
                    <div className="glass-card rounded-[2.5rem] p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Priority Protocols</h3>
                        <div className="flex flex-col gap-4">
                            <ActionButton label="Broadcast System Alert" />
                            <ActionButton label="Generate Neural Report" />
                            <ActionButton label="Sync Master Schedule" />
                            <ActionButton label="Initiate Full Security Sweep" variant="danger" />
                        </div>
                    </div>

                    <div className="bg-gold/5 border border-gold/10 rounded-[2.5rem] p-8 flex flex-col gap-4 relative overflow-hidden group cursor-pointer">
                        <div className="absolute top-0 right-0 p-4">
                            <Zap size={20} className="text-gold animate-shimmer" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/60">Power Optimization</h3>
                        <p className="text-sm font-light text-white/80 leading-relaxed">System identified 12% energy waste in Bio-Mechanical Bay (Zone 4).<br /><span className="text-gold font-bold">Apply optimization?</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, highlight, icon }: any) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className={`p-10 rounded-[3rem] border relative overflow-hidden transition-all duration-500 group cursor-pointer ${highlight ? 'bg-gold/10 border-gold/20 shadow-[0_0_50px_rgba(202,138,4,0.1)]' : 'bg-white/[0.02] border-white/5 hover:border-gold/20'}`}
        >
            <div className="flex justify-between items-start mb-10">
                <div className="text-white/20 group-hover:text-gold/50 transition-colors duration-500">
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-2 py-1 rounded-lg">{trend}</span>
                )}
            </div>

            <h3 className="text-[11px] font-bold tracking-[0.3em] text-white/30 uppercase mb-3 selection:bg-gold">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-heading tracking-tight ${highlight ? 'text-gradient-gold' : 'text-white'}`}>{value}</span>
            </div>

            {/* Visual Flare */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}

function ActionButton({ label, variant }: { label: string, variant?: string }) {
    return (
        <button className="w-full bg-white/5 hover:bg-white/[0.08] border border-white/5 hover:border-gold/20 rounded-2xl p-6 flex justify-between items-center group transition-all duration-500 shadow-lg cursor-pointer">
            <span className={`text-[10px] font-black tracking-[0.2em] uppercase transition-colors ${variant === 'danger' ? 'text-red-400 group-hover:text-red-300' : 'text-white/40 group-hover:text-white'}`}>{label}</span>
            <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold/30 transition-all">
                <ChevronRight size={14} className="text-white/10 group-hover:text-gold transition-all transform group-hover:translate-x-0.5" />
            </div>
        </button>
    );
}

// Minimal Icons
function DollarSignIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
    )
}

function UsersIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    )
}

