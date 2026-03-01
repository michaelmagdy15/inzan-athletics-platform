import React, { useState, lazy, Suspense } from 'react';
import { Home, User, MoreHorizontal, Users, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NavItem from '../components/user/NavItem';

// Lazy load tabs for better bundle sizing and performance
const HomeTab = lazy(() => import('../components/user/HomeTab'));
const ClassesTab = lazy(() => import('../components/user/ClassesTab'));
const KitchenTab = lazy(() => import('../components/user/KitchenTab'));
const ProfileTab = lazy(() => import('../components/user/ProfileTab'));
const MoreTab = lazy(() => import('../components/user/MoreTab'));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center p-12 min-h-screen">
    <div className="w-8 h-8 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function UserApp() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-28 relative z-10 scrollbar-hide">
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                <HomeTab />
              </motion.div>
            )}
            {activeTab === 'classes' && (
              <motion.div key="classes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                <ClassesTab />
              </motion.div>
            )}
            {activeTab === 'kitchen' && (
              <motion.div key="kitchen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                <KitchenTab />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                <ProfileTab />
              </motion.div>
            )}
            {activeTab === 'more' && (
              <motion.div key="more" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                <MoreTab />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-2xl border-t border-white/5 px-6 py-5 z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <ul className="flex justify-between items-center">
          <NavItem icon={<Home size={22} />} label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<Users size={22} />} label="Classes" isActive={activeTab === 'classes'} onClick={() => setActiveTab('classes')} />
          <NavItem icon={<Coffee size={22} />} label="Kitchen" isActive={activeTab === 'kitchen'} onClick={() => setActiveTab('kitchen')} />
          <NavItem icon={<User size={22} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <NavItem icon={<MoreHorizontal size={22} />} label="More" isActive={activeTab === 'more'} onClick={() => setActiveTab('more')} />
        </ul>
      </nav>
    </div>
  );
}
