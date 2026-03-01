import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Search, Bell, LayoutDashboard, Users, Calendar, UserCheck, Coffee, LogOut, DollarSign, Package, Settings, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData, Member } from '../context/DataContext';
import { supabase } from '../lib/supabase';

// Lazy load views for optimization
const DashboardView = lazy(() => import('../components/admin/DashboardView'));
const MembersView = lazy(() => import('../components/admin/MembersView'));
const ClassesView = lazy(() => import('../components/admin/ClassesView'));
const CoachesView = lazy(() => import('../components/admin/CoachesView'));
const EKKitchenView = lazy(() => import('../components/admin/EKKitchenView'));
const FinancialsView = lazy(() => import('../components/admin/FinancialsView'));
const InventoryView = lazy(() => import('../components/admin/InventoryView'));
const SettingsView = lazy(() => import('../components/admin/SettingsView'));

const ViewLoading = () => (
  <div className="flex-1 flex items-center justify-center p-12">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full shadow-[0_0_15px_rgba(202,138,4,0.3)]"
    />
  </div>
);

export default function AdminHub() {
  const { members, currentUser, addMember } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const filteredMembers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return members.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const handleCreateMember = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const tier = formData.get('tier') as string;

    try {
      await addMember({ name, email, tier });
      setIsNewMemberModalOpen(false);
    } catch (err) {
      console.error('Failed to create member:', err);
    }
  }, [addMember]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-gold/30 flex relative overflow-hidden">
      {/* Dynamic Ambient Background */}
      <motion.div
        animate={{
          opacity: [0.03, 0.08, 0.03],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-gold/10 rounded-full blur-[180px] pointer-events-none z-0"
      />

      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col z-20 relative">
        <div className="p-10 flex flex-col gap-2">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/50 transition-all duration-500 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-2xl font-heading text-gold relative z-10">I</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-heading tracking-widest text-white">INZAN</span>
              <span className="text-[9px] tracking-[0.4em] uppercase text-gold/60 font-bold -mt-1">Systems</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 flex flex-col gap-2">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Users size={18} />} label="Members" isActive={activeTab === 'members'} onClick={() => setActiveTab('members')} />
          <NavItem icon={<Calendar size={18} />} label="Classes" isActive={activeTab === 'classes'} onClick={() => setActiveTab('classes')} />
          <NavItem icon={<UserCheck size={18} />} label="Coaches" isActive={activeTab === 'coaches'} onClick={() => setActiveTab('coaches')} />
          <div className="h-px bg-white/5 my-4 mx-4" />
          <NavItem icon={<DollarSign size={18} />} label="Financials" isActive={activeTab === 'financials'} onClick={() => setActiveTab('financials')} />
          <NavItem icon={<Coffee size={18} />} label="EK Kitchen" isActive={activeTab === 'ek_kitchen'} onClick={() => setActiveTab('ek_kitchen')} />
          <NavItem icon={<Package size={18} />} label="Inventory" isActive={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <NavItem icon={<Settings size={18} />} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 text-white/30 hover:text-red-400 transition-all w-full px-6 py-5 text-[10px] font-bold tracking-[0.2em] uppercase group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Deauthorize Access
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/40 backdrop-blur-md z-20">
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={18} />
            <input
              type="text"
              placeholder="Query protocol registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-14 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 focus:bg-white/[0.08] transition-all duration-500 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-8">
            <button className="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/[0.08] hover:border-gold/20 transition-all group">
              <Bell size={20} className="text-white/40 group-hover:text-gold transition-colors" />
              <span className="absolute top-3 right-3.5 w-2 h-2 bg-gold rounded-full border-2 border-[#050505] shadow-[0_0_10px_rgba(202,138,4,0.5)]" />
            </button>

            <div className="flex items-center gap-4 pl-8 border-l border-white/5">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white tracking-widest uppercase">{currentUser?.name || 'Admin'}</span>
                <span className="text-[8px] text-gold tracking-[0.3em] uppercase font-black">Operator</span>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gold rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
                <img
                  src={currentUser?.avatar || "https://i.pravatar.cc/150?u=admin"}
                  alt="Admin"
                  className="w-11 h-11 rounded-full border-2 border-white/10 group-hover:border-gold/50 object-cover shadow-2xl transition-all"
                />
              </motion.div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 flex gap-10 scrollbar-hide">
          <div className="flex-1 flex flex-col gap-10">
            <Suspense fallback={<ViewLoading />}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === 'dashboard' && <DashboardView />}
                  {activeTab === 'members' && <MembersView members={filteredMembers} selectedMember={selectedMember} setSelectedMember={setSelectedMember} onNewMember={() => setIsNewMemberModalOpen(true)} />}
                  {activeTab === 'classes' && <ClassesView />}
                  {activeTab === 'coaches' && <CoachesView />}
                  {activeTab === 'ek_kitchen' && <EKKitchenView />}
                  {activeTab === 'financials' && <FinancialsView />}
                  {activeTab === 'inventory' && <InventoryView />}
                  {activeTab === 'settings' && <SettingsView />}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </div>

          {activeTab === 'members' && selectedMember && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 glass-card rounded-[2.5rem] p-8 flex flex-col gap-8 shrink-0 h-fit sticky top-0 shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                <h3 className="text-[10px] text-gold tracking-[0.4em] uppercase font-bold text-center">Entity Registry</h3>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gold rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <img src={selectedMember.avatar} className="w-24 h-24 rounded-[2rem] border-2 border-white/10 object-cover shadow-2xl relative z-10" alt="" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-heading tracking-tight mb-1">{selectedMember.name}</h2>
                    <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[9px] text-gold font-bold uppercase tracking-widest">{selectedMember.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 bg-black/20 p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center group cursor-help">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">Endpoint</span>
                  <span className="text-[11px] text-white font-medium truncate max-w-[120px]">{selectedMember.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest">Performance</span>
                  <span className="text-[11px] text-gold font-bold">{selectedMember.strain}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest">Readiness</span>
                  <span className="text-[11px] text-emerald-400 font-bold">{selectedMember.recovery}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[9px] text-gold tracking-[0.3em] uppercase mb-4 font-bold opacity-60">Neural Insights</h4>
                <div className="p-5 bg-gold/5 border border-gold/10 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gold/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
                  <p className="text-[11px] text-white/60 leading-relaxed italic relative z-10">Member demonstrating peak performance levels. Strategy maintenance advised.</p>
                  <button className="premium-button w-full py-3.5 rounded-xl mt-6">
                    <span className="text-[10px] font-black tracking-widest uppercase text-black">Transmit Payload</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {isNewMemberModalOpen && (
            <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
              <motion.form
                onSubmit={handleCreateMember}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="glass-card rounded-[3rem] p-12 w-full max-w-lg flex flex-col gap-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/10"
                style={{ background: 'rgba(20, 20, 20, 0.8)' }}
              >
                <div className="text-center">
                  <h2 className="text-3xl font-heading tracking-[0.2em] uppercase text-white mb-2">Initialize Entity</h2>
                  <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 font-bold">New Registry Entry</p>
                </div>

                <div className="flex flex-col gap-6">
                  <input
                    name="name"
                    required
                    placeholder="FULL IDENTITY NAME"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm text-white placeholder:text-white/10 focus:border-gold/30 outline-none transition-all uppercase tracking-widest shadow-inner"
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="COMMUNICATION ENDPOINT"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm text-white placeholder:text-white/10 focus:border-gold/30 outline-none transition-all uppercase tracking-widest shadow-inner"
                  />
                  <div className="relative group">
                    <select
                      name="tier"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white appearance-none uppercase tracking-widest cursor-pointer focus:border-gold/30 transition-all font-bold"
                    >
                      <option className="bg-black">High Performance</option>
                      <option className="bg-black">Fuel Plan</option>
                      <option className="bg-black">Holistic Flow</option>
                    </select>
                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-gold rotate-90 transition-colors pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-6 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsNewMemberModalOpen(false)}
                    className="flex-1 py-4 text-white/20 uppercase text-[10px] font-bold tracking-[0.3em] hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="premium-button flex-1 h-14 rounded-2xl text-black font-black tracking-[0.3em] uppercase text-[10px] shadow-2xl shadow-gold/20"
                  >
                    Confirm Initial
                  </button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function useAdminState() {
  const { members } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState<Member | null>(members[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return { members, activeTab, setActiveTab, selectedMember, setSelectedMember, searchQuery, setSearchQuery, isCreateModalOpen, setIsCreateModalOpen };
}

function NavItem({ icon, label, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-5 px-6 py-4 rounded-2xl text-sm transition-all relative group overflow-hidden ${isActive ? 'text-white' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/5 to-transparent border-l-4 border-gold"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className={`relative z-10 transition-colors duration-500 ${isActive ? 'text-gold' : 'group-hover:text-gold/60'}`}>{icon}</span>
      <span className={`relative z-10 tracking-[0.1em] text-[13px] transition-all duration-500 ${isActive ? 'translate-x-1 font-medium' : 'group-hover:translate-x-1'}`}>{label}</span>

      {/* Subtle Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
    </button>
  );
}
