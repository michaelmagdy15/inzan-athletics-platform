import React, { useState, lazy, Suspense } from "react";
import {
  Home,
  User,
  MoreHorizontal,
  Users,
  Coffee,
  Dumbbell,
  CalendarCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NavItem from "../components/user/NavItem";

// Lazy load tabs for better bundle sizing and performance
const HomeTab = lazy(() => import("../components/user/HomeTab"));
const ClassesTab = lazy(() => import("../components/user/ClassesTab"));
const KitchenTab = lazy(() => import("../components/user/KitchenTab"));
const ProfileTab = lazy(() => import("../components/user/ProfileTab"));
const MoreTab = lazy(() => import("../components/user/MoreTab"));
const PTBookingTab = lazy(() => import("../components/user/PTBookingTab"));
const MySessionsTab = lazy(() => import("../components/user/MySessionsTab"));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center p-12 min-h-screen">
    <div className="w-8 h-8 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function UserApp() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="h-[100dvh] bg-[#050505] text-white font-sans flex flex-col w-full sm:max-w-2xl lg:max-w-3xl mx-auto relative overflow-hidden border-x border-white/5 lg:shadow-[0_0_100px_rgba(0,0,0,0.5)]">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Area */}
      <main className="content-fit pb-28 relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <HomeTab />
              </motion.div>
            )}
            {activeTab === "classes" && (
              <motion.div
                key="classes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ClassesTab />
              </motion.div>
            )}
            {activeTab === "pt" && (
              <motion.div
                key="pt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <PTBookingTab />
              </motion.div>
            )}
            {activeTab === "sessions" && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <MySessionsTab />
              </motion.div>
            )}
            {activeTab === "kitchen" && (
              <motion.div
                key="kitchen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <KitchenTab />
              </motion.div>
            )}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ProfileTab />
              </motion.div>
            )}
            {activeTab === "more" && (
              <motion.div
                key="more"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <MoreTab />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Bottom Navigation Container to handle fixed centering */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full sm:max-w-2xl lg:max-w-3xl z-50">
        <nav className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/5 px-2 py-4 rounded-t-[2rem] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] border-x border-white/5">
          <ul className="flex items-center justify-around gap-1">
            <NavItem
              icon={<Home size={20} />}
              label="Home"
              isActive={activeTab === "home"}
              onClick={() => setActiveTab("home")}
            />
            <NavItem
              icon={<Users size={20} />}
              label="Classes"
              isActive={activeTab === "classes"}
              onClick={() => setActiveTab("classes")}
            />
            <NavItem
              icon={<Dumbbell size={20} />}
              label="PT"
              isActive={activeTab === "pt"}
              onClick={() => setActiveTab("pt")}
            />
            <NavItem
              icon={<CalendarCheck size={20} />}
              label="Sessions"
              isActive={activeTab === "sessions"}
              onClick={() => setActiveTab("sessions")}
            />
            <NavItem
              icon={<Coffee size={20} />}
              label="Kitchen"
              isActive={activeTab === "kitchen"}
              onClick={() => setActiveTab("kitchen")}
            />
            <NavItem
              icon={<User size={20} />}
              label="Profile"
              isActive={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
            <NavItem
              icon={<MoreHorizontal size={20} />}
              label="More"
              isActive={activeTab === "more"}
              onClick={() => setActiveTab("more")}
            />
          </ul>
        </nav>
      </div>
    </div>
  );
}
