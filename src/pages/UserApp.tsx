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
import { useData } from "../context/DataContext";
import { useLanguage } from "../utils/i18n";
import { useBranding } from "../context/BrandingContext";

// Lazy load tabs for better bundle sizing and performance
const HomeTab = lazy(() => import("../components/user/HomeTab"));
const ClassesTab = lazy(() => import("../components/user/ClassesTab"));
const KitchenTab = lazy(() => import("../components/user/KitchenTab"));
const ProfileTab = lazy(() => import("../components/user/ProfileTab"));
const MoreTab = lazy(() => import("../components/user/MoreTab"));
const PTBookingTab = lazy(() => import("../components/user/PTBookingTab"));
const MySessionsTab = lazy(() => import("../components/user/MySessionsTab"));
const CommunityTab = lazy(() => import("../components/user/CommunityTab"));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center p-12 min-h-screen">
    <div className="w-8 h-8 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function UserApp() {
  const [activeTab, setActiveTab] = useState("home");
  const { currentUser, legalAgreements, signWaiver } = useData();
  const { config } = useBranding();
  const { t } = useLanguage();
  const [signature, setSignature] = useState("");
  const [isSigning, setIsSigning] = useState(false);

  const hasSignedWaiver = legalAgreements?.some(a => a.document_type === 'liability_waiver');

  const handleSignWaiver = async () => {
    if (!signature.trim()) return;
    setIsSigning(true);
    try {
      await signWaiver('liability_waiver', signature);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-[#050505] text-white font-sans flex flex-col w-full mx-auto relative overflow-hidden lg:shadow-[0_0_100px_rgba(0,0,0,0.5)]" style={{ maxWidth: 'clamp(100%, 100vw, 48rem)' }}>
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Mandatory Waiver Modal */}
      <AnimatePresence>
        {!hasSignedWaiver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-red-500/20 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                  <User size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-heading uppercase italic text-white mb-2">Liability Waiver</h2>
                <p className="text-[11px] text-white/40 uppercase tracking-widest leading-relaxed">
                  Action required before accessing the {config.name} platform.
                </p>
              </div>

              <div className="bg-black/50 border border-white/5 rounded-2xl p-6 mb-8 h-48 overflow-y-auto custom-scrollbar text-[11px] text-white/50 leading-loose">
                <p className="mb-4 text-white/70 font-bold uppercase tracking-widest text-[#FFB800] text-[10px]">Assumption of Risk</p>
                <p className="mb-4">
                  I acknowledge that participating in physical activities involves inherent risks of injury. I hereby assume all risks associated with my participation at {config.name}.
                </p>
                <p className="mb-4">
                  I agree to follow all safety instructions provided by the coaching staff. I certify that I am in good physical health and able to undertake these activities.
                </p>
                <p>
                  By typing my name below, I legally bind myself to this liability waiver and release {config.name} from any claims.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="ENTER FULL LEGAL NAME"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl py-4 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FFB800]/50 transition-all font-mono uppercase tracking-widest text-center"
                  />
                </div>

                <button
                  onClick={handleSignWaiver}
                  disabled={!signature.trim() || isSigning}
                  className="w-full bg-[#FFB800] text-black font-black uppercase tracking-[0.2em] text-[11px] py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  {isSigning ? "Processing..." : "Sign & Accept"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {(activeTab === "classes" || activeTab === "pt" || activeTab === "sessions") && (
              <motion.div
                key="training"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col gap-6"
              >
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 mx-4">
                  <button
                    onClick={() => setActiveTab("classes")}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'classes' ? 'bg-[#FFB800] text-black' : 'text-white/40'}`}
                  >
                    {t('modules')}
                  </button>
                  <button
                    onClick={() => setActiveTab("pt")}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'pt' ? 'bg-[#FFB800] text-black' : 'text-white/40'}`}
                  >
                    {t('booking')}
                  </button>
                  <button
                    onClick={() => setActiveTab("sessions")}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'sessions' ? 'bg-[#FFB800] text-black' : 'text-white/40'}`}
                  >
                    {t('active')}
                  </button>
                </div>
                {activeTab === "classes" && <ClassesTab />}
                {activeTab === "pt" && <PTBookingTab />}
                {activeTab === "sessions" && <MySessionsTab />}
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
            {(activeTab === "profile" || activeTab === "more") && (
              <motion.div
                key="profile-hub"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ProfileTab />
                {activeTab === "more" && <div className="mt-8 border-t border-white/5 pt-8 px-6"><MoreTab /></div>}
              </motion.div>
            )}
            {activeTab === "community" && (
              <motion.div
                key="community"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <CommunityTab />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Bottom Navigation Container to handle fixed centering */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50" style={{ maxWidth: 'clamp(100%, 100vw, 48rem)' }}>
        <nav className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/5 px-2 py-4 rounded-t-[2rem] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] border-x border-white/5 mx-auto">
          <ul className="flex items-center justify-around gap-1">
            <NavItem
              icon={<Home size={20} />}
              label={t('dashboard')}
              isActive={activeTab === "home"}
              onClick={() => setActiveTab("home")}
            />
            <NavItem
              icon={<Dumbbell size={20} />}
              label={t('training')}
              isActive={activeTab === "classes" || activeTab === "pt" || activeTab === "sessions"}
              onClick={() => setActiveTab("classes")}
            />
            <NavItem
              icon={<Coffee size={20} />}
              label={t('kitchen')}
              isActive={activeTab === "kitchen"}
              onClick={() => setActiveTab("kitchen")}
            />
            <NavItem
              icon={<Users size={20} />}
              label={t('community')}
              isActive={activeTab === "community"}
              onClick={() => setActiveTab("community")}
            />
            <NavItem
              icon={<User size={20} />}
              label={t('profile')}
              isActive={activeTab === "profile" || activeTab === "more"}
              onClick={() => setActiveTab("profile")}
            />
          </ul>
        </nav>
      </div>
    </div>
  );
}
