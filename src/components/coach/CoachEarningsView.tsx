import React, { useMemo } from "react";
import {
    TrendingUp,
    DollarSign,
    Calendar,
    CreditCard,
    ArrowUpRight,
    ChevronRight,
    TrendingDown
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { motion } from "motion/react";
import { useData, SESSION_TYPE_LABELS } from "../../context/DataContext";

const COACH_RATE = 300; // EGP per completed session (as per CoachSessionsView)

export default function CoachEarningsView() {
    const { currentUser, ptSessions } = useData();

    if (!currentUser) return null;

    const mySessions = ptSessions.filter((s) => s.coach_id === currentUser.id);
    const completedSessions = mySessions.filter(s => s.status === "completed");

    const totalEarnings = completedSessions.length * COACH_RATE;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthSessions = completedSessions.filter(s => {
        const d = new Date(s.scheduled_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthSessions = completedSessions.filter(s => {
        const d = new Date(s.scheduled_date);
        const lm = currentMonth === 0 ? 11 : currentMonth - 1;
        const ly = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === lm && d.getFullYear() === ly;
    });

    const thisMonthEarnings = thisMonthSessions.length * COACH_RATE;
    const lastMonthEarnings = lastMonthSessions.length * COACH_RATE;
    const growth = lastMonthEarnings === 0 ? 100 : Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100);

    // Chart data: Group by day for the last 30 days
    const chartData = useMemo(() => {
        const days = 30;
        const data = [];
        for (let i = days; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            const count = completedSessions.filter(s => s.scheduled_date === dateStr).length;
            data.push({
                date: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                amount: count * COACH_RATE
            });
        }
        return data;
    }, [completedSessions]);

    // Breakdown by session type
    const typeBreakdown = useMemo(() => {
        const types = ["pt_1on1", "partner", "group", "nutrition", "trial", "class"];
        return types.map(t => ({
            name: SESSION_TYPE_LABELS[t as any] || t.toUpperCase(),
            value: completedSessions.filter(s => s.session_type === t).length * COACH_RATE,
            color: t === "pt_1on1" ? "#FFB800" : t === "partner" ? "#10b981" : t === "group" ? "#3b82f6" : "#a855f7"
        })).filter(t => t.value > 0);
    }, [completedSessions]);

    return (
        <div className="flex flex-col gap-6 lg:gap-12 pb-10">
            {/* Header */}
            <div className="px-1">
                <h1 className="text-2xl lg:text-4xl font-heading tracking-tight text-white mb-1 uppercase italic">
                    Financial Hub
                </h1>
                <p className="text-[10px] lg:text-[12px] tracking-[0.4em] text-white/30 uppercase font-black italic">
                    Analytics & Revenue Intelligence
                </p>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4 lg:gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card bg-gold/10 border border-gold/20 rounded-[2.5rem] p-6 lg:p-10 flex flex-col justify-between group hover:border-gold/40 transition-all shadow-2xl"
                >
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-4 bg-gold/20 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                                <DollarSign size={24} className="text-gold" />
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${growth >= 0 ? "text-emerald-400 bg-emerald-400/5" : "text-red-400 bg-red-400/5"} border ${growth >= 0 ? "border-emerald-400/10" : "border-red-400/10"}`}>
                                {growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {growth}%
                            </div>
                        </div>
                        <p className="text-[10px] lg:text-[11px] text-gold font-black tracking-widest uppercase mb-1.5 italic opacity-60">
                            Monthly Intelligence
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl lg:text-5xl font-heading text-white tracking-tighter italic">
                                {thisMonthEarnings.toLocaleString()}
                            </p>
                            <span className="text-xs lg:text-base font-black text-gold/50 italic">EGP</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-6 lg:p-10 flex flex-col justify-between group hover:border-white/20 transition-all shadow-2xl"
                >
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-4 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                                <CreditCard size={24} className="text-white/60" />
                            </div>
                        </div>
                        <p className="text-[10px] lg:text-[11px] text-white/30 font-black tracking-widest uppercase mb-1.5 italic">
                            Gross Revenue
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl lg:text-5xl font-heading text-white tracking-tighter italic">
                                {totalEarnings.toLocaleString()}
                            </p>
                            <span className="text-xs lg:text-base font-black text-white/20 italic">EGP</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Revenue Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-[3rem] border border-white/5 p-8 lg:p-12 relative overflow-hidden shadow-2xl"
            >
                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-gold rounded-full shadow-[0_0_15px_#ffb800]" />
                        <h3 className="text-[11px] lg:text-sm font-black text-white/40 tracking-[0.4em] uppercase italic">
                            Velocity Metrics
                        </h3>
                    </div>
                    <p className="text-[9px] lg:text-[10px] text-emerald-400 font-black tracking-widest uppercase bg-emerald-400/5 px-4 py-2 rounded-xl border border-emerald-400/10 italic">
                        ACTIVE CYCLE: 30D
                    </p>
                </div>

                <div className="h-64 lg:h-80 w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFB800" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#FFB800" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#ffffff20", fontSize: 10, fontWeight: 900 }}
                                minTickGap={30}
                            />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#050505",
                                    border: "1px solid rgba(255,184,0,0.2)",
                                    borderRadius: "16px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#FFB800"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                strokeWidth={3}
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Breakdown per Session Type */}
            <div className="flex flex-col gap-6 lg:gap-8">
                <h3 className="text-[11px] lg:text-sm font-black text-white/30 tracking-[0.4em] uppercase ml-3 italic">
                    Performance Segmentation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {typeBreakdown.length === 0 && (
                        <p className="text-center text-white/10 text-[10px] py-10 uppercase tracking-[0.3em] font-black border border-white/5 rounded-3xl col-span-2 italic">Scanning for registry data...</p>
                    )}
                    {typeBreakdown.map((item, idx) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.05 }}
                            className="glass-card rounded-3xl border border-white/5 p-6 flex items-center justify-between group hover:border-white/20 transition-all shadow-xl"
                        >
                            <div className="flex items-center gap-5">
                                <div
                                    className="w-2 h-2 rounded-full shadow-lg group-hover:scale-125 transition-transform"
                                    style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}
                                />
                                <div>
                                    <p className="text-xs lg:text-sm font-black text-white uppercase tracking-widest italic group-hover:text-gold transition-colors">
                                        {item.name}
                                    </p>
                                    <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-bold mt-1">
                                        {item.value / COACH_RATE} UNITS SYNCED
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl lg:text-2xl font-heading text-white italic">
                                    {item.value.toLocaleString()} <span className="text-[10px] font-sans font-black text-white/20 uppercase italic">EGP</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Mini List */}
            <div className="flex flex-col gap-6 lg:gap-8 pt-4">
                <div className="flex items-center justify-between ml-3 relative">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                        <h3 className="text-[11px] lg:text-sm font-black text-white/30 tracking-[0.4em] uppercase italic">
                            Ingress Registry
                        </h3>
                    </div>
                    <button className="text-[10px] font-black text-gold uppercase tracking-[0.2em] hover:opacity-100 opacity-60 transition-all italic underline underline-offset-4">
                        Archive Logs
                    </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {completedSessions.sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()).slice(0, 3).map((session, idx) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1 }}
                            className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-center justify-between group shadow-xl"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-lg">
                                    <ArrowUpRight size={18} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-[11px] lg:text-xs font-black text-white uppercase italic tracking-wider">
                                        {session.member_name}
                                    </h4>
                                    <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">
                                        {new Date(session.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {SESSION_TYPE_LABELS[session.session_type]}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm lg:text-base font-heading text-emerald-400 italic">+{COACH_RATE}</span>
                                <ChevronRight size={14} className="text-white/10 group-hover:text-gold transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
