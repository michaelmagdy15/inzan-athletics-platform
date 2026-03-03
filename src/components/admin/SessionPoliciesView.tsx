import React, { useState } from 'react';
import { Shield, Save, Clock, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useData, SESSION_TYPE_LABELS, SessionType } from '../../context/DataContext';

export default function SessionPoliciesView() {
    const { sessionPolicies, updateSessionPolicy } = useData();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);

    const startEdit = (policyId: string) => {
        const policy = sessionPolicies.find(p => p.id === policyId);
        if (policy) {
            setEditingId(policyId);
            setEditValues({
                cancellation_window_hours: policy.cancellation_window_hours,
                no_show_deducts: policy.no_show_deducts,
                max_reschedules: policy.max_reschedules,
                package_validity_days: policy.package_validity_days,
                max_capacity: policy.max_capacity,
            });
        }
    };

    const handleSave = async () => {
        if (!editingId) return;
        setSaving(true);
        try {
            await updateSessionPolicy(editingId, editValues);
            setEditingId(null);
        } catch (err: any) { alert(err.message); }
        finally { setSaving(false); }
    };

    const iconForField = (field: string) => {
        if (field.includes('cancel')) return <XCircle size={14} className="text-red-400" />;
        if (field.includes('reschedule')) return <RefreshCw size={14} className="text-purple-400" />;
        if (field.includes('no_show')) return <AlertTriangle size={14} className="text-orange-400" />;
        return <Clock size={14} className="text-blue-400" />;
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-10">
            <div>
                <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">Session Policies</h1>
                <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">Configurable Rules & Controls</p>
            </div>

            <div className="glass-card rounded-[2rem] border border-white/5 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFB800]/10 flex items-center justify-center border border-[#FFB800]/20">
                    <Shield size={20} className="text-[#FFB800]" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">Policy Configuration</h3>
                    <p className="text-[10px] text-white/40">Set cancellation windows, no-show rules, reschedule limits, and package validity per session type.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sessionPolicies.map(policy => (
                    <div key={policy.id} className="glass-card rounded-[2rem] border border-white/5 p-6 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-[#FFB800]/10 text-[#FFB800] px-4 py-1.5 rounded-full font-bold tracking-widest uppercase border border-[#FFB800]/20">
                                {SESSION_TYPE_LABELS[policy.session_type as SessionType] || policy.session_type}
                            </span>
                            {editingId !== policy.id ? (
                                <button onClick={() => startEdit(policy.id)} className="text-[9px] text-white/40 font-bold tracking-widest uppercase hover:text-[#FFB800] transition-colors">Edit</button>
                            ) : (
                                <button onClick={handleSave} disabled={saving} className="premium-button px-4 py-2 rounded-xl flex items-center gap-2">
                                    <Save size={12} />
                                    <span className="text-[9px] font-black tracking-widest uppercase text-black">{saving ? '...' : 'Save'}</span>
                                </button>
                            )}
                        </div>

                        {[
                            { key: 'cancellation_window_hours', label: 'Cancellation Window', unit: 'hours' },
                            { key: 'max_reschedules', label: 'Max Reschedules', unit: 'per package' },
                            { key: 'package_validity_days', label: 'Package Validity', unit: 'days' },
                            { key: 'max_capacity', label: 'Max Capacity', unit: 'clients' },
                        ].map(field => (
                            <div key={field.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                    {iconForField(field.key)}
                                    <span className="text-sm text-white/70">{field.label}</span>
                                </div>
                                {editingId === policy.id ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number" min={0}
                                            value={editValues[field.key] ?? (policy as any)[field.key]}
                                            onChange={e => setEditValues({ ...editValues, [field.key]: parseInt(e.target.value) || 0 })}
                                            className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-right"
                                        />
                                        <span className="text-[9px] text-white/30">{field.unit}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm font-bold text-white">{(policy as any)[field.key]} <span className="text-white/30 font-normal text-[10px]">{field.unit}</span></span>
                                )}
                            </div>
                        ))}

                        {/* No-show toggle */}
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={14} className="text-orange-400" />
                                <span className="text-sm text-white/70">No-Show Auto Deducts</span>
                            </div>
                            {editingId === policy.id ? (
                                <button
                                    onClick={() => setEditValues({ ...editValues, no_show_deducts: !editValues.no_show_deducts })}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-bold tracking-widest uppercase border transition-colors ${editValues.no_show_deducts ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                                        }`}
                                >
                                    {editValues.no_show_deducts ? 'Enabled' : 'Disabled'}
                                </button>
                            ) : (
                                <span className={`text-sm font-bold ${policy.no_show_deducts ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {policy.no_show_deducts ? 'Yes' : 'No'}
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {sessionPolicies.length === 0 && (
                    <div className="col-span-2 text-center text-white/20 text-sm py-12">
                        No policies configured. Run the SQL migration to seed default policies.
                    </div>
                )}
            </div>
        </div>
    );
}
