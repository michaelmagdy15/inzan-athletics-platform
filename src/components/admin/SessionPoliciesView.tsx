import React, { useState } from 'react';
import { Shield, Save, Clock, XCircle, RefreshCw, AlertTriangle, Crown, CreditCard, Plus, Trash2, Users, CheckCircle2 } from 'lucide-react';
import { useData, SESSION_TYPE_LABELS, SessionType, MembershipTier } from '../../context/DataContext';

export default function SessionPoliciesView() {
    const { sessionPolicies, updateSessionPolicy, membershipTiers, addMembershipTier, deleteMembershipTier } = useData();
    const [activeTab, setActiveTab] = useState<'policies' | 'memberships'>('policies');

    // PT Policy States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);

    // Membership States
    const [showAddTier, setShowAddTier] = useState(false);

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

    const handleAddTier = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const featuresText = formData.get('features') as string;
        const features = featuresText.split(',').map(f => f.trim()).filter(f => f);

        try {
            await addMembershipTier({
                name: formData.get('name') as string,
                price: parseInt(formData.get('price') as string, 10),
                billing_cycle: formData.get('billing_cycle') as 'monthly' | 'yearly',
                features
            });
            setShowAddTier(false);
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="flex flex-col gap-6 lg:gap-10">
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">Policies & Memberships</h1>
                    <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">Configurable Rules & Packages</p>
                </div>

                <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-white/5 w-fit">
                    <button
                        onClick={() => setActiveTab('policies')}
                        className={`px-6 py-2 rounded-lg text-[9px] font-bold tracking-widest uppercase transition-all ${activeTab === 'policies' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        PT Policies
                    </button>
                    <button
                        onClick={() => setActiveTab('memberships')}
                        className={`px-6 py-2 rounded-lg text-[9px] font-bold tracking-widest uppercase transition-all ${activeTab === 'memberships' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        Memberships
                    </button>
                </div>
            </div>

            {activeTab === 'policies' && (
                <div className="flex flex-col gap-6">
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
            )}

            {activeTab === 'memberships' && (
                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center bg-black/40 p-6 rounded-[2rem] border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                <Crown size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest text-[10px]">Membership Tiers</h3>
                                <p className="text-[10px] text-white/40">Manage recurring subscription plans and facility access levels.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddTier(true)}
                            className="flex items-center gap-2 premium-button px-5 py-2.5 rounded-xl text-[9px] font-black tracking-widest uppercase text-black"
                        >
                            <Plus size={14} /> Add Tier
                        </button>
                    </div>

                    {showAddTier && (
                        <div className="glass-card rounded-[2rem] border border-white/5 p-6 mb-6">
                            <h4 className="text-xs uppercase tracking-widest font-bold text-white mb-6">Create New Tier</h4>
                            <form onSubmit={handleAddTier} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="name" type="text" required placeholder="TIER NAME (E.G. ELITE ACCESS)" className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-gold/30" />
                                <div className="flex gap-4">
                                    <input name="price" type="number" required placeholder="PRICE (EGP)" className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-gold/30" />
                                    <select name="billing_cycle" className="w-1/3 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-gold/30">
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                <input name="features" type="text" required placeholder="FEATURES (COMMA SEPARATED)" className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-gold/30" />
                                <div className="md:col-span-2 flex gap-4 mt-2">
                                    <button type="submit" className="flex-1 bg-[#FFB800] text-black font-bold uppercase tracking-widest text-[10px] rounded-xl py-3 shadow-lg shadow-gold/20">Save Tier</button>
                                    <button type="button" onClick={() => setShowAddTier(false)} className="px-6 text-white/30 uppercase text-[10px] font-bold tracking-widest hover:text-white">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {membershipTiers.map(tier => (
                            <div key={tier.id} className="glass-card flex flex-col justify-between rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFB800]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <h3 className="text-lg font-heading tracking-widest text-white uppercase">{tier.name}</h3>
                                        <button onClick={() => deleteMembershipTier(tier.id)} className="text-white/20 hover:text-red-400 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="mb-6">
                                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#FFB800] to-[#FF8A00]">{tier.price}</span>
                                        <span className="text-white/40 text-xs ml-1 uppercase">EGP / {tier.billing_cycle === 'monthly' ? 'MO' : 'YR'}</span>
                                    </div>
                                    <div className="space-y-3 mb-8">
                                        {tier.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <CheckCircle2 size={14} className="text-[#FFB800]" />
                                                <span className="text-sm text-white/70">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
