import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Users,
  MessageSquarePlus,
  Plus,
  X,
  Calendar,
  User as UserIcon
} from "lucide-react";
import {
  useData,
  SessionStatus,
  SESSION_TYPE_LABELS,
  SessionType,
} from "../../context/DataContext";

const STATUS_CONFIG: Record<
  SessionStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  scheduled: {
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    icon: <Clock size={14} />,
    label: "Scheduled",
  },
  completed: {
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: <CheckCircle2 size={14} />,
    label: "Completed",
  },
  canceled: {
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    icon: <XCircle size={14} />,
    label: "Canceled",
  },
  no_show: {
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    icon: <AlertTriangle size={14} />,
    label: "No Show",
  },
  rescheduled: {
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    icon: <Clock size={14} />,
    label: "Rescheduled",
  },
};

export default function CoachSessionsView() {
  const {
    currentUser,
    ptSessions,
    updateSessionStatus,
    members,
    adminAddSession
  } = useData();
  const [filter, setFilter] = useState<"today" | "upcoming" | "past">("today");
  const [processing, setProcessing] = useState<string | null>(null);
  const [reviewModalSession, setReviewModalSession] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New session state
  const [newSession, setNewSession] = useState({
    member_id: "",
    session_type: "pt_1on1" as SessionType,
    scheduled_date: new Date().toISOString().split("T")[0],
    scheduled_time: "10:00",
    duration_minutes: 60,
  });

  if (!currentUser) return null;

  const mySessions = ptSessions.filter((s) => s.coach_id === currentUser.id);
  const today = new Date().toISOString().split("T")[0];

  const clients = members.filter(m => m.role === "member");

  const filtered = mySessions.filter((s) => {
    if (filter === "today") return s.scheduled_date === today;
    if (filter === "upcoming")
      return s.scheduled_date > today && s.status === "scheduled";
    return (
      s.scheduled_date < today ||
      ["completed", "canceled", "no_show"].includes(s.status)
    );
  });

  const todayScheduled = mySessions.filter(
    (s) => s.scheduled_date === today && s.status === "scheduled",
  ).length;
  const todayCompleted = mySessions.filter(
    (s) => s.scheduled_date === today && s.status === "completed",
  ).length;

  const handleStatusUpdate = async (
    sessionId: string,
    status: SessionStatus,
    notes?: string,
  ) => {
    setProcessing(sessionId);
    try {
      await updateSessionStatus(sessionId, status, notes);
      setReviewModalSession(null);
      setSessionNotes("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleAddSession = async () => {
    if (!newSession.member_id) return alert("Please select a client.");
    setProcessing("adding");
    try {
      await adminAddSession({
        ...newSession,
        coach_id: currentUser.id,
      });
      setShowAddModal(false);
      setNewSession({
        member_id: "",
        session_type: "pt_1on1",
        scheduled_date: new Date().toISOString().split("T")[0],
        scheduled_time: "10:00",
        duration_minutes: 60,
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-10 pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">
            My Sessions
          </h1>
          <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">
            View & update session statuses
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="premium-button p-3 rounded-full shadow-lg shadow-gold/20"
        >
          <Plus size={20} className="text-black" />
        </button>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
          <p className="text-[8px] text-white/30 tracking-widest uppercase mb-1">
            Due Today
          </p>
          <p className="text-2xl font-heading text-[#FFB800]">
            {todayScheduled}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
          <p className="text-[8px] text-white/30 tracking-widest uppercase mb-1">
            Done Today
          </p>
          <p className="text-2xl font-heading text-emerald-400">
            {todayCompleted}
          </p>
        </div>
        <div className="glass-card bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20 flex flex-col justify-between">
          <p className="text-[8px] text-emerald-400/60 tracking-widest uppercase mb-1">
            Est. Payout
          </p>
          <p className="text-xl font-heading text-emerald-400">
            {mySessions.filter(s => s.status === "completed" && new Date(s.scheduled_date).getMonth() === new Date().getMonth()).length * 300} <span className="text-[10px] italic">EGP</span>
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
        {(["today", "upcoming", "past"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${filter === tab ? "bg-[#FFB800] text-black shadow-lg" : "text-white/30 hover:text-white"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 && (
          <p className="text-center text-white/20 text-sm py-8">
            No sessions found for this filter.
          </p>
        )}
        {filtered.map((session) => {
          const cfg = STATUS_CONFIG[session.status];
          return (
            <div
              key={session.id}
              className="glass-card rounded-[1.5rem] border border-white/5 p-6 flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-lg">
                    {session.member_name}
                  </h4>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase mt-1">
                    {SESSION_TYPE_LABELS[session.session_type]} •{" "}
                    {session.duration_minutes} min
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase border ${cfg.color}`}
                >
                  {cfg.icon}
                  {cfg.label}
                </div>
              </div>

              <div className="flex gap-4 text-sm text-white/60">
                <span>
                  {new Date(session.scheduled_date).toLocaleDateString(
                    "en-US",
                    { weekday: "short", month: "short", day: "numeric" },
                  )}
                </span>
                <span>•</span>
                <span>{formatTime(session.scheduled_time)}</span>
              </div>

              {session.status === "scheduled" && (
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setReviewModalSession(session.id)}
                    disabled={processing === session.id}
                    className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} />
                    Complete
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(session.id, "no_show")}
                    disabled={processing === session.id}
                    className="flex-1 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold tracking-widest uppercase hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={14} />
                    No Show
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(session.id, "canceled")}
                    disabled={processing === session.id}
                    className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest uppercase hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={14} />
                    Cancel
                  </button>
                </div>
              )}

              {session.status === "completed" && !session.notes && (
                <div className="flex pt-2 border-t border-white/5">
                  <button
                    onClick={() => setReviewModalSession(session.id)}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquarePlus size={14} />
                    Add Session Notes
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Session Review Modal */}
      <AnimatePresence>
        {reviewModalSession && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-[2rem] p-8 max-w-md w-full flex flex-col gap-6 shadow-2xl"
            >
              <div>
                <h3 className="text-xl font-heading tracking-tight text-white mb-1">
                  Session Review
                </h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  Log progress, strain, and recovery notes.
                </p>
              </div>

              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g., Athlete performed 3x10 deadlifts at 100kg. Maintained good form. Needs to focus on breathing."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white h-32 resize-none focus:outline-none focus:border-[#FFB800]/50"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setReviewModalSession(null);
                    setSessionNotes("");
                  }}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-[10px] font-bold tracking-widest uppercase hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(reviewModalSession!, "completed", sessionNotes)}
                  disabled={processing === reviewModalSession}
                  className="flex-1 py-3 rounded-xl bg-[#FFB800] text-black text-[10px] font-black tracking-widest uppercase hover:bg-[#e6a600] transition-colors"
                >
                  {processing === reviewModalSession ? "Saving..." : "Save Review"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Session Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-lg flex items-center justify-center p-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full flex flex-col gap-6 shadow-[0_0_100px_rgba(255,184,0,0.1)] relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/40" />
              </button>

              <div className="text-center">
                <h3 className="text-2xl font-heading tracking-tight text-white mb-1 uppercase">
                  Schedule PT Session
                </h3>
                <p className="text-[10px] text-gold/60 font-black tracking-[0.4em] uppercase">
                  Add to client schedule
                </p>
              </div>

              <div className="flex flex-col gap-5 mt-2">
                {/* Client Selection */}
                <div>
                  <label className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-2.5 block ml-1">
                    Select Athlete
                  </label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold/50 transition-colors" size={16} />
                    <select
                      value={newSession.member_id}
                      onChange={(e) => setNewSession({ ...newSession, member_id: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-gold/30 appearance-none transition-all"
                    >
                      <option value="" className="bg-[#0a0a0a]">Choose a client...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Session Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-2.5 block ml-1">
                      Session Type
                    </label>
                    <select
                      value={newSession.session_type}
                      onChange={(e) => setNewSession({ ...newSession, session_type: e.target.value as SessionType })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-gold/30 appearance-none transition-all"
                    >
                      {Object.entries(SESSION_TYPE_LABELS).map(([val, label]) => (
                        <option key={val} value={val} className="bg-[#0a0a0a]">{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-2.5 block ml-1">
                      Duration (Min)
                    </label>
                    <input
                      type="number"
                      value={newSession.duration_minutes}
                      onChange={(e) => setNewSession({ ...newSession, duration_minutes: parseInt(e.target.value) || 60 })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-gold/30 transition-all font-bold"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-2.5 block ml-1">
                      Date
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold/50 transition-colors" size={16} />
                      <input
                        type="date"
                        value={newSession.scheduled_date}
                        onChange={(e) => setNewSession({ ...newSession, scheduled_date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-gold/30 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-2.5 block ml-1">
                      Start Time
                    </label>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold/50 transition-colors" size={16} />
                      <input
                        type="time"
                        value={newSession.scheduled_time}
                        onChange={(e) => setNewSession({ ...newSession, scheduled_time: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-gold/30 transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 text-white/20 uppercase text-[10px] font-black tracking-[0.3em] hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleAddSession}
                  disabled={processing === "adding"}
                  className="flex-1 premium-button h-14 rounded-2xl text-black font-black tracking-[0.3em] uppercase text-[10px] shadow-2xl shadow-gold/20 flex items-center justify-center gap-2"
                >
                  {processing === "adding" ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

