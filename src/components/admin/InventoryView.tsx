import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Package, Wrench, ShieldCheck, ClipboardCheck, ChevronRight, Zap, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryView() {
    const { maintenanceLogs, equipment, facilityZones, addMaintenanceLog, broadcastAlert } = useData();
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    // Dynamic stats
    const totalMachines = equipment.length;
    const operationalMachines = equipment.filter(e => e.status === 'operational').length;
    const conditionPercentage = totalMachines > 0 ? Math.round((operationalMachines / totalMachines) * 100) : 100;
    const conditionTrend = conditionPercentage >= 90 ? 'GOOD' : conditionPercentage >= 75 ? 'FAIR' : 'POOR';

    const serviceRate = maintenanceLogs.length > 0 ? Math.round((maintenanceLogs.filter(m => m.status === 'completed').length / maintenanceLogs.length) * 100) : 100;
    const safeZones = facilityZones.filter(z => !z.requires_warning).length;
    const auditScore = facilityZones.length > 0 ? Math.round((safeZones / facilityZones.length) * 100) : 100;

    // Lifespan calculations
    const nowYear = new Date().getFullYear();
    const sumAges = equipment.reduce((acc, e) => acc + (nowYear - new Date(e.purchase_date).getFullYear()), 0);
    const avgAge = totalMachines > 0 ? (sumAges / totalMachines).toFixed(1) : '0';

    const acquisitionsNeeded = equipment.filter(e => (nowYear - new Date(e.purchase_date).getFullYear()) >= e.expected_lifespan_years).length;
    const maxLifespan = totalMachines > 0 ? Math.max(...equipment.map(e => e.expected_lifespan_years)) : 10;
    const ageProgressWidth = Math.min(100, (Number(avgAge) / (maxLifespan || 10)) * 100);

    const handleAddLog = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            await addMaintenanceLog({
                asset_name: formData.get('asset') as string,
                description: formData.get('desc') as string,
                status: formData.get('status') as any,
                temporal_marker: new Date().toLocaleDateString(),
                initials: 'AD'
            });
            setIsLogModalOpen(false);
        } catch (err) {
            broadcastAlert('Failed to log maintenance event.', 'error');
        }
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">Gym Facility</h1>
                    <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">Gym Equipment & Facility Logs</p>
                </div>
                <div className="flex items-center gap-3 lg:gap-4 font-bold w-full lg:w-auto">
                    <button onClick={() => broadcastAlert('Facility status refreshed.', 'info')} className="flex-1 lg:flex-none px-4 lg:px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-all">Refresh Status</button>
                    <button onClick={() => setIsLogModalOpen(true)} className="flex-1 lg:flex-none premium-button px-4 lg:px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase text-black">Log Maintenance</button>
                </div>
            </div>

            {/* Facility Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                <Scorecard title="Equipment Condition" value={`${conditionPercentage}%`} trend={conditionTrend} icon={<ShieldCheck size={18} />} highlight={conditionPercentage >= 90} />
                <Scorecard title="Total Machines" value={totalMachines.toString()} trend="ACTIVE" icon={<Package size={18} />} />
                <Scorecard title="Service Rate" value={`${serviceRate}%`} trend="LOGS" icon={<Wrench size={18} />} />
                <Scorecard title="Safety Audit" value={`${auditScore}%`} trend={auditScore >= 95 ? "OK" : "WARN"} icon={<ClipboardCheck size={18} />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Maintenance Log */}
                <div className="xl:col-span-2 flex flex-col gap-8">
                    <div className="glass-card rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative">
                        <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <div className="flex items-center gap-3">
                                <Wrench size={16} className="text-gold/50" />
                                <h3 className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Maintenance Log</h3>
                            </div>
                            <button onClick={() => setIsLogModalOpen(true)} className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/20 hover:text-gold transition-all">
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="p-10 flex flex-col gap-6 relative z-10">
                            {maintenanceLogs.length > 0 ? maintenanceLogs.map((log, idx) => (
                                <LogItem
                                    key={log.id}
                                    title={log.asset_name}
                                    desc={log.description}
                                    time={log.status.toUpperCase()}
                                    initial={log.asset_name.slice(0, 2).toUpperCase()}
                                    highlight={log.status === 'in_progress'}
                                />
                            )) : (
                                <div className="py-20 text-center">
                                    <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black">No active maintenance records</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Asset Lifecycle & Planning */}
                <div className="flex flex-col gap-10">
                    <div className="glass-card rounded-[3rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group h-fit">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Equipment Life</h3>
                            <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                                <Zap size={14} />
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                                    <span>Avg. Equipment Age</span>
                                    <span className="text-white">{avgAge} YRS</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gold/40 shadow-[0_0_10px_rgba(202,138,4,0.2)] transition-all duration-1000" style={{ width: `${ageProgressWidth}%` }} />
                                </div>
                            </div>

                            <p className="text-[11px] text-white/40 leading-relaxed uppercase tracking-widest font-bold">
                                Analysis indicates <span className="text-white">{acquisitionsNeeded} equipment replacement(s)</span> suggested for <span className="text-gold italic">this year</span>.
                            </p>

                            <button className="w-full py-5 bg-white/5 hover:bg-gold hover:text-black border border-white/5 hover:border-gold rounded-2xl flex justify-between items-center px-8 transition-all duration-500 group/btn font-bold">
                                <span className="text-[9px] font-black tracking-[0.3em] uppercase opacity-40 group-hover/btn:opacity-100 transition-opacity">Order Acquisition</span>
                                <ChevronRight size={14} className="text-white/10 group-hover/btn:text-black transition-all" />
                            </button>
                        </div>
                    </div>

                    <div className="glass-card rounded-[3rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden font-bold">
                        <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase mb-10">Facility Index</h3>
                        <div className="flex flex-col gap-6">
                            {facilityZones.length > 0 ? facilityZones.map(zone => (
                                <ZoneStatus key={zone.id} label={zone.name} status={zone.status} health={zone.health_percentage} warning={zone.requires_warning} />
                            )) : (
                                <p className="text-[10px] text-white/20 uppercase tracking-widest italic my-4 text-center">No Zones Tracked</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Maintenance Log Modal */}
            <AnimatePresence>
                {isLogModalOpen && (
                    <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4 font-bold">
                        <motion.form
                            onSubmit={handleAddLog}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-card rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 w-full max-w-lg flex flex-col gap-6 lg:gap-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/10"
                            style={{ background: 'rgba(20, 20, 20, 0.8)' }}
                        >
                            <div className="text-center">
                                <h2 className="text-3xl font-heading tracking-[0.2em] uppercase text-white mb-2">Record Event</h2>
                                <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 font-bold">New Maintenance Log Entry</p>
                            </div>

                            <div className="flex flex-col gap-6">
                                <input name="asset" required placeholder="ASSET DESIGNATION (e.g. Treadmill X1)" className="form-input font-bold" />
                                <input name="desc" required placeholder="FAILURE/SERVICE DESCRIPTION" className="form-input font-bold" />
                                <div className="relative group">
                                    <select name="status" className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white appearance-none uppercase tracking-widest cursor-pointer focus:border-gold/30 transition-all font-bold">
                                        <option value="scheduled" className="bg-black">Scheduled</option>
                                        <option value="in_progress" className="bg-black">In Progress</option>
                                        <option value="completed" className="bg-black">Completed</option>
                                    </select>
                                    <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-gold rotate-90 transition-colors pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex gap-6 pt-4 font-bold">
                                <button type="button" onClick={() => setIsLogModalOpen(false)} className="flex-1 py-4 text-white/20 uppercase text-[10px] font-bold tracking-[0.3em] hover:text-white transition-colors">Abort</button>
                                <button type="submit" className="premium-button flex-1 h-14 rounded-2xl text-black font-black tracking-[0.3em] uppercase text-[10px] shadow-2xl shadow-gold/20">Authorize Entry</button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Scorecard({ title, value, trend, icon, highlight }: any) {
    return (
        <div className={`p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border relative overflow-hidden transition-all duration-700 group cursor-pointer font-bold ${highlight ? 'bg-gold/10 border-gold/20 shadow-[0_0_60px_rgba(202,138,4,0.15)]' : 'bg-[#121212]/30 border-white/5 hover:border-gold/20'}`}>
            <div className="flex justify-between items-start mb-6 lg:mb-8">
                <div className="text-white/20 group-hover:text-gold transition-colors duration-500">{icon}</div>
                <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded-lg ${highlight ? 'bg-gold text-black' : 'bg-white/5 text-white/40 group-hover:text-white transition-colors'}`}>{trend}</span>
            </div>
            <h3 className="text-[9px] lg:text-[10px] font-black tracking-[0.3em] text-white/20 uppercase mb-3 lg:mb-4 group-hover:text-gold transition-colors font-bold">{title}</h3>
            <span className={`text-4xl lg:text-5xl font-heading tracking-tight ${highlight ? 'text-gold' : 'text-white'}`}>{value}</span>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    );
}

function LogItem({ title, desc, time, initial, highlight }: any) {
    const statusColor = time === 'COMPLETED' ? 'text-emerald-400' : time === 'IN_PROGRESS' ? 'text-gold' : 'text-white/20';
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.02] border border-white/5 rounded-[1.5rem] lg:rounded-[2rem] p-5 lg:p-8 hover:bg-white/[0.04] hover:border-gold/20 transition-all duration-500 group cursor-pointer relative overflow-hidden font-bold gap-6">
            <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-500 ${highlight ? 'bg-gold/40' : 'bg-gold/0 group-hover:bg-gold/20'}`} />
            <div className="flex items-center gap-4 lg:gap-8 relative z-10">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-lg font-heading text-white/20 group-hover:text-gold transition-colors shadow-inner">{initial}</div>
                <div>
                    <h4 className="text-lg lg:text-xl font-heading text-white group-hover:text-gold transition-colors">{title}</h4>
                    <p className="text-[10px] lg:text-[11px] text-white/40 font-light max-w-md tracking-wide uppercase">{desc}</p>
                </div>
            </div>
            <div className="w-full sm:w-auto text-right flex items-center justify-between sm:justify-end gap-6 lg:gap-10 relative z-10 transition-all">
                <div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${statusColor} transition-colors`}>{time}</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold/30 transition-all shadow-inner">
                    <ChevronRight size={14} className="text-white/10 group-hover:text-gold transition-all" />
                </div>
            </div>
        </div>
    );
}

function ZoneStatus({ label, status, health, warning }: any) {
    return (
        <div className="flex flex-col gap-2 font-bold">
            <div className="flex justify-between text-[9px] uppercase tracking-widest font-black">
                <span className="text-white/40">{label}</span>
                <span className={warning ? 'text-red-500' : 'text-emerald-400'}>{status}</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${warning ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} style={{ width: `${health}%` }} />
            </div>
        </div>
    );
}
