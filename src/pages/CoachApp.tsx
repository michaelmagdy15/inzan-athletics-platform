import React, { useState, lazy, Suspense } from "react";
import { CalendarDays, CalendarCheck, User, LogOut, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NavItem from "../components/user/NavItem";
import { supabase } from "../lib/supabase";

// Lazy load views
const CoachScheduleView = lazy(() => import("../components/coach/CoachScheduleView"));
const CoachSessionsView = lazy(() => import("../components/coach/CoachSessionsView"));
const CoachEarningsView = lazy(() => import("../components/coach/CoachEarningsView"));
const ProfileTab = lazy(() => import("../components/user/ProfileTab"));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center p-12 min-h-screen">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * @feature {
 *   "role": "coach",
 *   "title": "Coach Dashboard",
 *   "description": "Manage your daily training schedule and mark session attendance.",
 *   "steps": [
 *     "1. Launch Coach App.",
 *     "2. View your upcoming meetings for the day.",
 *     "3. Mark sessions as complete to update student balance."
 *   ]
 * }
 */
export default function CoachApp() {
  const [activeTab, setActiveTab] = useState("schedule");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "schedule":
        return <CoachScheduleView />;
      case "sessions":
        return <CoachSessionsView />;
      case "earnings":
        return <CoachEarningsView />;
      case "profile":
        return <ProfileTab />;
      default:
        return <CoachScheduleView />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#050505] text-white overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Modern Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/20 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gold flex items-center justify-center rounded-2xl shadow-[0_0_20px_rgba(255,184,0,0.3)]">
            <span className="text-black font-black text-xl lg:text-2xl font-heading">IN</span>
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-heading tracking-tight text-white uppercase italic">Coach Terminal</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <p className="text-[8px] lg:text-[9px] tracking-[0.3em] text-white/40 uppercase font-black">Authorized Personnel Only</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/20 text-white/40 hover:text-red-500 transition-all shadow-xl group"
        >
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="content-fit px-4 lg:px-10 pb-32 lg:pb-40 relative z-10 pt-6 lg:pt-10">
        <div className="max-w-[100vw] sm:max-w-2xl lg:max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Suspense fallback={<LoadingFallback />}>
                {renderContent()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-8 z-50 pointer-events-none">
        <nav className="max-w-lg lg:max-w-2xl mx-auto bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-1.5 lg:p-2 rounded-3xl lg:rounded-[2.5rem] flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden group">
          {/* Active indicator background element could go here if needed */}
          <NavItem
            icon={<CalendarDays size={20} />}
            label="Schedule"
            isActive={activeTab === "schedule"}
            onClick={() => setActiveTab("schedule")}
          />
          <NavItem
            icon={<CalendarCheck size={20} />}
            label="Sessions"
            isActive={activeTab === "sessions"}
            onClick={() => setActiveTab("sessions")}
          />
          <NavItem
            icon={<DollarSign size={20} />}
            label="Earnings"
            isActive={activeTab === "earnings"}
            onClick={() => setActiveTab("earnings")}
          />
          <NavItem
            icon={<User size={20} />}
            label="Profile"
            isActive={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
        </nav>
      </div>
    </div>
  );
}
