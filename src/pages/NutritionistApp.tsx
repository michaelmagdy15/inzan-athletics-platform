import React, { useState, lazy, Suspense } from "react";
import { Users, Utensils, CalendarDays, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NavItem from "../components/user/NavItem";
import { supabase } from "../lib/firebase";
import { useBranding } from "../context/BrandingContext";

// Lazy load views
const NutritionistDashboard = lazy(() => import("../components/nutritionist/NutritionistDashboard"));
const ClientAssessmentsView = lazy(() => import("../components/nutritionist/ClientAssessmentsView"));
const MealPlanLibraryView = lazy(() => import("../components/nutritionist/MealPlanLibraryView"));
const NutritionScheduleView = lazy(() => import("../components/nutritionist/NutritionScheduleView"));
const ProfileTab = lazy(() => import("../components/user/ProfileTab"));

const LoadingFallback = () => (
    <div className="flex-1 flex items-center justify-center p-12 min-h-screen bg-[#050505]">
        <div className="w-8 h-8 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
    </div>
);

export default function NutritionistApp() {
    const { config } = useBranding();
    const [activeTab, setActiveTab] = useState("dashboard");

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col max-w-md mx-auto relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Bar */}
            <header className="px-6 py-4 flex justify-between items-center relative z-10 border-b border-white/5">
                <div className="flex flex-col">
                    <span className="text-lg font-heading tracking-widest text-white">
                        {config.shortName}
                    </span>
                    <span className="text-[8px] tracking-[0.4em] uppercase text-[#FFB800]/60 font-bold -mt-0.5">
                        Nutritionist Portal
                    </span>
                </div>
                <button
                    onClick={handleSignOut}
                    className="text-white/40 hover:text-red-400 transition-colors"
                >
                    <LogOut size={16} />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6 pb-28 relative z-10 scrollbar-hide">
                <Suspense fallback={<LoadingFallback />}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-full"
                        >
                            {activeTab === "dashboard" && <NutritionistDashboard />}
                            {activeTab === "clients" && <ClientAssessmentsView />}
                            {activeTab === "meals" && <MealPlanLibraryView />}
                            {activeTab === "schedule" && <NutritionScheduleView />}
                            {activeTab === "profile" && <ProfileTab />}
                        </motion.div>
                    </AnimatePresence>
                </Suspense>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/5 px-2 py-4 z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <ul className="flex justify-around items-center">
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Home"
                        isActive={activeTab === "dashboard"}
                        onClick={() => setActiveTab("dashboard")}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="Clients"
                        isActive={activeTab === "clients"}
                        onClick={() => setActiveTab("clients")}
                    />
                    <NavItem
                        icon={<Utensils size={20} />}
                        label="Meals"
                        isActive={activeTab === "meals"}
                        onClick={() => setActiveTab("meals")}
                    />
                    <NavItem
                        icon={<CalendarDays size={20} />}
                        label="Schedule"
                        isActive={activeTab === "schedule"}
                        onClick={() => setActiveTab("schedule")}
                    />
                    <NavItem
                        icon={<User size={20} />}
                        label="Profile"
                        isActive={activeTab === "profile"}
                        onClick={() => setActiveTab("profile")}
                    />
                </ul>
            </nav>
        </div>
    );
}
