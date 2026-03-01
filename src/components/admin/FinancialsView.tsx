import React from 'react';
import { DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function FinancialsView() {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-light tracking-tight text-white/90 uppercase">FINANCIAL OVERVIEW</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
                <Scorecard title="MTD REVENUE" value="$42,850" trend="+15%" highlight />
                <Scorecard title="PENDING RENEWALS" value="12" />
                <Scorecard title="AVG. TICKET" value="$145" trend="+5%" />
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#121212]/50 backdrop-blur-2xl rounded-[40px] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
                <h3 className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase mb-10">RECENT TRANSACTIONS</h3>
                <div className="flex flex-col gap-4">
                    <TransactionItem name="Sarah J." type="Membership • Today, 10:45 AM" amount="250.00" initial="S" />
                    <TransactionItem name="Michael T." type="EK Kitchen • Today, 09:15 AM" amount="12.50" initial="M" />
                    <TransactionItem name="Elena V." type="Assessment • Yesterday" amount="150.00" initial="E" />
                </div>
            </div>
        </div>
    );
}

function Scorecard({ title, value, trend, highlight }: any) {
    return (
        <div className={`p-10 rounded-[40px] border relative overflow-hidden transition-all duration-500 group ${highlight ? 'bg-gradient-to-br from-[#FFB800]/20 to-transparent border-[#FFB800]/20' : 'bg-[#121212]/50 border-white/5 hover:border-white/10'
            }`}>
            <h3 className={`text-[10px] font-black tracking-[0.2em] uppercase mb-4 ${highlight ? 'text-[#FFB800]' : 'text-white/30'}`}>{title}</h3>
            <div className="flex items-baseline gap-4">
                <span className={`text-5xl font-light tracking-tight ${highlight ? 'text-[#FFB800]' : 'text-white'}`}>{value}</span>
                {trend && (
                    <span className="text-xs font-black text-[#58ff92] uppercase tracking-tighter">{trend}</span>
                )}
            </div>
            {highlight && (
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFB800]/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            )}
        </div>
    );
}

function TransactionItem({ name, type, amount, initial }: any) {
    return (
        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-xl font-light text-white/40 group-hover:text-[#FFB800] transition-colors">{initial}</div>
                <div>
                    <h4 className="text-lg font-light text-white mb-1">{name}</h4>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">{type}</p>
                </div>
            </div>
            <div className="text-right">
                <span className="text-lg font-mono text-[#FFB800] tracking-tighter">${amount}</span>
                <div className="flex items-center justify-end gap-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">SUCCESS</span>
                </div>
            </div>
        </div>
    );
}
