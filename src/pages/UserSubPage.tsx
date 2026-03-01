import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, QrCode, ShieldX, CheckCircle2, Info } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserSubPage() {
    const { pageId } = useParams();
    const navigate = useNavigate();
    const { currentUser, registerAttendance } = useData();
    const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSimulateScan = async () => {
        if (!currentUser) return;
        try {
            await registerAttendance(currentUser.code);
            setScanStatus('success');
            setTimeout(() => setScanStatus('idle'), 3000);
        } catch (err: any) {
            setScanStatus('error');
            setTimeout(() => setScanStatus('idle'), 3000);
        }
    };

    const renderContent = () => {
        switch (pageId) {
            case 'qr-scanner':
                return (
                    <div className="flex flex-col items-center gap-8 py-4">
                        <div className="text-center font-bold">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-2 font-bold italic">Digital Identity</p>
                            <h3 className="text-2xl font-heading text-white uppercase">Access Key</h3>
                        </div>

                        <div className="relative group">
                            <AnimatePresence mode="wait">
                                {scanStatus === 'idle' ? (
                                    <motion.div
                                        key="qr"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="relative"
                                    >
                                        <div className="absolute -inset-8 bg-[#FFB800]/10 rounded-full blur-3xl group-hover:bg-[#FFB800]/20 transition-all duration-700" />
                                        <div className="w-64 h-64 bg-white p-6 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/20 transition-transform group-hover:scale-[1.02] duration-500">
                                            <QRCodeSVG
                                                value={currentUser?.code || 'INZAN'}
                                                size={256}
                                                level="H"
                                                includeMargin={false}
                                                className="w-full h-full"
                                            />
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full z-20 whitespace-nowrap">
                                            <span className="text-[10px] text-white font-black tracking-widest uppercase">Member ID: {currentUser?.code}</span>
                                        </div>
                                    </motion.div>
                                ) : scanStatus === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-64 h-64 flex flex-col items-center justify-center bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl relative z-10"
                                    >
                                        <CheckCircle2 size={64} className="text-emerald-500 mb-4 animate-bounce" />
                                        <p className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Access Granted</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-64 h-64 flex flex-col items-center justify-center bg-red-500/10 rounded-[2.5rem] border border-red-500/20 shadow-2xl relative z-10"
                                    >
                                        <ShieldX size={64} className="text-red-500 mb-4" />
                                        <p className="text-red-500 font-black uppercase tracking-widest text-[10px]">Identity Denied</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-6 w-full mt-4">
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-full bg-[#FFB800]/10 flex items-center justify-center border border-[#FFB800]/20 font-bold shrink-0">
                                    <Info size={16} className="text-[#FFB800]" />
                                </div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed italic font-bold">Show this code at the terminal boundary for synchronized facility entry.</p>
                            </div>
                            <button
                                onClick={handleSimulateScan}
                                className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl shadow-2xl hover:bg-[#FFB800] transition-all transform active:scale-95"
                            >
                                Simulate Terminal Scan
                            </button>
                        </div>
                    </div>
                );

            case 'request-freeze':
                return (
                    <div className="flex flex-col gap-6">
                        <div className="bg-[#FFB800]/10 border border-[#FFB800]/20 p-5 rounded-2xl">
                            <p className="text-[#FFB800] text-xs font-bold uppercase tracking-[0.2em] mb-2">Protocol Note</p>
                            <p className="text-gray-300 text-[11px] leading-relaxed italic font-bold uppercase">Freeze requests require 7 days notice. Maximum freeze duration is 30 days per cycle.</p>
                        </div>
                        <div className="space-y-4 font-bold">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">START DATE</label>
                                <input type="date" className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white outline-none focus:border-[#FFB800]/50 transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">END DATE</label>
                                <input type="date" className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white outline-none focus:border-[#FFB800]/50 transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">RATIONALE</label>
                                <textarea placeholder="Specify reason for membership suspension..." className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white outline-none h-32 focus:border-[#FFB800]/50 transition-colors resize-none"></textarea>
                            </div>
                        </div>
                        <button className="w-full bg-[#FFB800] text-black font-black uppercase tracking-[0.3em] text-[10px] py-5 rounded-2xl hover:bg-white transition-all shadow-2xl shadow-[#FFB800]/20">Transmit Request</button>
                    </div>
                );

            case 'daily-schedule':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1 mb-2">
                            <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Sessions (Today)</h3>
                            <span className="text-[9px] text-[#FFB800] font-black uppercase tracking-widest">3 Classes</span>
                        </div>
                        <div className="p-5 bg-white/5 rounded-3xl border border-white/10 group cursor-pointer hover:border-[#FFB800]/30 transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] text-[#FFB800] font-black uppercase tracking-[0.3em]">Open</span>
                            </div>
                            <p className="text-[#FFB800] text-[10px] font-black uppercase tracking-[0.2em] mb-2">08:00 AM</p>
                            <h4 className="font-heading text-xl mb-1 text-white uppercase tracking-tight">Morning HIIT</h4>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Coach Alex • 12/20 Booked</p>
                        </div>
                        <div className="p-5 bg-white/5 rounded-3xl border border-white/10 group cursor-pointer hover:border-[#FFB800]/30 transition-all relative overflow-hidden">
                            <p className="text-[#FFB800] text-[10px] font-black uppercase tracking-[0.2em] mb-2">10:00 AM</p>
                            <h4 className="font-heading text-xl mb-1 text-white uppercase tracking-tight">Powerlifting</h4>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Coach Sarah • 8/12 Booked</p>
                        </div>
                    </div>
                );

            case 'packages':
                return (
                    <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-br from-[#FFB800]/20 via-black to-black rounded-[2.5rem] border border-[#FFB800]/20 relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                                <span className="text-[#FFB800] text-[8px] font-black uppercase tracking-[0.5em] italic">Platinum</span>
                            </div>
                            <h4 className="font-heading text-2xl text-[#FFB800] mb-2 uppercase tracking-tight">Prime Performance</h4>
                            <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Unlimited Access + Recovery Kitchen</p>
                            <div className="flex items-baseline gap-2 mb-8">
                                <p className="font-heading text-4xl text-white tracking-widest">4,500</p>
                                <span className="text-xs text-gray-500 font-black tracking-widest italic">EGP / MO</span>
                            </div>
                            <button className="w-full bg-[#FFB800] text-black font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl shadow-2xl shadow-[#FFB800]/20 hover:scale-[1.02] transition-transform">Authorize Enrollment</button>
                        </div>
                    </div>
                );

            case 'nutrition':
                return (
                    <div className="space-y-8">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <h4 className="font-black text-emerald-500 text-[10px] uppercase tracking-[0.4em] mb-4">Calculated Daily Target</h4>
                            <div className="flex items-baseline gap-3 mb-1">
                                <span className="text-4xl font-heading text-white tracking-widest">2,400</span>
                                <span className="text-xs text-emerald-500/60 font-black tracking-widest uppercase italic">KCAL</span>
                            </div>
                            <p className="text-[10px] text-white/40 font-black tracking-[0.2em] uppercase underline decoration-emerald-500/20">180G PROTEIN • 220G CARBS</p>
                        </div>
                        <div className="space-y-5">
                            <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1 font-bold">Prescribed Protocols</h3>
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner font-heading italic text-lg">AM</div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest text-white">Initial Loading</h4>
                                    <p className="text-[10px] text-gray-500 italic uppercase font-bold tracking-widest">Pre-workout amino sync</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-40">
                        <Info size={40} className="text-gray-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Protocol data pending initialization.</p>
                    </div>
                );
        }
    };

    const getPageTitle = () => {
        const titles: Record<string, string> = {
            'qr-scanner': 'Identity Portal',
            'request-freeze': 'Protocol Freeze',
            'daily-schedule': 'Temporal Matrix',
            'packages': 'Service Units',
            'nutrition': 'Kinetic Fuel',
            'attendance': 'Session Logs',
            'billing': 'Financial Ledger',
            'trainers': 'Unit Instructors',
            'events-offers': 'Special Ops',
            'about': 'Facility Origin',
            'contact': 'Direct Uplink',
            'notifications': 'Comms Feed'
        };
        return titles[pageId || ''] || 'Unknown Protocol';
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col max-w-md mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none" />

            <header className="flex items-center gap-4 p-6 pt-12 relative z-10 border-b border-white/5">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-xl font-heading uppercase tracking-tight text-white">{getPageTitle()}</h2>
                    <p className="text-[8px] text-[#FFB800] font-black uppercase tracking-[0.3em] italic">Sub-Protocol Active</p>
                </div>
            </header>

            <main className="flex-1 p-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden min-h-[500px]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB800]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    {renderContent()}
                </motion.div>
            </main>
        </div>
    );
}

function ProtocolItem({ number, label, desc }: any) {
    return (
        <div className="flex gap-6 group">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-[#FFB800] font-heading group-hover:bg-[#FFB800] group-hover:text-black transition-all">
                    {number}
                </div>
                <div className="w-px flex-1 bg-white/5 my-2" />
            </div>
            <div className="pb-8">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white group-hover:text-[#FFB800] transition-colors mb-2">{label}</h4>
                <p className="text-[10px] text-gray-400 font-bold italic line-clamp-2 uppercase tracking-widest">{desc}</p>
            </div>
        </div>
    );
}
