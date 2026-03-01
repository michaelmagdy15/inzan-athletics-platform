import React from 'react';
import { Settings, ChevronRight } from 'lucide-react';

export default function SettingsView() {
    const settingsCategories = [
        { title: 'General Configuration', desc: 'Manage center hours, location details, and branding.' },
        { title: 'User Permissions', desc: 'Configure admin roles and access levels.' },
        { title: 'Notification Engine', desc: 'Manage automated emails, SMS, and push alerts.' },
        { title: 'API & Integrations', desc: 'Connect with third-party fitness and kitchen software.' },
        { title: 'Data & Privacy', desc: 'Export system data and manage GDPR compliance.' },
    ];

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-light tracking-tight text-white/90 uppercase">SYSTEM SETTINGS</h1>

            <div className="bg-[#121212]/50 backdrop-blur-2xl rounded-[40px] border border-white/5 p-10 shadow-2xl relative overflow-hidden flex flex-col gap-4">
                {settingsCategories.map((category, index) => (
                    <button
                        key={index}
                        className="w-full bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-3xl p-10 flex justify-between items-center group transition-all duration-300"
                    >
                        <div className="text-left flex flex-col gap-2">
                            <h4 className="text-xl font-light text-white group-hover:text-[#FFB800] transition-colors">{category.title}</h4>
                            <p className="text-xs font-light text-white/30 truncate max-w-2xl">{category.desc}</p>
                        </div>
                        <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </button>
                ))}
            </div>
        </div>
    );
}
