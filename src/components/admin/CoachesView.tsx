import React, { useMemo, useState } from "react";
import {
  UserCheck,
  Zap,
  Activity,
  Award,
  ChevronRight,
  X,
  Download,
  Plus,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "../../context/DataContext";

export default function CoachesView() {
  const {
    members,
    ptSessions,
    ptPackages,
    coachReviews,
    addCoach,
    setSystemAlert,
  } = useData();
  const coaches = members.filter((m) => m.role === "coach");
  const [selectedCoach, setSelectedCoach] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const coachData = useMemo(() => {
    return coaches.map((coach) => {
      const coachSessions = ptSessions.filter((s) => s.coach_id === coach.id);
      const allCoachPackages = ptPackages.filter(
        (p) => p.coach_id === coach.id || p.coach_name === coach.name,
      );
      const activePackages = allCoachPackages.filter(
        (p) => p.status === "active",
      );

      const activeClients = new Set(activePackages.map((p) => p.member_id))
        .size;
      const revenue = allCoachPackages.reduce(
        (acc, p) => acc + Number(p.price_paid || 0),
        0,
      );
      const avgSpend =
        activeClients > 0 ? Math.round(revenue / activeClients) : 0;

      const allClientIds = allCoachPackages.map((p) => p.member_id);
      const uniqueClients = new Set(allClientIds);
      let repeatClients = 0;
      uniqueClients.forEach((uid) => {
        if (allClientIds.filter((id) => id === uid).length > 1) repeatClients++;
      });
      const retention =
        uniqueClients.size > 0
          ? Math.round((repeatClients / uniqueClients.size) * 100)
          : 100;
      const sessionsTaught = coachSessions.filter(
        (s) => s.status === "completed",
      ).length;

      const reviewsForCoach = coachReviews
        ? coachReviews.filter((r) => r.coach_id === coach.id)
        : [];
      const avgRating =
        reviewsForCoach.length > 0
          ? reviewsForCoach.reduce((sum, r) => sum + Number(r.rating), 0) /
            reviewsForCoach.length
          : 5.0;

      return {
        id: coach.id,
        name: coach.name,
        retention: retention,
        spend: avgSpend,
        clients: activeClients,
        sessionsTaught: sessionsTaught,
        rating: avgRating,
        avatar: coach.avatar,
      };
    });
  }, [coaches, ptSessions, ptPackages, coachReviews]);

  // Average stats
  const avgRating = (
    coachData.reduce((acc, c) => acc + c.rating, 0) /
    Math.max(1, coachData.length)
  ).toFixed(2);
  const avgClients = (
    coachData.reduce((acc, c) => acc + c.clients, 0) /
    Math.max(1, coachData.length)
  ).toFixed(1);
  const totalSessionsThisWeek = coachData.reduce(
    (acc, c) => acc + c.sessionsTaught,
    0,
  ); // simplifying to all completed
  const avgRetention = Math.round(
    coachData.reduce((acc, c) => acc + c.retention, 0) /
      Math.max(1, coachData.length),
  );

  const handleDownloadReport = () => {
    const headers = [
      "ID",
      "Name",
      "Rating",
      "Clients",
      "Retention Rate",
      "Avg Spend",
      "Sessions Taught",
    ];
    const rows = coachData.map((c) => [
      c.id,
      c.name,
      c.rating.toFixed(2),
      c.clients,
      `${c.retention}%`,
      c.spend,
      c.sessionsTaught,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coaches_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddCoach = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    try {
      await addCoach({ name, ptPackages: [], reviews: [], ptSessions: [] });
      setSystemAlert?.({
        message: "Coach added successfully.",
        type: "success",
      });
      setShowAddModal(false);
    } catch (error: any) {
      setSystemAlert?.({
        message: error.message || "Failed to add coach. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-10 relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">
            Coaches & Trainers
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">
            Coach Performance & Analytics
          </p>
        </div>
        <div className="flex items-center gap-3 lg:gap-4 font-bold w-full lg:w-auto">
          <button
            onClick={handleDownloadReport}
            className="flex items-center justify-center gap-2 flex-1 lg:flex-none px-4 lg:px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-all"
          >
            <Download size={14} /> Report
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 flex-1 lg:flex-none premium-button px-4 lg:px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase text-black"
          >
            <Plus size={14} /> Add Coach
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 font-bold">
        <Scorecard
          title="Avg. Coach Rating"
          value={avgRating}
          trend="+0.05"
          highlight
          icon={<Award size={16} />}
        />
        <Scorecard
          title="Client Load"
          value={avgClients}
          trend="-1.2"
          subtitle="Avg. per Coach"
          icon={<Activity size={16} />}
        />
        <Scorecard
          title="Sessions Taught"
          value={totalSessionsThisWeek}
          trend="+15%"
          subtitle="All Time Completed"
          icon={<Zap size={16} />}
        />
        <Scorecard
          title="Retention Rate"
          value={`${avgRetention}%`}
          trend="+2%"
          subtitle="Team Average"
          icon={<UserCheck size={16} />}
        />
      </div>

      {/* Performance Chart */}
      <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 p-6 lg:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 lg:w-96 h-64 lg:h-96 bg-gold/5 blur-[80px] lg:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-10 relative z-10 font-bold gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-gold rounded-full shadow-[0_0_10px_rgba(202,138,4,0.5)]" />
            <h3 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">
              Coach Performance Chart
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <span className="text-[8px] text-white/20 uppercase tracking-widest font-black">
              Bubble Size: Total Sessions
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold/50 border border-gold" />
              <span className="text-[8px] text-gold font-black tracking-widest uppercase">
                Active Coaches
              </span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-96 w-full relative z-10 font-bold">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={100}
            minHeight={250}
          >
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="10 10"
                stroke="rgba(255,255,255,0.03)"
                vertical={false}
              />
              <XAxis
                type="number"
                dataKey="retention"
                name="Retention"
                unit="%"
                domain={[80, 100]}
                stroke="rgba(255,255,255,0.1)"
                tick={{
                  fill: "rgba(255,255,255,0.3)",
                  fontSize: 8,
                  lg: 10,
                  fontWeight: 700,
                }}
                label={{
                  value: "RETENTION RATE (%)",
                  position: "bottom",
                  fill: "rgba(255,255,255,0.1)",
                  fontSize: 8,
                  fontWeight: 900,
                  offset: 0,
                  letterSpacing: "0.1em",
                }}
              />
              <YAxis
                type="number"
                dataKey="spend"
                name="Avg Spend"
                unit="EGP"
                domain={[50, 200]}
                stroke="rgba(255,255,255,0.1)"
                tick={{
                  fill: "rgba(255,255,255,0.3)",
                  fontSize: 8,
                  lg: 10,
                  fontWeight: 700,
                }}
              />
              <ZAxis type="number" dataKey="clients" range={[100, 1000]} />
              <Tooltip
                cursor={{ stroke: "rgba(202, 138, 4, 0.2)", strokeWidth: 2 }}
                contentStyle={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  backdropFilter: "blur(10px)",
                }}
                itemStyle={{
                  color: "#CA8A04",
                  fontSize: "9px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              />
              <Scatter
                name="Instructors"
                data={coachData}
                fill="#CA8A04"
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Coach Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {coachData.map((coach) => (
          <CoachCard
            key={coach.id}
            name={coach.name}
            tier="Inzan Coach"
            clients={coach.clients}
            rating={coach.rating.toFixed(1)}
            avatar={coach.avatar}
            onClick={() => setSelectedCoach(coach)}
          />
        ))}
        {coachData.length === 0 && (
          <p className="text-white/30 text-sm">
            No coaches found. Add one from the header.
          </p>
        )}
      </div>

      {/* Add Coach Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.form
              onSubmit={handleAddCoach}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 w-full max-w-lg flex flex-col gap-6 lg:gap-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 max-h-[90vh] overflow-y-auto scrollbar-hide relative"
            >
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/50" />
              </button>

              <div className="text-center font-bold">
                <h2 className="text-2xl lg:text-3xl font-heading tracking-[0.2em] uppercase text-white mb-2">
                  Hire Instructor
                </h2>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 font-bold">
                  New Coach
                </p>
              </div>

              <div className="flex flex-col gap-4 font-bold">
                <input
                  name="name"
                  required
                  placeholder="COACH NAME"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold placeholder-white/20"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="COACH EMAIL"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold placeholder-white/20"
                />
                <input
                  name="specialty"
                  required
                  placeholder="SPECIALTY"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold placeholder-white/20"
                />
              </div>

              <div className="flex gap-6 pt-2 font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 text-white/20 uppercase text-[10px] font-bold tracking-[0.3em] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="premium-button flex-1 h-14 rounded-2xl text-black font-black tracking-[0.3em] uppercase text-[10px] shadow-2xl shadow-gold/20"
                >
                  Add Coach
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Coach Details Sidebar */}
      <AnimatePresence>
        {selectedCoach && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm z-40"
              onClick={() => setSelectedCoach(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[#0a0a0a] border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-start bg-black/20">
                <div className="flex flex-col gap-4">
                  <img
                    src={selectedCoach.avatar}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                  />
                  <div>
                    <h3 className="text-2xl font-heading text-white mb-1 uppercase">
                      {selectedCoach.name}
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-[9px] text-gold font-bold uppercase tracking-widest">
                      Inzan Coach
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCoach(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} className="text-white/50" />
                </button>
              </div>

              <div className="p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 scrollbar-hide">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
                    <span className="text-2xl font-heading text-white mb-1">
                      {selectedCoach.clients}
                    </span>
                    <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">
                      Active Clients
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
                    <span className="text-2xl font-heading text-gold mb-1">
                      {selectedCoach.rating.toFixed(1)}
                    </span>
                    <span className="text-[8px] text-gold/50 uppercase tracking-widest font-bold">
                      Avg Rating
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
                    <span className="text-xl font-heading text-emerald-400 mb-1">
                      {selectedCoach.retention}%
                    </span>
                    <span className="text-[8px] text-emerald-400/50 uppercase tracking-widest font-bold">
                      Retention
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5">
                    <span className="text-xl font-heading text-white mb-1">
                      {selectedCoach.sessionsTaught}
                    </span>
                    <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">
                      Sessions
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-black/20 p-5 lg:p-6 rounded-3xl border border-white/5 mt-4">
                  <div className="flex justify-between items-center group cursor-help">
                    <span className="text-[9px] text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">
                      Avg Spend per Session
                    </span>
                    <span className="text-[10px] lg:text-[11px] text-white font-medium truncate max-w-[120px]">
                      {selectedCoach.spend} EGP
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-black/40">
                <button className="w-full py-4 premium-button rounded-xl font-black text-[10px] tracking-[0.3em] uppercase text-black">
                  Message Coach
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Scorecard({ title, value, trend, subtitle, highlight, icon }: any) {
  return (
    <div
      className={`p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border relative overflow-hidden transition-all duration-700 group cursor-pointer font-bold ${
        highlight
          ? "bg-gold/10 border-gold/20 shadow-[0_0_50px_rgba(202,138,4,0.15)]"
          : "bg-[#121212]/30 border-white/5 hover:border-gold/20"
      }`}
    >
      <div className="flex justify-between items-start mb-5 lg:mb-6">
        <div className="text-white/20 group-hover:text-gold/50 transition-colors duration-500">
          {icon}
        </div>
        {trend && (
          <span
            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${trend.startsWith("+") ? "text-emerald-400 bg-emerald-400/5" : "text-red-400 bg-red-400/5"}`}
          >
            {trend}
          </span>
        )}
      </div>

      <h3 className="text-[9px] lg:text-[10px] font-black tracking-[0.3em] text-white/20 uppercase mb-3 lg:mb-4 group-hover:text-gold transition-colors">
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-4xl lg:text-5xl font-heading tracking-tight ${highlight ? "text-gold" : "text-white"}`}
        >
          {value}
        </span>
      </div>
      {subtitle && (
        <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] mt-3 font-bold">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function CoachCard({ name, tier, clients, rating, avatar, onClick }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 p-6 lg:p-10 flex flex-col items-center text-center shadow-2xl group hover:border-gold/30 transition-all duration-500 relative overflow-hidden font-bold"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="relative mb-6 lg:mb-8">
        <div className="absolute inset-0 bg-gold blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
        <img
          src={avatar}
          className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl lg:rounded-[2rem] object-cover ring-4 ring-white/5 group-hover:ring-gold/30 transition-all duration-700 shadow-2xl relative z-10"
          alt=""
        />
        <div className="absolute -bottom-2 lg:-bottom-3 -right-2 lg:-right-3 bg-gold text-black w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center border-4 border-[#050505] shadow-lg relative z-20">
          <UserCheck size={14} lg:size={18} />
        </div>
      </div>

      <h4 className="text-lg lg:text-xl font-heading text-white mb-1 group-hover:text-gold transition-colors">
        {name}
      </h4>
      <p className="text-[9px] text-white/30 tracking-[0.3em] font-black uppercase mb-6 lg:mb-8 italic">
        {tier}
      </p>

      <div className="w-full h-px bg-white/5 mb-6 lg:mb-8" />

      <div className="grid grid-cols-2 w-full">
        <div className="border-r border-white/5">
          <p className="text-2xl lg:text-3xl font-heading text-white">
            {clients}
          </p>
          <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] mt-2 font-bold select-none">
            CLIENTS
          </p>
        </div>
        <div>
          <p className="text-2xl lg:text-3xl font-heading text-gold group-hover:text-white transition-colors">
            {rating}
          </p>
          <p className="text-[8px] text-white/20 uppercase tracking-[0.4em] mt-2 font-bold select-none">
            RATING
          </p>
        </div>
      </div>

      <button
        onClick={onClick}
        className="w-full mt-8 lg:mt-10 py-4 lg:py-5 bg-white/5 hover:bg-gold/10 border border-white/5 hover:border-gold/30 rounded-2xl flex justify-between items-center px-6 lg:px-8 group/btn transition-all duration-500"
      >
        <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/30 group-hover/btn:text-gold transition-colors">
          Coach Profile
        </span>
        <ChevronRight
          size={14}
          className="text-white/10 group-hover/btn:text-gold transition-all"
        />
      </button>
    </motion.div>
  );
}
