import React, { useState } from 'react';
import { ArrowUpRight, TrendingUp, CreditCard, Activity, ChevronRight, Wallet, AlertTriangle, ShieldCheck, Smartphone, Landmark, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';

export default function FinancialsView() {
    const { broadcastAlert } = useData();
    const [selectedMethod, setSelectedMethod] = useState('ALL');

    const paymentMethods = [
        { id: 'VISA', icon: <CreditCard size={14} />, label: 'VISA / DC' },
        { id: 'INSTAPAY', icon: <Smartphone size={14} />, label: 'INSTAPAY' },
        { id: 'BANK', icon: <Landmark size={14} />, label: 'BANK XFER' },
        { id: 'POS', icon: <Zap size={14} />, label: 'POS TERMINAL' },
    ];

    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-heading tracking-tight text-white mb-1 uppercase">Financial Management</h1>
                    <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">Income Tracking & Revenue Overview</p>
                </div>
                <div className="flex items-center gap-4 font-bold">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mr-4 font-bold">
                        {['ALL', 'ONLINE', 'POS'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setSelectedMethod(filter)}
                                className={`px-4 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase transition-all ${selectedMethod === filter ? 'bg-gold text-black' : 'text-white/20 hover:text-white'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <button className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-all">Download Report</button>
                    <button onClick={() => broadcastAlert('Financial accounts reconciled.', 'success')} className="premium-button px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase text-black">Reconcile Now</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Scorecard title="Monthly Revenue" value="42,850" currency="EGP" trend="+15%" highlight icon={<TrendingUp size={16} />} />
                <Scorecard title="Late Payments" value="08" subtitle="Requires Attention" alert icon={<AlertTriangle size={16} />} />
                <Scorecard title="Total Cash Flow" value="125,400" currency="EGP" trend="+5.2%" icon={<ShieldCheck size={16} />} />
            </div>

            {/* Arrears Alert Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-10 flex items-center justify-between group overflow-hidden relative font-bold"
            >
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)] group-hover:scale-110 transition-transform duration-700">
                        <Activity size={28} className="text-red-500 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-red-500 tracking-[0.3em] uppercase mb-1">Overdue Payments</h4>
                        <p className="text-sm text-white/50 font-light max-w-lg"><span className="text-white font-medium">8 Members</span> haven't settled their membership renewals. System sending <span className="text-red-400 font-bold underline decoration-red-500/30">Payment Reminders</span>.</p>
                    </div>
                </div>
                <button
                    onClick={() => broadcastAlert('Reminders sent to overdue accounts.', 'error')}
                    className="px-10 py-5 bg-red-500/10 border border-red-500/20 hover:border-red-500 hover:bg-red-500 hover:text-black rounded-2xl text-[9px] font-black text-red-500 tracking-[0.4em] uppercase transition-all"
                >
                    Send Reminders
                </button>
            </motion.div>

            {/* Transaction Stream */}
            <div className="glass-card rounded-[3rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex justify-between items-center mb-10 relative z-10 font-bold">
                    <div className="flex items-center gap-3">
                        <Wallet size={16} className="text-gold/50" />
                        <h3 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Recent Transactions</h3>
                    </div>
                    <div className="flex gap-4">
                        {paymentMethods.map(m => (
                            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-gold/50">{m.icon}</span>
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{m.id}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-6 relative z-10">
                    <TransactionItem name="Sarah J." type="Membership • Today, 10:45" amount="2,450" method="VISA" initial="SJ" status="Paid" />
                    <TransactionItem name="Michael T." type="EK Kitchen • Today, 09:15" amount="125" method="INSTAPAY" initial="MT" status="Paid" />
                    <TransactionItem name="Elena V." type="Assessment • Yesterday" amount="1,500" method="POS" initial="EV" status="Completed" />
                </div>
            </div>
        </div>
    );
}

function Scorecard({ title, value, currency, trend, subtitle, highlight, alert, icon }: any) {
    return (
        <div className={`p-10 rounded-[2.5rem] border relative overflow-hidden transition-all duration-700 group cursor-pointer font-bold ${highlight ? 'bg-gold/10 border-gold/20 shadow-[0_0_50px_rgba(202,138,4,0.1)]' :
            alert ? 'bg-red-500/5 border-red-500/10' :
                'bg-[#121212]/30 border-white/5 hover:border-gold/20'
            }`}>
            <div className="flex justify-between items-start mb-8">
                <div className={`transition-colors duration-500 ${alert ? 'text-red-500/50' : 'text-white/20 group-hover:text-gold/50'}`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/5 px-2.5 py-1 rounded-lg italic">{trend}</span>
                )}
                {alert && (
                    <span className="text-[10px] font-black text-red-500 bg-red-500/5 px-2.5 py-1 rounded-lg italic animate-pulse">ATTENTION</span>
                )}
            </div>

            <h3 className={`text-[10px] font-black tracking-[0.3em] uppercase mb-5 group-hover:text-gold transition-colors ${alert ? 'text-red-500/40' : 'text-white/20'}`}>{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-heading tracking-tight ${highlight ? 'text-gold' : alert ? 'text-white underline decoration-red-500/20' : 'text-white'}`}>{value}</span>
                {currency && <span className="text-xs text-white/20 uppercase font-black tracking-widest italic ml-1">{currency}</span>}
            </div>
            {subtitle && (
                <p className={`text-[8px] uppercase tracking-[0.3em] mt-4 font-bold ${alert ? 'text-red-500/30' : 'text-white/20'}`}>{subtitle}</p>
            )}
        </div>
    );
}

function TransactionItem({ name, type, amount, method, initial, status }: any) {
    return (
        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.04] hover:border-gold/20 transition-all duration-500 group cursor-pointer relative overflow-hidden font-bold">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold/0 group-hover:bg-gold/40 transition-all duration-500" />

            <div className="flex items-center gap-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-xl font-heading text-white/20 group-hover:text-gold transition-colors shadow-inner">{initial}</div>
                <div>
                    <h4 className="text-xl font-heading text-white mb-1 group-hover:text-gold transition-colors">{name}</h4>
                    <div className="flex items-center gap-3">
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">{type}</p>
                        <div className="w-px h-2.5 bg-white/10" />
                        <span className="text-[9px] font-black text-gold/60 uppercase tracking-widest font-bold tracking-tighter">{method}</span>
                    </div>
                </div>
            </div>

            <div className="text-right flex items-center gap-10 relative z-10">
                <div className="flex flex-col gap-1">
                    <div className="text-xl font-heading text-gold group-hover:text-white transition-colors tracking-tight">
                        {amount} <span className="text-[10px] text-white/20 uppercase font-black tracking-widest ml-1 italic">EGP</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                        <span className="text-[9px] font-black text-white/20 group-hover:text-emerald-500/60 transition-colors uppercase tracking-[0.2em] font-bold">{status}</span>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold/30 transition-all">
                    <ChevronRight size={16} className="text-white/10 group-hover:text-gold transition-all" />
                </div>
            </div>
        </div>
    );
}

