import React, { useState } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function ClassesTab() {
    const { classes, currentUser, bookClass, cancelClass, loading } = useData();
    const [subTab, setSubTab] = useState('date');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAction = async (classId: string, isBooked: boolean) => {
        setProcessingId(classId);
        try {
            if (isBooked) {
                await cancelClass(classId);
            } else {
                await bookClass(classId);
            }
        } catch (err: any) {
            alert(`Booking failed: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-6 pt-12 flex flex-col gap-6">
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-light tracking-tight">Classes</h2>
                <button className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Bell size={18} />
                </button>
            </header>

            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                <button onClick={() => setSubTab('date')} className={`flex-1 py-2.5 text-[11px] uppercase tracking-widest font-bold rounded-xl transition-all ${subTab === 'date' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>Date</button>
                <button onClick={() => setSubTab('instructor')} className={`flex-1 py-2.5 text-[11px] uppercase tracking-widest font-bold rounded-xl transition-all ${subTab === 'instructor' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>Instructor</button>
                <button onClick={() => setSubTab('class')} className={`flex-1 py-2.5 text-[11px] uppercase tracking-widest font-bold rounded-xl transition-all ${subTab === 'class' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>Class</button>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center cursor-pointer border border-white/10 hover:bg-white/10 transition-colors">
                <span className="text-sm font-medium tracking-widest uppercase mx-auto text-[#FFB800]">-- 01 Mar 2026 --</span>
                <ChevronDown size={18} />
            </div>

            <div className="flex flex-col gap-4 mt-2">
                {classes.map(c => {
                    const isBooked = currentUser?.bookedClasses?.includes(c.id) || false;
                    return (
                        <ClassCard
                            key={c.id}
                            session={c}
                            isBooked={isBooked}
                            isProcessing={processingId === c.id}
                            onAction={() => handleAction(c.id, isBooked)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function ClassCard({ session, isBooked, onAction, isProcessing }: any) {
    return (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 group">
            <img src={session.image} alt={session.title} className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-transparent" />

            <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-6xl font-black text-white/[0.03] tracking-tighter rotate-[-90deg] pointer-events-none uppercase">
                {session.watermark}
            </div>

            <div className="relative p-6 z-10">
                <h3 className="font-light text-lg mb-6 tracking-tight w-3/4 leading-tight">{session.title}</h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[9px] text-gray-400 mb-1 uppercase tracking-widest">Trainer</p>
                        <p className="text-xs font-medium text-white truncate">{session.trainer}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[9px] text-gray-400 mb-1 uppercase tracking-widest">Time</p>
                        <p className="text-xs font-medium text-white">{session.time}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5 text-center">
                        <p className="text-[9px] text-gray-400 mb-1 uppercase tracking-widest">Duration</p>
                        <p className="text-xs font-medium text-white">{session.duration}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <p className="text-[10px] text-[#FFB800] font-bold tracking-widest uppercase">{session.spots_left} Spots Left</p>
                    <button
                        onClick={onAction}
                        disabled={isProcessing}
                        className={`px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} ${isBooked ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-[#FFB800] text-black hover:bg-white'}`}
                    >
                        {isProcessing ? '...' : isBooked ? 'Cancel' : 'Book'}
                    </button>
                </div>
            </div>
        </div>
    );
}
