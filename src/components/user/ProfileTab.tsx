import React from 'react';
import { Bell, Shield, Flame, Droplets, Award, Clock, Users, Package, Apple, Calendar, FileText, LogOut } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { supabase } from '../../lib/supabase';

export default function ProfileTab() {
    const { currentUser } = useData();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="relative flex flex-col min-h-screen pb-24">
            <div className="absolute top-0 left-0 w-full h-80">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-30" alt="Background" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#050505]/80 to-[#050505]" />
            </div>

            <div className="relative z-10 p-6 pt-12 flex flex-col gap-8">
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-light tracking-tight">My Profile</h2>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <Bell size={18} />
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFB800]/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />

                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex gap-5">
                            <div className="relative">
                                <img src={currentUser?.avatar} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg" alt="Profile" />
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#FFB800] rounded-full border-2 border-[#141414] flex items-center justify-center">
                                    <Shield size={10} className="text-black" />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h2 className="font-medium text-xl tracking-tight mb-1">{currentUser?.name}</h2>
                                <p className="text-[10px] text-[#FFB800] tracking-widest uppercase mb-2">Role: {currentUser?.role}</p>
                                <p className="text-xs text-gray-400 truncate max-w-[150px]">{currentUser?.email}</p>
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-white p-1.5 rounded-xl shrink-0 shadow-lg rotate-3">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentUser?.id}`} className="w-full h-full" alt="QR Code" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-medium text-lg tracking-tight">The Zone</h3>
                        <span className="flex items-center gap-1 text-[9px] text-emerald-500 uppercase tracking-widest font-bold">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Synced
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10 relative overflow-hidden">
                            <Flame size={18} className="text-red-500 mb-3" />
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Day Strain</p>
                            <p className="text-3xl font-light text-white">{currentUser?.strain || 0}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10 relative overflow-hidden">
                            <Droplets size={18} className="text-emerald-500 mb-3" />
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Recovery</p>
                            <p className="text-3xl font-light text-white">{currentUser?.recovery || 0}%</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="font-medium text-lg tracking-tight px-1">Athletic Passport</h3>
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex gap-4 overflow-x-auto scrollbar-hide">
                        {(currentUser?.badges || []).map((badge, idx) => (
                            <div key={idx} className={`flex flex-col items-center gap-3 min-w-[80px] transition-all ${badge.achieved ? 'opacity-100 scale-100' : 'opacity-30 grayscale scale-95'}`}>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${idx === 0 ? 'bg-gradient-to-br from-[#FFB800] to-[#b38100] border-[#FFB800]/50 shadow-[0_0_15px_#FFB80044]' :
                                    idx === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-500/50 shadow-[0_0_15px_#3b81f644]' :
                                        'bg-white/10 border-white/20'
                                    }`}>
                                    {badge.icon === 'Award' && <Award size={24} className={idx === 0 ? 'text-black' : 'text-white'} />}
                                    {badge.icon === 'Clock' && <Clock size={24} className="text-white" />}
                                    {badge.icon === 'Dumbbell' && <Users size={24} className="text-white" />}
                                </div>
                                <span className="text-[9px] font-bold tracking-widest uppercase text-center">{badge.label.split(' ').join('\n')}{badge.count && <><br />{badge.count}</>}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <OptionItem icon={<Package size={20} />} label="Packages" />
                    <OptionItem icon={<Apple size={20} />} label="Nutrition" />
                    <OptionItem icon={<Calendar size={20} />} label="Attendance" />
                    <OptionItem icon={<FileText size={20} />} label="Billing" />
                </div>
            </div>
        </div>
    );
}

function OptionItem({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col gap-3 cursor-pointer hover:bg-white/10 transition-all group">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#FFB800] group-hover:scale-110 transition-all">
                {icon}
            </div>
            <span className="text-sm font-medium tracking-wide">{label}</span>
        </div>
    );
}
