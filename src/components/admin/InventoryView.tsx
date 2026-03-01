import React from 'react';
import { Package, Wrench, Activity, ShieldCheck } from 'lucide-react';

export default function InventoryView() {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-light tracking-tight text-white/90 uppercase">INVENTORY & FACILITIES</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
                <Scorecard title="EQUIPMENT STATUS" value="98%" subtitle="Optimal" />
                <Scorecard title="KITCHEN SUPPLIES" value="Low" highlight />
                <Scorecard title="FACILITY HEALTH" value="100%" />
            </div>

            {/* Maintenance Log */}
            <div className="bg-[#121212]/50 backdrop-blur-2xl rounded-[40px] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
                <h3 className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase mb-10">MAINTENANCE LOG</h3>
                <div className="flex flex-col gap-4">
                    <LogItem title="Squat Rack 2" desc="Cable replaced" time="2 DAYS AGO" />
                    <LogItem title="EK Kitchen" desc="Fridge temp check" time="TODAY" highlight />
                </div>
            </div>
        </div>
    );
}

function Scorecard({ title, value, subtitle, highlight }: any) {
    return (
        <div className={`p-10 rounded-[40px] border relative overflow-hidden transition-all duration-500 group ${highlight ? 'bg-gradient-to-br from-[#FFB800]/20 to-transparent border-[#FFB800]/20' : 'bg-[#121212]/50 border-white/5 hover:border-white/10'
            }`}>
            <h3 className={`text-[10px] font-black tracking-[0.2em] uppercase mb-4 ${highlight ? 'text-[#FFB800]' : 'text-white/30'}`}>{title}</h3>
            <div className="flex items-baseline gap-4">
                <span className={`text-4xl font-light tracking-tight ${highlight ? 'text-[#FFB800]' : 'text-white'}`}>{value}</span>
                {subtitle && (
                    <span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-[#FFB800]' : 'text-[#FFB800]'}`}>{subtitle}</span>
                )}
            </div>
            {highlight && (
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFB800]/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            )}
        </div>
    );
}

function LogItem({ title, desc, time, highlight }: any) {
    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex justify-between items-center group hover:bg-white/[0.04] transition-all">
            <div className="flex flex-col gap-1">
                <h4 className="text-lg font-light text-white">{title}</h4>
                <p className="text-sm text-white/40 font-light">{desc}</p>
            </div>
            <div className="text-right">
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${highlight ? 'text-[#FFB800]' : 'text-white/20'}`}>{time}</p>
            </div>
        </div>
    );
}
