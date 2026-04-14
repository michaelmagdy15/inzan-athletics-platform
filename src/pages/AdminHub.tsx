import React, { useState, useMemo, useCallback, lazy, Suspense } from "react";
import {
  Search,
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  Coffee,
  LogOut,
  DollarSign,
  Package,
  Settings,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Activity,
  Dumbbell,
  BarChart3,
  Shield,
  Radio,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useData, Member } from "../context/DataContext";
import { supabase } from "../lib/firebase";
import NotificationBell from "../components/shared/NotificationBell";
import { useLanguage } from "../utils/i18n";
import { useBranding } from "../context/BrandingContext";
import MemberDetailPanel from "../components/admin/MemberDetailPanel";
import CreationModal from "../components/admin/CreationModal";
import { useDebounce } from "../hooks/useDebounce";

// Lazy load views for optimization
const DashboardView = lazy(() => import("../components/admin/DashboardView"));
const MembersView = lazy(() => import("../components/admin/MembersView"));
const ClassesView = lazy(() => import("../components/admin/ClassesView"));
const CoachesView = lazy(() => import("../components/admin/CoachesView"));
const KitchenView = lazy(() => import("../components/admin/EKKitchenView"));
const FinancialsView = lazy(() => import("../components/admin/FinancialsView"));
const InventoryView = lazy(() => import("../components/admin/InventoryView"));
const SettingsView = lazy(() => import("../components/admin/SettingsView"));
const PTSessionsView = lazy(() => import("../components/admin/PTSessionsView"));
const PTReportsView = lazy(() => import("../components/admin/PTReportsView"));
const SessionPoliciesView = lazy(
  () => import("../components/admin/SessionPoliciesView"),
);
const GlobalAnnouncementsView = lazy(() => import("../components/admin/GlobalAnnouncementsView"));
const StaffManagementView = lazy(() => import("../components/admin/StaffManagementView"));
const LibraryManagementView = lazy(() => import("../components/admin/LibraryManagementView"));
const EventsManagementView = lazy(() => import("../components/admin/EventsManagementView"));

const ViewLoading = () => (
  <div className="flex-1 flex items-center justify-center p-12">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full shadow-[0_0_15px_rgba(202,138,4,0.3)]"
    />
  </div>
);

type CreationMode = "member" | "coach" | "class" | null;

/**
 * @feature {
 *   "role": "admin",
 *   "title": "Admin Dashboard",
 *   "description": "The command center for our gym. Monitor real-time KPIs and system status.",
 *   "steps": [
 *     "1. Log in with admin credentials.",
 *     "2. View active memberships and pending approvals.",
 *     "3. Monitor revenue and session volume charts."
 *   ]
 * }
 */
