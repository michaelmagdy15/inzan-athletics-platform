import React, { useState, lazy, Suspense } from 'react';
import { CalendarDays, CalendarCheck, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NavItem from '../components/user/NavItem';
import { supabase } from '../lib/supabase';

// Lazy load views
const CoachScheduleView = lazy(() => import('../components/coach/CoachScheduleView'));
const CoachSessionsView = lazy(() => import('../components/coach/CoachSessionsView'));
const ProfileTab = lazy(() => import('../components/user/ProfileTab'));

const LoadingFallback = () => (
    <div className="flex-1 flex items-center justify-center p-12 min-h-screen">
        <div className="w-8 h-8 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
    </div>
);

export default function CoachApp() {
    const [activeTab, setActiveTab] = useState('schedule');

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col max-w-md mx-auto relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Bar for Sign Out (optional, or rely on profile tab) */}
            <header className="px-6 py-4 flex justify-between items-center relative z-10 border-b border-white/5">
                <div className="flex flex-col">
                    <span className="text-lg font-heading tracking-widest text-white">INZAN</span>
                    <span className="text-[8px] tracking-[0.4em] uppercase text-gold/60 font-bold -mt-0.5">Coach Portal</span>
                </div>
                <button onClick={handleSignOut} className="text-white/40 hover:text-red-400 transition-colors">
                    <LogOut size={16} />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6 pb-28 relative z-10 scrollbar-hide">
                <Suspense fallback={<LoadingFallback />}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'schedule' && (
                            <motion.div key="schedule" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                                <CoachScheduleView />
                            </motion.div>
                        )}
                        {activeTab === 'sessions' && (
                            <motion.div key="sessions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                                <CoachSessionsView />
                            </motion.div>
                        )}
                        {activeTab === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                                <ProfileTab />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Suspense>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-2xl border-t border-white/5 px-4 py-5 z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <ul className="flex justify-around items-center">
                    <NavItem icon={<CalendarDays size={20} />} label="Schedule" isActive={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
                    <NavItem icon={<CalendarCheck size={20} />} label="Sessions" isActive={activeTab === 'sessions'} onClick={() => setActiveTab('sessions')} />
                    <NavItem icon={<User size={20} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                </ul>
            </nav>
        </div>
    );
}
