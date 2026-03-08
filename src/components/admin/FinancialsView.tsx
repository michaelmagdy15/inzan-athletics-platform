import React, { useState } from "react";
import {
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Activity,
  ChevronRight,
  Wallet,
  AlertTriangle,
  ShieldCheck,
  Smartphone,
  Landmark,
  Zap,
  Plus,
  X,
  Download,
  BarChart3,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "../../context/DataContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function FinancialsView() {
  const { members, transactions, broadcastAlert, addTransaction } = useData();
  const [selectedMethod, setSelectedMethod] = useState("ALL");
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Format transactions for display
  const displayTransactions = transactions
    .filter(
      (t) =>
        selectedMethod === "ALL" ||
        t.transaction_type.toUpperCase() === selectedMethod,
    )
    .map((t) => {
      const tMember = members.find((m) => m.id === t.member_id);
      const dateObj = new Date(t.created_at);
      const isToday =
        dateObj.toDateString() === new Date().toLocaleDateString();

      return {
        id: t.id,
        name: tMember ? tMember.name : "System / Walk-in",
        type: t.transaction_type.toUpperCase(),
        amount: t.amount,
        method: "N/A", // Not tracked in basic schema
        date: isToday
          ? `Today, ${dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
          : dateObj.toLocaleDateString(),
        status: t.status.toUpperCase(),
      };
    });

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const type = formData.get("type") as any;
    const amount = Number(formData.get("amount"));

    try {
      await addTransaction({
        amount,
        transaction_type:
          type === "PT Session"
            ? "package"
            : type === "Membership"
              ? "membership"
              : type === "EK Kitchen"
                ? "kitchen"
                : "other",
        status: "completed",
        description: `Manual Entry: ${type} by ${name}`,
        member_id: null, // Simplified for manual entry
      });
      setShowAddTransaction(false);
    } catch (error) {
      broadcastAlert("Failed to add transaction.", "error");
    }
  };

  const handleDownloadReport = () => {
    const headers = [
      "ID",
      "Name",
      "Type",
      "Amount (EGP)",
      "Method",
      "Date",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...displayTransactions.map(
        (t) =>
          `${t.id},"${t.name}","${t.type}",${t.amount},${t.method},"${t.date}","${t.status}"`,
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `financial_report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const last3Months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (2 - i));
    return d.toLocaleDateString("default", { month: "short" });
  });

  const dynamicRevenueData = last3Months.map((month) => {
    const revenue = transactions
      .filter(
        (t) =>
          t.status === "completed" &&
          new Date(t.created_at).toLocaleDateString("default", {
            month: "short",
          }) === month,
      )
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    return { name: month, revenue: revenue };
  });

  const topMembers = members
    .map((m) => {
      return {
        name: m.name,
        spend: transactions
          .filter((t) => t.member_id === m.id && t.status === "completed")
          .reduce((acc, t) => acc + Number(t.amount || 0), 0),
        tier: m.membershipTier || "Basic Access",
      };
    })
    .filter((m) => m.spend > 0)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  const monthlyRevenue = transactions
    .filter(
      (t) =>
        t.status === "completed" &&
        new Date(t.created_at).getMonth() === new Date().getMonth(),
    )
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalCashFlow = transactions
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const latePayments = transactions.filter(
    (t) => t.status === "failed" || t.status === "pending",
  ).length;

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">
            Financial Management
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">
            Income Tracking & Revenue Overview
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 font-bold w-full lg:w-auto">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 w-full sm:w-auto font-bold">
            {["ALL", "ONLINE", "POS"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedMethod(filter)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase transition-all ${selectedMethod === filter ? "bg-gold text-black" : "text-white/20 hover:text-white"}`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDownloadReport}
              className="flex-1 sm:flex-none px-4 lg:px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/40 tracking-widest uppercase hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Download size={14} /> Report
            </button>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="flex-1 sm:flex-none px-4 lg:px-6 py-3 bg-gold/10 border border-gold/20 rounded-xl text-[9px] font-black text-gold tracking-widest uppercase hover:bg-gold hover:text-black transition-all flex items-center gap-2"
            >
              <Plus size={14} /> Add Payment
            </button>
            <button
              onClick={() =>
                broadcastAlert("Financial accounts reconciled.", "success")
              }
              className="flex-1 sm:flex-none premium-button px-4 lg:px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase text-black"
            >
              Reconcile
            </button>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 glass-card rounded-[2rem] border border-white/5 p-5 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={16} className="text-gold/50" />
            <h3 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">
              Revenue Overview
            </h3>
          </div>
          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicRevenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB800" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FFB800" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#ffffff40"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#ffffff40"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#FFB800", fontWeight: "bold", fontSize: "10px" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FFB800"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] border border-white/5 p-5 sm:p-6 lg:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Users size={16} className="text-gold/50" />
            <h3 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">
              Elite Members
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 flex-1">
            {topMembers.map((member, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/30 group-hover:text-gold group-hover:border-gold/30 transition-all shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-bold text-white truncate">
                      {member.name}
                    </p>
                    <p className="text-[8px] text-white/20 uppercase tracking-widest truncate">
                      {member.tier}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-gold shrink-0">
                  {member.spend.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        <Scorecard
          title="Revenue"
          value={monthlyRevenue.toLocaleString()}
          currency="EGP"
          trend={monthlyRevenue > 0 ? "Active" : "-"}
          highlight
          icon={<TrendingUp size={16} />}
        />
        <Scorecard
          title="Late"
          value={latePayments.toString()}
          subtitle={latePayments > 0 ? "Urgent" : "Clear"}
          alert={latePayments > 0}
          icon={<AlertTriangle size={16} />}
        />
        <Scorecard
          title="Flow"
          value={totalCashFlow.toLocaleString()}
          currency="EGP"
          className="col-span-2 lg:col-span-1"
          icon={<ShieldCheck size={16} />}
        />
      </div>


      {/* Arrears Alert Banner */}
      <AnimatePresence>
        {latePayments > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-red-500/5 border border-red-500/10 rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col lg:flex-row items-center justify-between group overflow-hidden relative font-bold gap-6"
          >
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8 relative z-10 w-full lg:w-auto">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)] group-hover:scale-110 transition-transform duration-700 shrink-0">
                <Activity size={24} className="text-red-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-red-500 tracking-[0.3em] uppercase mb-1">
                  Overdue Payments
                </h4>
                <p className="text-sm text-white/50 font-light max-w-lg">
                  <span className="text-white font-medium">
                    {latePayments} Members
                  </span>{" "}
                  haven't settled their membership renewals. System sending{" "}
                  <span className="text-red-400 font-bold underline decoration-red-500/30">
                    Payment Reminders
                  </span>
                  .
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                broadcastAlert("Reminders sent to overdue accounts.", "error")
              }
              className="w-full lg:w-auto px-8 lg:px-10 py-4 lg:py-5 bg-red-500/10 border border-red-500/20 hover:border-red-500 hover:bg-red-500 hover:text-black rounded-2xl text-[9px] font-black text-red-500 tracking-[0.4em] uppercase transition-all"
            >
              Send Reminders
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Stream */}
      <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 p-6 lg:p-10 shadow-2xl relative overflow-hidden group flex flex-col gap-6 lg:gap-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 lg:mb-10 relative z-10 font-bold gap-6">
          <div className="flex items-center gap-3">
            <Wallet size={16} className="text-gold/50" />
            <h3 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">
              Recent Transactions
            </h3>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:gap-6 relative z-10">
          {displayTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              name={tx.name}
              type={`${tx.type} • ${tx.date}`}
              amount={Number(tx.amount).toLocaleString()}
              method={tx.method}
              initial={tx.name.substring(0, 2).toUpperCase()}
              status={tx.status}
            />
          ))}
          {displayTransactions.length === 0 && (
            <p className="text-[10px] text-white/20 uppercase tracking-widest italic my-4 text-center">
              No matching transactions
            </p>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddTransaction && (
          <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <motion.form
              onSubmit={handleAddTransaction}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card rounded-[2.5rem] p-8 lg:p-12 w-full max-w-md flex flex-col gap-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/10"
            >
              <div className="text-center font-bold">
                <h2 className="text-3xl font-heading tracking-[0.2em] uppercase text-white mb-2">
                  New Payment
                </h2>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 font-bold">
                  Manual Transaction Entry
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <input
                  name="name"
                  required
                  placeholder="MEMBER NAME"
                  className="form-input"
                />
                <select
                  name="type"
                  required
                  className="appearance-none bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-gold/30"
                >
                  <option value="PT Session" className="bg-[#050505]">
                    PT Session
                  </option>
                  <option value="Membership" className="bg-[#050505]">
                    Membership
                  </option>
                  <option value="EK Kitchen" className="bg-[#050505]">
                    EK Kitchen
                  </option>
                  <option value="Apparel" className="bg-[#050505]">
                    Apparel
                  </option>
                </select>
                <div className="flex gap-4">
                  <input
                    name="amount"
                    type="number"
                    required
                    placeholder="AMOUNT (EGP)"
                    className="form-input flex-1"
                  />
                  <select
                    name="method"
                    required
                    className="appearance-none w-1/3 bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-gold/30"
                  >
                    <option value="VISA" className="bg-[#050505]">
                      VISA
                    </option>
                    <option value="CASH" className="bg-[#050505]">
                      CASH
                    </option>
                    <option value="INSTAPAY" className="bg-[#050505]">
                      INSTA
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex gap-6 font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddTransaction(false)}
                  className="flex-1 py-4 text-white/20 uppercase text-[10px] font-bold tracking-[0.3em] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="premium-button flex-1 h-14 rounded-2xl text-black font-black tracking-[0.3em] uppercase text-[10px] shadow-2xl shadow-gold/20"
                >
                  Add Entry
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Scorecard({
  title,
  value,
  currency,
  trend,
  subtitle,
  highlight,
  alert,
  icon,
}: any) {
  return (
    <div
      className={`p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border relative overflow-hidden transition-all duration-700 group cursor-pointer font-bold ${highlight
          ? "bg-gold/10 border-gold/20 shadow-[0_0_50px_rgba(202,138,4,0.1)]"
          : alert
            ? "bg-red-500/5 border-red-500/10"
            : "bg-[#121212]/30 border-white/5 hover:border-gold/20"
        }`}
    >
      <div className="flex justify-between items-start mb-6 lg:mb-8">
        <div
          className={`transition-colors duration-500 ${alert ? "text-red-500/50" : "text-white/20 group-hover:text-gold/50"}`}
        >
          {icon}
        </div>
        {trend && (
          <span className="text-[9px] lg:text-[10px] font-black text-emerald-400 bg-emerald-400/5 px-2.5 py-1 rounded-lg italic">
            {trend}
          </span>
        )}
        {alert && (
          <span className="text-[9px] lg:text-[10px] font-black text-red-500 bg-red-500/5 px-2.5 py-1 rounded-lg italic animate-pulse">
            ATTENTION
          </span>
        )}
      </div>

      <h3
        className={`text-[9px] lg:text-[10px] font-black tracking-[0.3em] uppercase mb-4 lg:mb-5 group-hover:text-gold transition-colors ${alert ? "text-red-500/40" : "text-white/20"}`}
      >
        {title}
      </h3>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-4xl lg:text-5xl font-heading tracking-tight ${highlight ? "text-gold" : alert ? "text-white underline decoration-red-500/20" : "text-white"}`}
        >
          {value}
        </span>
        {currency && (
          <span className="text-[10px] lg:text-xs text-white/20 uppercase font-black tracking-widest italic ml-1">
            {currency}
          </span>
        )}
      </div>
      {subtitle && (
        <p
          className={`text-[8px] uppercase tracking-[0.3em] mt-3 lg:mt-4 font-bold ${alert ? "text-red-500/30" : "text-white/20"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function TransactionItem({ name, type, amount, method, initial, status }: any) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.02] border border-white/5 rounded-[1.5rem] lg:rounded-[2rem] p-6 lg:p-8 hover:bg-white/[0.04] hover:border-gold/20 transition-all duration-500 group cursor-pointer relative overflow-hidden font-bold gap-6">
      <div className="absolute top-0 left-0 w-1 h-full bg-gold/0 group-hover:bg-gold/40 transition-all duration-500" />

      <div className="flex items-center gap-4 lg:gap-8 relative z-10">
        <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-lg lg:text-xl font-heading text-white/20 group-hover:text-gold transition-colors shadow-inner shrink-0">
          {initial}
        </div>
        <div>
          <h4 className="text-lg lg:text-xl font-heading text-white mb-1 group-hover:text-gold transition-colors">
            {name}
          </h4>
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
              {type}
            </p>
            <div className="hidden sm:block w-px h-2.5 bg-white/10" />
            <span className="text-[9px] font-black text-gold/60 uppercase tracking-widest font-bold tracking-tighter">
              {method}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 lg:gap-10 relative z-10 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
        <div className="flex flex-col gap-1 text-left sm:text-right">
          <div className="text-xl font-heading text-gold group-hover:text-white transition-colors tracking-tight">
            {amount}{" "}
            <span className="text-[10px] text-white/20 uppercase font-black tracking-widest ml-1 italic">
              EGP
            </span>
          </div>
          <div className="flex items-center justify-start sm:justify-end gap-2">
            <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
            <span
              className={`text-[9px] font-black text-white/20 group-hover:text-emerald-500/60 transition-colors uppercase tracking-[0.2em] font-bold`}
            >
              {status}
            </span>
          </div>
        </div>
        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold/30 transition-all">
          <ChevronRight
            size={16}
            className="text-white/10 group-hover:text-gold transition-all"
          />
        </div>
      </div>
    </div>
  );
}
