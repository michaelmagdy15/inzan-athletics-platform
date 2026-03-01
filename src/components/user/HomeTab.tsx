import React from 'react';
import { Bell, Activity, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function HomeTab() {
    const { currentUser, classes, iotZones } = useData();
    const nextClass = classes.length > 0 ? classes[0] : null;

    const mainZone = iotZones[0];
    const capacityPercent = mainZone ? Math.round((mainZone.occupancy / mainZone.max_capacity) * 100) : 6;

    const getRecoveryAdvice = () => {
        if (!currentUser) return 'Ready to start?';
        if (currentUser.recovery < 50) return 'High strain detected. Focus on active recovery.';
        if (currentUser.recovery < 80) return 'Moderate strain detected. Good day for mobility.';
        return 'Fully recovered. Push your limits today!';
    };

    return (
        <div className="p-6 pt-12 flex flex-col gap-8">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl tracking-[0.3em] font-light text-white">I N Z A N</h1>
                    <span className="text-white/20 text-sm">|</span>
                    <span className="text-[10px] tracking-[0.2em] font-medium text-[#FFB800] mt-1">A T H L E T I C S</span>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 relative transition-colors">
                    <Bell size={18} />
                    {currentUser && <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#FFB800] rounded-full border-2 border-[#050505]" />}
                </button>
            </header>

            <div className="flex flex-col gap-1">
                <p className="text-gray-400 text-sm tracking-widest uppercase">Welcome Back</p>
                <h2 className="text-3xl font-light tracking-tight">
                    {currentUser?.name || 'Guest'}
                </h2>
            </div>

            {/* AI Recovery Coach */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                        <Activity size={14} className="text-red-500" />
                    </div>
                    <h3 className="text-[10px] text-red-500 tracking-widest uppercase font-bold">AI Recovery Coach</h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed relative z-10 mb-5">
                    {getRecoveryAdvice()} Your recovery is at <span className={`${currentUser?.recovery && currentUser.recovery < 50 ? 'text-red-400' : 'text-emerald-400'} font-bold`}>{currentUser?.recovery || 0}%</span>.
                </p>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex justify-between items-center relative z-10">
                    <div>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">Recommended Action</p>
                        <p className="text-sm font-medium text-white">{nextClass?.title || 'Personal Training'}</p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="relative h-56 rounded-3xl overflow-hidden group cursor-pointer shadow-2xl">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" alt="Gym" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end items-center text-center">
                    <h3 className="text-2xl font-light tracking-[0.2em] uppercase mb-4 text-white drop-shadow-lg text-center">
                        Back Freeze<br />Request
                    </h3>
                    <button className="px-6 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2">
                        Click Here <ArrowRight size={12} />
                    </button>
                </div>
            </div>

            {/* Current Capacity */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 flex items-center gap-6 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB800]/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(255,184,0,0.5)]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#FFB800" strokeWidth="6" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * capacityPercent) / 100} strokeLinecap="round" />
                    </svg>
                    <span className="text-sm font-bold text-white">{capacityPercent}%</span>
                </div>
                <div className="z-10">
                    <h4 className="font-medium text-lg mb-1 tracking-tight">Current Capacity</h4>
                    <p className="text-xs text-[#FFB800] tracking-widest uppercase">{mainZone?.name || 'Inzan Athletics'}</p>
                </div>
            </div>
        </div>
    );
}
