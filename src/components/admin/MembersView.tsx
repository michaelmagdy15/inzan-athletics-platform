import React, { useState, useMemo } from "react";
import { Member, useData } from "../../context/DataContext";
import {
  AlertCircle,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  Fingerprint,
  QrCode,
  UserCheck,
  Activity,
  Snowflake,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

interface MembersViewProps {
  members: Member[];
  selectedMember: Member | null;
  setSelectedMember: (member: Member) => void;
  onNewMember: () => void;
}

export default function MembersView({
  members,
  selectedMember,
  setSelectedMember,
  onNewMember,
}: MembersViewProps) {
  const { registerAttendance, broadcastAlert, freezeRequests, reviewFreezeRequest, attendanceLogs } = useData();
  const [attendanceCode, setAttendanceCode] = useState("");
  const [isAttendanceTerminalOpen, setIsAttendanceTerminalOpen] =
    useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended" | "expired" | "pending"
  >("all");

  const displayedMembers = useMemo(() => {
    if (statusFilter === "all") return members;
    return members.filter((m) => m.membershipStatus === statusFilter);
  }, [members, statusFilter]);

  const handleAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerAttendance(attendanceCode.toUpperCase());
      setAttendanceCode("");
      setIsAttendanceTerminalOpen(false);
    } catch (err: any) {
      broadcastAlert(err.message, "error");
    }
  };

  const stats = useMemo(() => {
    const activeCount = members.filter(
      (m) => m.membershipStatus === "active",
    ).length;
    const riskyCount = members.filter((m) => m.riskStatus === "high").length;
    const liveCount = members.filter(
      (m) =>
        m.lastAttendance &&
        Date.now() - new Date(m.lastAttendance).getTime() < 2 * 60 * 60 * 1000,
    ).length;

    return {
      total: members.length,
      active: activeCount,
      risky: riskyCount,
      live: liveCount,
    };
  }, [members]);

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">
            Member Management
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">
            Full Member List & Profiles
          </p>
        </div>
        <div className="flex items-center gap-3 lg:gap-4 font-bold w-full lg:w-auto">
          <button
            onClick={() => setIsAttendanceTerminalOpen(true)}
            className="flex-1 lg:flex-none bg-white/5 border border-white/5 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-white/10 group shadow-xl"
          >
            <QrCode
              size={16}
              className="text-white/40 group-hover:text-gold transition-colors"
            />
            <span className="text-[9px] lg:text-[10px] font-black tracking-widest uppercase text-white/60 group-hover:text-white transition-colors">
              Entry Terminal
            </span>
          </button>
          <button
            onClick={onNewMember}
            className="flex-1 lg:flex-none premium-button px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl flex items-center justify-center gap-3 shadow-2xl transition-all hover:scale-[1.02]"
          >
            <Plus size={16} className="text-black" />
            <span className="text-[9px] lg:text-[10px] font-black tracking-widest uppercase text-black">
              New Member
            </span>
          </button>
        </div>
      </div>

      {/* Retention Alert Banner */}
      {stats.risky > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8 flex items-center justify-between relative overflow-hidden group shadow-2xl font-bold"
        >
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] group-hover:scale-110 transition-transform duration-700">
              <AlertCircle className="text-red-500" size={28} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-1">
                Retention Alert
              </h3>
              <p className="text-[11px] text-white/40 leading-relaxed font-light uppercase tracking-widest">
                {stats.risky} Members identified with high churn risk.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <Scorecard
          title="Total"
          value={stats.total.toString()}
          trend="+2%"
        />
        <Scorecard
          title="Active"
          value={stats.active.toString()}
          highlight
          icon={<Activity size={14} />}
        />
        <Scorecard
          title="Live"
          value={stats.live.toString()}
          subtitle="In facility"
        />
        <Scorecard
          title="Risk"
          value={stats.risky.toString()}
          icon={<AlertCircle size={14} />}
        />
      </div>

      {/* Member Management List/Table */}
      <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="px-5 lg:px-10 py-5 lg:py-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20 font-bold">
          <div className="flex items-center gap-3">
            <ShieldAlert size={16} className="text-gold/50" />
            <h3 className="text-[9px] lg:text-[10px] font-black text-white/30 tracking-[0.3em] uppercase">
              Management Registry
            </h3>
          </div>
          <div className="flex gap-2 lg:gap-4 w-full sm:w-auto">
            <button
              onClick={() =>
                setStatusFilter((prev) =>
                  prev === "all"
                    ? "active"
                    : prev === "active"
                      ? "suspended"
                      : prev === "suspended"
                        ? "expired"
                        : prev === "expired"
                          ? "pending"
                          : "all",
                )
              }
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 bg-white/5 rounded-xl text-[9px] font-bold text-white/40 tracking-widest uppercase border border-white/5 hover:text-white hover:border-gold/30 transition-all"
            >
              <Filter size={12} /> Filter
            </button>
            <button className="flex-1 sm:flex-none px-4 lg:px-6 py-2.5 bg-gold/10 rounded-xl text-[9px] font-black text-gold tracking-widest uppercase border border-gold/20">
              {statusFilter === "all"
                ? "All Status"
                : statusFilter.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Desktop Table - Hidden on Mobile */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0c0c0c]/50 font-bold sticky top-0 z-10">
              <tr>
                <th className="px-6 xl:px-10 py-5 xl:py-6 text-[9px] text-white/20 uppercase tracking-[0.3em] font-black border-b border-white/5">
                  Member Name
                </th>
                <th className="px-6 xl:px-10 py-5 xl:py-6 text-[9px] text-white/20 uppercase tracking-[0.3em] font-black border-b border-white/5">
                  Role
                </th>
                <th className="px-6 xl:px-10 py-5 xl:py-6 text-[9px] text-white/20 uppercase tracking-[0.3em] font-black border-b border-white/5">
                  Status
                </th>
                <th className="px-6 xl:px-10 py-5 xl:py-6 text-[9px] text-white/20 uppercase tracking-[0.3em] font-black border-b border-white/5">
                  Expiry
                </th>
                <th className="px-6 xl:px-10 py-5 xl:py-6 text-[9px] text-white/20 uppercase tracking-[0.3em] font-black border-b border-white/5 text-right">
                  Risk
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-bold">
              {displayedMembers.map((member, idx) => (
                <motion.tr
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`cursor-pointer transition-all duration-500 group relative ${selectedMember?.id === member.id ? "bg-gold/5" : "hover:bg-white/[0.03]"}`}
                >
                  <td className="px-6 xl:px-10 py-5 xl:py-6 relative">
                    {selectedMember?.id === member.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold shadow-[0_0_15px_rgba(202,138,4,0.5)]" />
                    )}
                    <div className="flex items-center gap-4 xl:gap-5">
                      <div className="relative group/avatar shrink-0">
                        <div className="absolute inset-0 bg-gold blur-lg opacity-0 group-hover/avatar:opacity-20 transition-opacity" />
                        <img
                          src={member.avatar}
                          alt=""
                          className="w-10 h-10 xl:w-12 xl:h-12 rounded-2xl object-cover ring-2 ring-white/5 shadow-2xl relative z-10"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-heading text-base xl:text-lg tracking-tight text-white group-hover:text-gold transition-colors truncate max-w-[200px]">
                          {member.name}
                        </span>
                        <span className="text-[8px] xl:text-[9px] text-white/20 uppercase tracking-widest font-bold group-hover:text-white/40 transition-colors italic">
                          Member ID #{member.code}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 xl:px-10 py-5 xl:py-6">
                    <span className="text-[9px] xl:text-[10px] text-white/40 tracking-[0.1em] font-light uppercase group-hover:text-white/60 transition-colors italic">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 xl:px-10 py-5 xl:py-6">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.2)] ${member.membershipStatus === "active" ? "bg-emerald-400" : member.membershipStatus === "suspended" ? "bg-amber-500" : member.membershipStatus === "pending" ? "bg-blue-400" : "bg-red-500"}`}
                      />
                      <span
                        className={`text-[9px] xl:text-[10px] font-black tracking-[0.2em] uppercase ${member.membershipStatus === "active" ? "text-emerald-400" : member.membershipStatus === "suspended" ? "text-amber-500" : member.membershipStatus === "pending" ? "text-blue-400" : "text-red-500"}`}
                      >
                        {member.membershipStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 xl:px-10 py-5 xl:py-6 text-[10px] xl:text-[11px] text-white/30 font-mono tracking-widest uppercase">
                    {member.membershipExpiry
                      ? new Date(member.membershipExpiry).toLocaleDateString()
                      : "NO EXPIRY"}
                  </td>
                  <td className="px-6 xl:px-10 py-5 xl:py-6 text-right">
                    <span
                      className={`text-[8px] xl:text-[9px] font-black uppercase tracking-[0.2em] px-3 xl:px-4 py-1.5 rounded-lg ${member.riskStatus === "high" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}
                    >
                      {member.riskStatus.toUpperCase()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View - Cards */}
        <div className="lg:hidden divide-y divide-white/5 px-5">
          {displayedMembers.map((member, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="py-6 flex flex-col gap-4 active:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={member.avatar}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/10 shadow-lg"
                  />
                  <div className="flex flex-col">
                    <span className="font-heading text-base text-white">
                      {member.name}
                    </span>
                    <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold font-mono">
                      #{member.code}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${member.membershipStatus === "active" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : member.membershipStatus === "suspended" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : member.membershipStatus === "pending" ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`}
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] text-white/20 uppercase tracking-widest font-black">
                    Subscription
                  </span>
                  <span className="text-[9px] text-white/60 font-medium uppercase tracking-wider">
                    {member.membershipStatus} • {member.role}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-[8px] text-white/20 uppercase tracking-widest font-black text-right">
                    Risk Assessment
                  </span>
                  <span
                    className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${member.riskStatus === "high" ? "text-red-400 bg-red-400/10" : "text-emerald-400 bg-emerald-400/10"}`}
                  >
                    {member.riskStatus}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Freeze Requests Panel */}
      {freezeRequests.filter(fr => fr.status === 'pending').length > 0 && (
        <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="px-5 lg:px-10 py-5 lg:py-8 border-b border-white/5 flex justify-between items-center bg-black/20 font-bold">
            <div className="flex items-center gap-3">
              <Snowflake size={16} className="text-blue-400/50" />
              <h3 className="text-[9px] lg:text-[10px] font-black text-white/30 tracking-[0.3em] uppercase">
                Pending Freeze Requests
              </h3>
            </div>
            <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md uppercase tracking-widest">
              {freezeRequests.filter(fr => fr.status === 'pending').length} Pending
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {freezeRequests
              .filter(fr => fr.status === 'pending')
              .map((fr) => (
                <div key={fr.id} className="px-5 lg:px-10 py-5 lg:py-6 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white text-[11px] lg:text-xs font-bold uppercase tracking-widest">
                      {fr.member_name}
                    </p>
                    <p className="text-[9px] text-white/30 mt-1 uppercase tracking-widest font-bold">
                      {new Date(fr.start_date).toLocaleDateString()} → {new Date(fr.end_date).toLocaleDateString()}
                      {fr.reason && ` • ${fr.reason}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try { await reviewFreezeRequest(fr.id, 'approved'); } catch (e: any) { broadcastAlert(e.message, 'error'); }
                      }}
                      className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-all"
                    >
                      <Check size={14} className="text-emerald-500" />
                    </button>
                    <button
                      onClick={async () => {
                        try { await reviewFreezeRequest(fr.id, 'rejected'); } catch (e: any) { broadcastAlert(e.message, 'error'); }
                      }}
                      className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}


      {/* Attendance Terminal Modal */}
      <AnimatePresence>
        {isAttendanceTerminalOpen && (
          <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
            <motion.form
              onSubmit={handleAttendance}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 w-full max-w-lg flex flex-col gap-6 lg:gap-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/10 overflow-y-auto max-h-[95vh] scrollbar-hide"
              style={{ background: "rgba(20, 20, 20, 0.8)" }}
            >
              <div className="text-center font-bold">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gold/10 rounded-3xl mx-auto mb-4 lg:mb-6 flex items-center justify-center border border-gold/20 shadow-[0_0_30px_rgba(202,138,4,0.1)]">
                  <Fingerprint size={32} lg:size={40} className="text-gold" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-heading tracking-[0.2em] uppercase text-white mb-1 lg:mb-2">
                  Member Access Scan
                </h2>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 font-bold italic">
                  Member Entry Scan
                </p>
              </div>

              <div className="flex flex-col items-center justify-center bg-white p-4 rounded-3xl mx-auto my-2 mt-0 scale-90 sm:scale-100">
                <QRCodeSVG
                  value={`${window.location.origin}/attendance`}
                  size={120}
                  sm:size={140}
                />
                <p className="text-black font-bold uppercase tracking-[0.2em] text-[7px] mt-3">
                  Scan to check-in
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:gap-6">
                <input
                  autoFocus
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value)}
                  placeholder="ENTER MEMBER CODE"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 lg:p-6 text-lg lg:text-xl text-center text-white placeholder:text-white/5 focus:border-gold/30 outline-none transition-all uppercase tracking-[0.5em] font-heading shadow-inner"
                />
                <div className="flex items-center justify-center gap-3 text-white/20 font-bold">
                  <QrCode size={14} />
                  <span className="text-[9px] uppercase tracking-widest font-black">
                    Scanner active...
                  </span>
                </div>
              </div>

              <div className="flex gap-4 lg:gap-6 pt-2 lg:pt-4 font-bold">
                <button
                  type="button"
                  onClick={() => setIsAttendanceTerminalOpen(false)}
                  className="flex-1 py-4 text-white/20 uppercase text-[10px] font-bold tracking-[0.3em] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="premium-button flex-1 h-14 rounded-2xl text-black font-black tracking-[0.3em] uppercase text-[10px] shadow-2xl shadow-gold/20"
                >
                  Confirm Entry
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Scorecard({ title, value, trend, subtitle, highlight, icon }: any) {
  return (
    <div
      className={`p-5 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border relative overflow-hidden transition-all duration-700 group cursor-pointer font-bold ${highlight ? "bg-gold/10 border-gold/20 shadow-[0_0_50px_rgba(202,138,4,0.1)]" : "bg-[#121212]/30 border-white/5 hover:border-gold/20"}`}
    >
      <div className="absolute top-0 right-0 p-4 lg:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        {icon || <Search size={12} lg:size={14} className="text-gold/30" />}
      </div>

      <h3 className="text-[8px] lg:text-[9px] font-black tracking-[0.3em] text-white/20 uppercase mb-3 lg:mb-5 group-hover:text-gold/50 transition-colors uppercase font-bold">
        {title}
      </h3>
      <div className="flex items-baseline gap-2 lg:gap-4">
        <span
          className={`text-3xl lg:text-5xl font-heading tracking-tight ${highlight ? "text-gold" : "text-white"}`}
        >
          {value}
        </span>
        {trend && (
          <span className="text-[9px] lg:text-[10px] font-black text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded italic border border-emerald-400/10">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-[7px] lg:text-[8px] text-white/20 uppercase tracking-[0.3em] mt-2 lg:mt-3 font-bold">
          {subtitle}
        </p>
      )}

      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