export default function AdminHub() {
  const {
    members,
    currentUser,
    addMember,
    addCoach,
    addClass,
    systemAlert,
    setSystemAlert,
  } = useData();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [creationMode, setCreationMode] = useState<CreationMode>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { config } = useBranding();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const filteredMembers = useMemo(() => {
    const query = debouncedSearch?.toLowerCase() || "";
    return members.filter(
      (m) =>
        (m?.name || "").toLowerCase().includes(query) ||
        (m?.role || "").toLowerCase().includes(query),
    );
  }, [members, debouncedSearch]);

  const handleCreateEntity = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      try {
        if (creationMode === "member") {
          await addMember({
            name: formData.get("name") as string,
            email: formData.get("email") as string,
          });
        } else if (creationMode === "coach") {
          await addCoach({
            name: formData.get("name") as string,
            email: formData.get("email") as string,
          });
        } else if (creationMode === "class") {
          await addClass({
            title: formData.get("title") as string,
            trainer: formData.get("trainer") as string,
            time: formData.get("time") as string,
            total_spots: Number(formData.get("spots")),
            category: formData.get("category") as string,
          });
        }
        setCreationMode(null);
      } catch (err: any) {
        console.error(`Failed to create ${creationMode}:`, err);
        setSystemAlert({
          message: err.message || "Failed to initialize entity",
          type: "error",
        });
      }
    },
    [creationMode, addMember, addCoach, addClass, setSystemAlert],
  );

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="h-[100dvh] bg-[#050505] text-white selection:bg-gold/30 flex relative overflow-hidden font-body w-full">
      {/* Dynamic Ambient Background */}
      <motion.div
        animate={{
          opacity: [0.03, 0.08, 0.03],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-gold/10 rounded-full blur-[180px] pointer-events-none z-0"
      />

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth > 1024) && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed lg:relative w-[280px] xl:w-80 h-full border-r border-white/5 bg-[#050505]/95 lg:bg-black/40 backdrop-blur-3xl flex flex-col z-50 lg:z-20 shadow-2xl lg:shadow-none shrink-0`}
          >
            <div className="p-6 xl:p-10 flex flex-col gap-2 relative">
              <button
                onClick={closeMobileMenu}
                className="lg:hidden absolute top-6 right-6 text-white/40 hover:text-white bg-white/5 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div
                className="flex items-center gap-4 group cursor-pointer"
                onClick={() => {
                  setActiveTab("dashboard");
                  closeMobileMenu();
                }}
              >
                <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/50 transition-all duration-500 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xl xl:text-2xl font-heading text-gold relative z-10">
                    {config.shortName[0]}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg xl:text-2xl font-heading tracking-widest text-white">
                    {config.shortName}
                  </span>
                  <span className="text-[7px] xl:text-[9px] tracking-[0.4em] uppercase text-gold/60 font-bold -mt-1">
                    {config.name.includes("Athletics") ? "Systems" : "Management"}
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 xl:px-6 flex flex-col gap-1 xl:gap-2 overflow-y-auto scrollbar-hide py-4 pb-20">
              <NavItem
                icon={<LayoutDashboard size={18} />}
                label={t('dashboard')}
                isActive={activeTab === "dashboard"}
                onClick={() => {
                  setActiveTab("dashboard");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<Users size={18} />}
                label={t('members')}
                isActive={activeTab === "members"}
                onClick={() => {
                  setActiveTab("members");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<Calendar size={18} />}
                label={t('classes')}
                isActive={activeTab === "classes"}
                onClick={() => {
                  setActiveTab("classes");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<UserCheck size={18} />}
                label={t('coaches')}
                isActive={activeTab === "coaches"}
                onClick={() => {
                  setActiveTab("coaches");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<UserCheck size={18} />}
                label={t('staff')}
                isActive={activeTab === "staff_mgmt"}
                onClick={() => {
                  setActiveTab("staff_mgmt");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<BookOpen size={18} />}
                label={t('library')}
                isActive={activeTab === "library"}
                onClick={() => {
                  setActiveTab("library");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<Calendar size={18} />}
                label={t('events')}
                isActive={activeTab === "events"}
                onClick={() => {
                  setActiveTab("events");
                  closeMobileMenu();
                }}
              />
              <div className="h-px bg-white/5 my-3 xl:my-4 mx-4 shrink-0" />
              <NavItem
                icon={<Dumbbell size={18} />}
                label={t('pt_sessions')}
                isActive={activeTab === "pt_sessions"}
                onClick={() => {
                  setActiveTab("pt_sessions");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<BarChart3 size={18} />}
                label={t('pt_reports')}
                isActive={activeTab === "pt_reports"}
                onClick={() => {
                  setActiveTab("pt_reports");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<Shield size={18} />}
                label={t('session_policies')}
                isActive={activeTab === "session_policies"}
                onClick={() => {
                  setActiveTab("session_policies");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<Radio size={18} />}
                label={t('broadcast')}
                isActive={activeTab === "broadcast"}
                onClick={() => {
                  setActiveTab("broadcast");
                  closeMobileMenu();
                }}
              />
              <div className="h-px bg-white/5 my-3 xl:my-4 mx-4 shrink-0" />
              <NavItem
                icon={<DollarSign size={18} />}
                label={t('financials')}
                isActive={activeTab === "financials"}
                onClick={() => {
                  setActiveTab("financials");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<Coffee size={18} />}
                label={t('kitchen')}
                isActive={activeTab === "kitchen"}
                onClick={() => {
                  setActiveTab("kitchen");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<Package size={18} />}
                label={t('inventory')}
                isActive={activeTab === "inventory"}
                onClick={() => {
                  setActiveTab("inventory");
                  closeMobileMenu();
                }}
              />
              <NavItem
                icon={<Settings size={18} />}
                label={t('settings')}
                isActive={activeTab === "settings"}
                onClick={() => {
                  setActiveTab("settings");
                  closeMobileMenu();
                }}
              />
            </nav>

            <div className="p-6 border-t border-white/5 shrink-0">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-4 text-white/30 hover:text-red-400 transition-all w-full px-6 py-4 xl:py-5 text-[10px] font-bold tracking-[0.2em] uppercase group"
              >
                <LogOut
                  size={14}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Deauthorize
              </button>
              <a
                href="/help/index.html"
                target="_blank"
                className="flex items-center gap-4 text-white/30 hover:text-gold transition-all w-full px-6 py-4 xl:py-5 text-[10px] font-bold tracking-[0.2em] uppercase group"
              >
                <Info
                  size={14}
                  className="group-hover:rotate-12 transition-transform"
                />
                Help Center
              </a>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative z-10 w-full min-w-0">
        <header className="h-20 lg:h-24 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 xl:px-10 bg-[#050505]/60 backdrop-blur-xl z-20 shrink-0">
          <div className="flex items-center gap-3 lg:gap-6 flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold shadow-lg active:scale-95 transition-all"
            >
              <Activity size={20} />
            </button>
            <div className="flex-1 max-w-sm xl:max-w-lg relative group overflow-hidden">
              <Search
                className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Search Registry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl py-2.5 xl:py-3.5 pl-11 sm:pl-14 pr-4 text-[11px] sm:text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 focus:bg-white/[0.08] transition-all duration-500 shadow-inner uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 xl:gap-10">
            <div className="scale-90 sm:scale-100 xl:scale-[1.3]">
              <NotificationBell />
            </div>

            <div className="flex items-center gap-3 xl:gap-5 xl:pl-10 xl:border-l xl:border-white/10">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] xl:text-xs font-bold text-white tracking-widest uppercase truncate max-w-[120px]">
                  {currentUser?.name || "Admin"}
                </span>
                <span className="text-[7px] xl:text-[8px] text-gold tracking-[0.3em] uppercase font-black">
                  Operator
                </span>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer shrink-0"
              >
                <div className="absolute inset-0 bg-gold rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
                <img
                  src={
                    currentUser?.avatar || "https://i.pravatar.cc/150?u=admin"
                  }
                  alt="Admin"
                  className="w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 rounded-full border border-white/10 group-hover:border-gold/50 object-cover shadow-2xl transition-all"
                />
              </motion.div>
            </div>
          </div>
        </header>


        <div className="content-fit p-4 lg:p-6 xl:p-10 flex flex-col lg:flex-row gap-6 xl:gap-10 w-full max-w-[2000px] mx-auto">
          <div className="flex-1 flex flex-col gap-6 xl:gap-10 min-w-0">
            <Suspense fallback={<ViewLoading />}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === "dashboard" && <DashboardView />}
                  {activeTab === "members" && (
                    <MembersView
                      members={filteredMembers}
                      selectedMember={selectedMember}
                      setSelectedMember={setSelectedMember}
                      onNewMember={() => setCreationMode("member")}
                    />
                  )}
                  {activeTab === "classes" && <ClassesView />}
                  {activeTab === "coaches" && <CoachesView />}
                  {activeTab === "kitchen" && <KitchenView />}
                  {activeTab === "financials" && <FinancialsView />}
                  {activeTab === "inventory" && <InventoryView />}
                  {activeTab === "settings" && <SettingsView />}
                  {activeTab === "pt_sessions" && <PTSessionsView />}
                  {activeTab === "pt_reports" && <PTReportsView />}
                  {activeTab === "session_policies" && <SessionPoliciesView />}
                  {activeTab === "broadcast" && <GlobalAnnouncementsView />}
                  {activeTab === "staff_mgmt" && <StaffManagementView />}
                  {activeTab === "library" && <LibraryManagementView />}
                  {activeTab === "events" && <EventsManagementView />}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </div>

          <AnimatePresence>
            {activeTab === "members" && selectedMember && (
              <MemberDetailPanel
                member={selectedMember}
                onClose={() => setSelectedMember(null)}
                onMemberUpdated={setSelectedMember}
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {creationMode && (
            <CreationModal
              mode={creationMode}
              onClose={() => setCreationMode(null)}
              onSubmit={handleCreateEntity}
            />
          )}
        </AnimatePresence>

        {/* System Alert Overlay */}
        <AnimatePresence>
          {systemAlert && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md"
            >
              <div className="glass-card rounded-2xl border border-white/10 p-5 lg:p-6 flex items-center justify-between shadow-2xl bg-black/80 backdrop-blur-2xl">
                <div className="flex items-center gap-4 lg:gap-5">
                  <div
                    className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center ${systemAlert.type === "success"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : systemAlert.type === "error"
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : systemAlert.type === "warning"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      } border shrink-0`}
                  >
                    {systemAlert.type === "success" ? (
                      <CheckCircle2 size={20} />
                    ) : systemAlert.type === "error" ? (
                      <AlertCircle size={20} />
                    ) : (
                      <Info size={20} />
                    )}
                  </div>
                  <div className="font-bold flex-1 min-w-0">
                    <h4 className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-0.5 lg:mb-1">
                      System Feedback
                    </h4>
                    <p className="text-xs text-white font-medium tracking-wide truncate">
                      {systemAlert.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSystemAlert(null)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors font-bold shrink-0"
                >
                  <X size={16} className="text-white/20" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-5 px-6 py-4 rounded-2xl text-sm transition-all relative group overflow-hidden font-bold ${isActive ? "text-white" : "text-white/30 hover:text-white hover:bg-white/5"}`}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/5 to-transparent border-l-4 border-gold"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span
        className={`relative z-10 transition-colors duration-500 ${isActive ? "text-gold" : "group-hover:text-gold/60"}`}
      >
        {icon}
      </span>
      <span
        className={`relative z-10 tracking-[0.1em] text-[13px] transition-all duration-500 ${isActive ? "translate-x-1 font-medium" : "group-hover:translate-x-1"}`}
      >
        {label}
      </span>

      {/* Subtle Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
    </button>
  );
}
