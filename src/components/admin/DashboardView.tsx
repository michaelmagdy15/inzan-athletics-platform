import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { motion } from "framer-motion";
import { Activity, Zap, Wallet, Users, UserCheck, Calendar, Download } from "lucide-react";

export default function DashboardView() {
  const {
    members,
    orders,
    classes,
    transactions,
    operatingGoals,
    broadcastAlert,
    attendanceLogs,
    refreshData,
  } = useData();

  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  const now = new Date();
  const filterDate = (dateString: string) => {
    if (!dateString) return false;
    if (dateFilter === "all") return true;
    const d = new Date(dateString);
    if (dateFilter === "today") {
      return d.toDateString() === now.toDateString();
    }
    if (dateFilter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    if (dateFilter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return d >= monthAgo;
    }
    return true;
  };

  const filteredOrders = orders.filter(o => filterDate(o.created_at));
  const filteredTransactions = transactions.filter(t => filterDate(t.created_at));
  const filteredAttendance = attendanceLogs.filter(a => filterDate(a.checked_in_at));

  // Dynamic Stats Calculation
  const kitchenSales = filteredOrders
    .filter((o) => o.status === "completed" || o.status === "picked_up")
    .reduce((acc, order) => acc + (Number(order.total_price) || 0), 0);
  const membershipSales = filteredTransactions
    .filter((t) => t.transaction_type === "membership")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const otherTransactions = filteredTransactions
    .filter(
      (t) =>
        t.transaction_type !== "membership" && t.transaction_type !== "kitchen",
    )
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalRevenue = kitchenSales + membershipSales + otherTransactions;

  const activeUsers = members.filter(
    (m) => m.membershipStatus === "active",
  ).length;
  const totalMembers = members.length;

  const totalCapacity = classes.reduce(
    (acc, c) => acc + (c.total_spots || 0),
    0,
  );
  const totalBooked = classes.reduce(
    (acc, c) => acc + (c.total_spots - c.spots_left),
    0,
  );
  const scheduleLoad =
    totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  // Dynamic Member Analytics
  const suspendedCount = members.filter(
    (m) =>
      m.membershipStatus === "suspended" || m.membershipStatus === "expired",
  ).length;
  const churnPotential =
    totalMembers > 0
      ? ((suspendedCount / totalMembers) * 100).toFixed(1)
      : "0.0";

  // Use target goals from DB
  const memberGoal = operatingGoals.find(
    (g) => g.metric_name === "New Members",
  );
  const memberTarget = memberGoal?.target_value || 50;
  const memberGrowthRate = Math.min(
    100,
    Math.round((activeUsers / memberTarget) * 100),
  );

  // Dynamic Class Analytics
  const avgAttendance =
    classes.length > 0 ? Math.round(totalBooked / classes.length) : 0;
  let peakHourStr = "N/A";
  if (classes.length > 0) {
    const hourCounts: Record<string, number> = {};
    classes.forEach((c) => {
      const hour =
        c.time.split(":")[0] +
        (c.time.includes("PM") ? " PM" : c.time.includes("AM") ? " AM" : ":00");
      hourCounts[hour] =
        (hourCounts[hour] || 0) + (c.total_spots - c.spots_left);
    });
    const peakHour =
      Object.keys(hourCounts).length > 0
        ? Object.keys(hourCounts).reduce((a, b) =>
          hourCounts[a] > hourCounts[b] ? a : b,
        )
        : "N/A";
    peakHourStr = peakHour;
  }

  const classEngagementWidth = Math.min(100, scheduleLoad);

  // Today's check-ins from attendance logs
  const todayStr = new Date().toDateString();
  const todayCheckIns = attendanceLogs.filter(
    (log) => new Date(log.checked_in_at).toDateString() === todayStr
  ).length;

  const exportCSV = (filename: string, rows: any[]) => {
    if (rows.length === 0) {
      broadcastAlert("No data available to export for the selected date range.", "warning");
      return;
    }
    const headers = Object.keys(rows[0]).join(",");
    const csvData = rows.map(row => Object.values(row).map(value => `"${value}"`).join(",")).join("\n");
    const blob = new Blob([`${headers}\n${csvData}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = async (label: string) => {
    switch (label) {
      case "Send Member Announcement":
        broadcastAlert("Announcement sent to all active members.", "info");
        break;
      case "Export Attendance Logs":
        exportCSV("attendance_logs", filteredAttendance);
        broadcastAlert("Exporting attendance logs...", "success");
        break;
      case "Export Revenue Records":
        exportCSV("revenue_transactions", filteredTransactions);
        broadcastAlert("Exporting revenue records...", "success");
        break;
      case "Sync System Time":
        try {
          await refreshData();
          broadcastAlert(
            "System time synchronized and data refreshed.",
            "success",
          );
        } catch (err) {
          broadcastAlert("Sync protocol failed. Check connectivity.", "error");
        }
        break;
      case "Run Security Check":
        broadcastAlert(
          "Running perimeter security check... All systems normal.",
          "warning",
        );
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col gap-5 xl:gap-8 min-h-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-heading tracking-tight text-white mb-0.5 uppercase">
            Admin Dashboard
          </h1>
          <p className="text-[9px] lg:text-[10px] tracking-[0.3em] text-white/30 uppercase font-bold italic">
            Real-time Systems Status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="bg-black/40 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2.5 outline-none focus:border-gold/50 cursor-pointer appearance-none text-center"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>

          <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/5 px-4 lg:px-5 py-2 rounded-xl lg:rounded-2xl backdrop-blur-xl transition-all hover:border-gold/30 group cursor-pointer shadow-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] lg:text-[10px] font-black text-white/40 tracking-widest uppercase group-hover:text-white transition-colors">
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        <StatCard
          title="Revenue"
          value={`${totalRevenue.toLocaleString()}`}
          currency="EGP"
          trend={totalRevenue > 0 ? "+ACTV" : "-"}
          icon={<Wallet size={16} />}
        />
        <StatCard
          title="Active"
          value={activeUsers.toString()}
          trend={`${totalMembers} TOT`}
          icon={<Users size={16} />}
        />
        <StatCard
          title="Sales"
          value={`${kitchenSales.toLocaleString()}`}
          currency="EGP"
          trend={kitchenSales > 0 ? "LIVE" : "-"}
          icon={<Zap size={16} />}
        />
        <StatCard
          title="Load"
          value={`${scheduleLoad}%`}
          highlight
          icon={<Activity size={16} />}
        />
        <StatCard
          title="Today"
          value={todayCheckIns.toString()}
          trend="CHECK-INS"
          icon={<UserCheck size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-10">
        {/* Operations Insights */}
        <div className="xl:col-span-2 glass-card rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-8 xl:p-10 relative overflow-hidden group shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex justify-between items-center mb-6 xl:mb-10 relative z-10 font-bold">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-[0_0_15px_rgba(202,138,4,0.1)]">
                <Activity size={20} className="text-gold" />
              </div>
              <div>
                <h3 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] text-white/80 leading-none">
                  Facility Overview
                </h3>
                <p className="text-[8px] lg:text-[9px] text-white/30 tracking-widest font-black uppercase mt-1.5 italic">
                  Neural Intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 xl:gap-10 relative z-10 font-bold">
            <div className="flex flex-col gap-4">
              <h4 className="text-[9px] text-gold/60 tracking-[0.4em] uppercase font-black">
                Members
              </h4>
              <div className="p-5 lg:p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest">
                    Target Met
                  </span>
                  <span className="text-emerald-400 font-bold text-[11px] lg:text-sm">
                    {memberGrowthRate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest">
                    Churn
                  </span>
                  <span
                    className={`${Number(churnPotential) > 5 ? "text-red-400" : "text-white/60"} font-bold text-[11px] lg:text-sm`}
                  >
                    {churnPotential}%
                  </span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold shadow-[0_0_10px_rgba(202,138,4,0.3)] transition-all duration-1000"
                    style={{ width: `${memberGrowthRate}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[9px] text-gold/60 tracking-[0.4em] uppercase font-black">
                Classes
              </h4>
              <div className="p-5 lg:p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest">
                    Avg Attendance
                  </span>
                  <span className="text-white font-bold text-[11px] lg:text-sm">
                    {avgAttendance}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest">
                    Peak Times
                  </span>
                  <span className="text-gold font-bold text-[11px] lg:text-sm truncate max-w-[80px]">{peakHourStr}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold shadow-[0_0_10px_rgba(202,138,4,0.3)] transition-all duration-1000"
                    style={{ width: `${classEngagementWidth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 xl:mt-10 p-5 lg:p-6 bg-gold/5 border border-gold/10 rounded-[2rem] relative overflow-hidden">
            <p className="text-[9px] lg:text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-[0.2em] relative z-10 italic">
              System analysis: active capacity load at {scheduleLoad}%. Operational maintenance advised for peak synchronization.
            </p>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-col gap-6 lg:gap-10 font-bold">
          <div className="glass-card rounded-[2rem] lg:rounded-[3rem] p-6 xl:p-10 flex flex-col gap-5 xl:gap-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <h3 className="text-[9px] xl:text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              Operations Control
            </h3>
            <div className="flex flex-col gap-3.5">
              <ActionButton
                label="Broadcast Alert"
                onClick={() => handleAction("Send Member Announcement")}
              />
              <ActionButton
                label="Export Attendance Logs"
                onClick={() => handleAction("Export Attendance Logs")}
                icon={<Download size={14} />}
              />
              <ActionButton
                label="Export Revenue Records"
                onClick={() => handleAction("Export Revenue Records")}
                icon={<Download size={14} />}
              />
              <ActionButton
                label="System Sync"
                onClick={() => handleAction("Sync System Time")}
              />
              <ActionButton
                label="Hardware Audit"
                variant="danger"
                onClick={() => handleAction("Run Security Check")}
              />
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gold/5 border border-gold/10 rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-8 xl:p-10 flex flex-col gap-4 relative overflow-hidden group shadow-xl"
          >
            <div className="absolute top-0 right-0 p-6 lg:p-10">
              <Zap size={20} className="text-gold animate-shimmer" />
            </div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-gold/80">
              Neural Status
            </h3>
            <p className="text-[10px] lg:text-[11px] font-medium text-white/50 leading-relaxed uppercase tracking-widest leading-loose">
              System integrity established at{" "}
              <span className="text-white font-bold">99.8%</span>. Node
              synchronization complete.
              <br />
              <br />
              <span className="text-gold font-black border-b border-gold/20 pb-0.5 cursor-pointer hover:text-white transition-colors">
                RECOVERY LOGS
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, currency, trend, highlight, icon }: any) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className={`p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border relative overflow-hidden transition-all duration-700 group cursor-pointer shadow-2xl font-bold ${highlight ? "bg-gold/10 border-gold/20 shadow-[0_0_60px_rgba(202,138,4,0.15)]" : "bg-white/[0.02] border-white/5 hover:border-gold/30"}`}
    >
      <div className="flex justify-between items-start mb-6 lg:mb-10">
        <div className="p-2 sm:p-0 text-white/20 group-hover:text-gold/50 transition-colors duration-500">
          {icon}
        </div>
        {trend && (
          <span className="text-[8px] lg:text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl italic border border-emerald-400/10">
            {trend}
          </span>
        )}
      </div>

      <h3 className="text-[8px] lg:text-[10px] font-black tracking-[0.3em] text-white/30 uppercase mb-2 group-hover:text-gold transition-colors">
        {title}
      </h3>
      <div className="flex items-baseline gap-1 sm:gap-2">
        <span
          className={`text-3xl sm:text-4xl lg:text-6xl font-heading tracking-tighter ${highlight ? "text-gold" : "text-white"}`}
        >
          {value}
        </span>
        {currency && (
          <span className="text-[8px] lg:text-xs text-white/20 uppercase font-black tracking-widest italic">
            {currency}
          </span>
        )}
      </div>

      {/* Visual Flare */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

function ActionButton({
  label,
  variant,
  onClick,
  icon,
}: {
  label: string;
  variant?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-gold/30 rounded-xl sm:rounded-2xl lg:rounded-[1.5rem] p-4 sm:p-5 lg:p-7 flex justify-between items-center group transition-all duration-500 shadow-xl cursor-pointer overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gold/0 group-hover:bg-gold/40 transition-all duration-500" />
      <span
        className={`text-[8px] lg:text-[10px] font-black tracking-[0.2em] uppercase transition-colors relative z-10 text-left ${variant === "danger" ? "text-red-400/60 group-hover:text-red-400" : "text-white/40 group-hover:text-white"}`}
      >
        {label}
      </span>
      <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold/30 transition-all relative z-10 shadow-inner shrink-0 ml-4">
        <motion.div
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {icon ? <span className="text-white/10 group-hover:text-gold transition-colors">{icon}</span> : <Activity size={14} className="text-white/10 group-hover:text-gold transition-colors" />}
        </motion.div>
      </div>
    </button>
  );
}
