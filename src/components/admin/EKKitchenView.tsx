import React from 'react';
import { useData } from '../../context/DataContext';
import { ShoppingCart, AlertCircle, TrendingUp, Package, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EKKitchenView() {
    const { kitchenItems, orders } = useData();

    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-heading tracking-tight text-white mb-1 uppercase">Kitchen Directorate</h1>
                    <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">Supply Chain & Macronutrient Logistics</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-all">Inventory Audit</button>
                    <button className="premium-button px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase text-black">Manual PO</button>
                </div>
            </div>

            {/* Critical Supply Vector Alert */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8 flex items-center justify-between relative overflow-hidden group shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)] group-hover:scale-110 transition-transform duration-700">
                        <ShoppingCart className="text-red-500" size={28} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-[0.2em] uppercase mb-1">Automated Procurement Protocol</h3>
                        <p className="text-[11px] text-white/40 leading-relaxed font-light">Organic Spinach reserves below critical threshold (4.2kg). Supplier PO #912 drafted for 20kg ($180).</p>
                    </div>
                </div>
                <button className="px-10 py-4 bg-red-500 text-white rounded-2xl text-[9px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all shadow-xl shadow-red-500/20 active:scale-95">
                    Authorize Acquisition
                </button>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 flex flex-col gap-10">
                    {/* Inventory Prediction Engine */}
                    <div className="glass-card rounded-[3rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-10">
                            <TrendingUp size={16} className="text-gold/50" />
                            <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Neural Inventory Prediction Matrix</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <PredictionCard title="Whey Protein (Vanilla)" value="12.4" unit="kg" status="Stable" trend="Reorder in 3 Cycles" color="gold" />
                            <PredictionCard title="Organic Spinach" value="4.2" unit="kg" status="Critical" trend="PO Active" color="red" />
                        </div>
                    </div>

                    {/* Registry Oversight Table */}
                    <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <div className="flex items-center gap-3">
                                <Package size={16} className="text-white/20" />
                                <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Inventory registry</h3>
                            </div>
                            <button className="text-[9px] font-black text-gold tracking-widest uppercase border-b border-gold/20 pb-0.5 hover:text-white transition-colors">Manage Entities</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#0c0c0c]/50">
                                    <tr>
                                        <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black border-b border-white/5">Macro-Entity</th>
                                        <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black border-b border-white/5">Classification</th>
                                        <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black border-b border-white/5">Valuation</th>
                                        <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black border-b border-white/5 text-right">Supply Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {kitchenItems.map((item, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={item.id}
                                            className="hover:bg-white/[0.03] transition-all duration-500 group cursor-pointer"
                                        >
                                            <td className="px-10 py-8 font-heading text-lg tracking-tight text-white group-hover:text-gold transition-colors">{item.name}</td>
                                            <td className="px-10 py-8 text-[10px] text-white/30 uppercase tracking-[0.2em] font-light italic">{item.category}</td>
                                            <td className="px-10 py-8 text-sm font-mono tracking-widest text-white/50">${item.price.toFixed(2)}</td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.quantity > item.reorder_threshold ? 'bg-emerald-500' : 'bg-gold animate-pulse shadow-[0_0_8px_rgba(202,138,4,0.5)]'}`} />
                                                    <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${item.quantity > item.reorder_threshold ? 'text-emerald-500/60' : 'text-gold'}`}>
                                                        {item.quantity > item.reorder_threshold ? 'Adequate' : 'Threshold'}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Real-time Order Stream */}
                <div className="glass-card rounded-[3rem] border border-white/5 p-10 shadow-2xl h-fit sticky top-24">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Live Order Stream</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[8px] text-emerald-400 font-black tracking-widest uppercase">Live Scan</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        {orders.slice(0, 5).map((o, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                key={o.id}
                                className="bg-[#121212]/30 border border-white/5 hover:border-gold/20 rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer transition-all duration-500"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">TX-{o.id.toString().slice(-6).toUpperCase()}</span>
                                    <span className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-lg text-[8px] font-black text-gold uppercase tracking-[0.2em]">{o.status}</span>
                                </div>
                                <h4 className="text-lg font-heading text-white mb-1 group-hover:text-gold transition-colors">1x {o.items?.[0]?.name || 'Pre-Fuel Formula'}</h4>
                                <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-bold mb-4">ENTITY: ALEX M. • #2091</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-1 text-gold/40">
                                        <Zap size={10} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Macro-Optimized</span>
                                    </div>
                                    <ChevronRight size={14} className="text-white/10 group-hover:text-gold transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PredictionCard({ title, value, unit, status, trend, color }: any) {
    return (
        <div className={`p-8 rounded-[2.5rem] border transition-all duration-700 group cursor-pointer relative overflow-hidden ${color === 'red' ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/30' : 'bg-gold/5 border-gold/10 hover:border-gold/30'}`}>
            <div className="flex justify-between items-start mb-6">
                <h4 className="text-[9px] font-black text-white/40 tracking-[0.3em] uppercase group-hover:text-white transition-colors">{title}</h4>
                <div className={`px-3 py-1 rounded-lg text-[8px] font-black tracking-[0.2em] uppercase ${color === 'red' ? 'text-red-500 bg-red-400/5' : 'text-gold bg-gold/5'}`}>{status}</div>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
                <span className={`text-4xl font-heading tracking-tight ${color === 'red' ? 'text-red-500' : 'text-white'}`}>{value}</span>
                <span className="text-xs text-white/20 uppercase font-black tracking-widest italic">{unit}</span>
            </div>
            <div className={`mt-auto flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] ${color === 'red' ? 'text-red-400' : 'text-gold/60'}`}>
                <Activity size={12} />
                <span>{trend}</span>
            </div>
        </div>
    );
}

function Activity({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    )
}

