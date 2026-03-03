import React, { useState } from 'react';
import { Settings, ChevronRight, Shield, Bell, Cpu, Lock, Globe, Zap, ArrowLeft, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';

export default function SettingsView() {
    const { settings, updateSettings, broadcastAlert } = useData();
    const [activeSubPanel, setActiveSubPanel] = useState<string | null>(null);

    const settingsCategories = [
        { id: 'core', title: 'Gym Configuration', desc: 'Manage gym name, timezone, and local settings.', icon: <Globe size={18} /> },
        { id: 'governance', title: 'Admin & Access', desc: 'Manage administrative roles and staff permissions.', icon: <Shield size={18} /> },
        { id: 'notifications', title: 'Notification Center', desc: 'Configure SMS alerts, emails, and announcements.', icon: <Bell size={18} /> },
        { id: 'nexus', title: 'Integrations', desc: 'Connect with external fitness and nutrition apps.', icon: <Cpu size={18} /> },
        { id: 'security', title: 'Security & Privacy', desc: 'Manage data encryption and privacy compliance.', icon: <Lock size={18} /> },
    ];

    if (activeSubPanel) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-10"
            >
                <div className="flex items-center gap-6 font-bold">
                    <button
                        onClick={() => setActiveSubPanel(null)}
                        className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 hover:bg-gold/10 hover:border-gold/30 transition-all text-white/40 hover:text-gold"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-heading tracking-tight text-white mb-1 uppercase">
                            {settingsCategories.find(c => c.id === activeSubPanel)?.title}
                        </h1>
                        <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">Configure Details</p>
                    </div>
                </div>

                <div className="glass-card rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 border border-white/5 shadow-2xl relative overflow-hidden font-bold">
                    {activeSubPanel === 'core' && (
                        <div className="flex flex-col gap-8 max-w-xl">
                            <SettingField label="Gym Platform Name" value={settings.brandName} onChange={(val) => updateSettings({ brandName: val })} />
                            <SettingField label="Local Timezone" value={settings.timezone} onChange={(val) => updateSettings({ timezone: val })} />
                            <SettingField label="Currency Code" value={settings.currency} onChange={(val) => updateSettings({ currency: val })} />
                        </div>
                    )}
                    {activeSubPanel === 'governance' && (
                        <div className="flex flex-col gap-8 max-w-xl">
                            <SettingToggle label="Require Multi-Factor Authentication" active={settings.mfaRequired} onToggle={() => updateSettings({ mfaRequired: !settings.mfaRequired })} />
                            <SettingField label="Default Admin Level" value="Level 4 (Owner)" readOnly />
                        </div>
                    )}
                    {activeSubPanel === 'notifications' && (
                        <div className="flex flex-col gap-8 max-w-xl">
                            <SettingToggle label="Automated SMS Alerts" active={settings.notificationsEnabled} onToggle={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })} />
                            <SettingField label="Alert Frequency" value="Real-time" readOnly />
                        </div>
                    )}
                    {activeSubPanel === 'security' && (
                        <div className="flex flex-col gap-8 max-w-xl">
                            <SettingField label="Encryption Standard" value={settings.encryptionLevel} onChange={(val) => updateSettings({ encryptionLevel: val })} />
                            <button
                                onClick={() => broadcastAlert('Data purge process initiated...', 'warning')}
                                className="w-fit px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-black transition-all"
                            >
                                Force Data Purge
                            </button>
                        </div>
                    )}
                    {activeSubPanel === 'nexus' && (
                        <div className="flex flex-col gap-8 items-center justify-center py-20 text-center">
                            <RefreshCcw size={48} className="text-gold/20 animate-spin-slow mb-6" />
                            <h4 className="text-xl font-heading text-white/40 uppercase tracking-widest">Scanning for integrations...</h4>
                            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] mt-2">Checking external service connectivity.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col gap-6 lg:gap-10 font-bold">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">Store Settings</h1>
                    <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">Platform Config & Global Settings</p>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="flex flex-col items-end flex-1 lg:flex-none">
                        <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Version 2.0.9</span>
                        <span className="text-[8px] font-black text-gold/40 tracking-widest uppercase italic">By Michael Mitry</span>
                    </div>
                    <button onClick={() => broadcastAlert('System reset requested.', 'warning')} className="flex-1 lg:flex-none premium-button px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase text-black">Reset System</button>
                </div>
            </div>

            <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 p-6 lg:p-10 shadow-2xl relative overflow-hidden group font-bold">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />

                <div className="flex flex-col gap-4 lg:gap-6 relative z-10">
                    {settingsCategories.map((category, index) => (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={index}
                            onClick={() => setActiveSubPanel(category.id)}
                            className="w-full bg-[#121212]/30 hover:bg-white/[0.05] border border-white/5 hover:border-gold/30 rounded-[1.5rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center group transition-all duration-500 overflow-hidden relative gap-6"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-gold/0 group-hover:bg-gold/40 transition-all duration-500" />

                            <div className="text-left flex items-start sm:items-center gap-6 lg:gap-10">
                                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-white/20 group-hover:text-gold transition-colors shadow-inner group-hover:scale-105 transition-transform duration-500 shrink-0">
                                    {category.icon}
                                </div>
                                <div className="flex flex-col gap-1 lg:gap-2">
                                    <h4 className="text-lg lg:text-2xl font-heading text-white group-hover:text-gold transition-colors tracking-tight uppercase">{category.title}</h4>
                                    <p className="text-[11px] font-light text-white/30 sm:truncate max-w-2xl uppercase tracking-[0.1em]">{category.desc}</p>
                                </div>
                            </div>

                            <div className="w-full sm:w-auto flex justify-between sm:justify-end items-center gap-6 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                                <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] group-hover:text-gold/20 transition-colors">Configure Settings</span>
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-gold/30 transition-all transform group-hover:rotate-12">
                                    <ChevronRight size={20} className="text-white/10 group-hover:text-gold transition-all" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Security Integrity Badge */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-8 py-6 lg:py-10 opacity-50 font-bold text-center">
                <div className="flex items-center gap-3">
                    <Shield size={14} className="text-gold/40" />
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">SSL/AES-256 ENCRYPTED</span>
                </div>
                <div className="hidden sm:block w-1 h-1 rounded-full bg-white/10" />
                <div className="flex items-center gap-3">
                    <Zap size={14} className="text-gold/40" />
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">99.9% SYSTEM UPTIME</span>
                </div>
            </div>
        </div>
    );
}

function SettingField({ label, value, onChange, readOnly }: any) {
    return (
        <div className="flex flex-col gap-3 group font-bold">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] group-hover:text-gold/60 transition-colors">{label}</label>
            <input
                type="text"
                value={value}
                readOnly={readOnly}
                onChange={(e) => onChange?.(e.target.value)}
                className={`w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white text-sm outline-none focus:border-gold/30 transition-all font-medium tracking-wide uppercase ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
        </div>
    );
}

function SettingToggle({ label, active, onToggle }: any) {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 p-6 lg:p-8 bg-white/5 border border-white/5 rounded-[1.5rem] lg:rounded-3xl group hover:border-gold/20 transition-all font-bold">
            <span className="text-sm font-medium text-white/70 uppercase tracking-widest">{label}</span>
            <button
                onClick={onToggle}
                className={`w-16 h-8 rounded-full relative transition-all duration-500 border overflow-hidden ${active ? 'bg-gold/20 border-gold/40 shadow-[0_0_15px_rgba(202,138,4,0.2)]' : 'bg-white/5 border-white/10'}`}
            >
                <motion.div
                    animate={{ x: active ? 32 : 4 }}
                    className={`absolute top-1.5 w-5 h-5 rounded-full ${active ? 'bg-gold' : 'bg-white/20'}`}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </button>
        </div>
    );
}


