import React, { useState } from "react";
import { Send, Eye, Clock, Hash, Tag, Plus, CheckCircle2 } from "lucide-react";
import { useData } from "../../context/DataContext";
import { motion } from "framer-motion";
import { supabase } from "../../lib/firebase";

export default function GlobalAnnouncementsView() {
    const { setSystemAlert, currentUser, notifications } = useData();
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetGroup, setTargetGroup] = useState<"all" | "member" | "coach">("all");
    const [sending, setSending] = useState(false);

    const handleBroadcast = async () => {
        if (!title || !message) {
            setSystemAlert({ message: "Title and message are required.", type: "error" });
            return;
        }

        setSending(true);
        try {
            let query = supabase.from("profiles").select("id, role");
            if (targetGroup !== "all") {
                query = query.eq("role", targetGroup);
            }

            const { data: users, error: fetchError } = await query;
            if (fetchError) throw fetchError;

            if (users && users.length > 0) {
                const payload = users.map(u => ({
                    user_id: u.id,
                    title,
                    message,
                    type: "system_alert"
                }));

                const { error: insertError } = await supabase.from("notifications").insert(payload);
                if (insertError) throw insertError;
            }

            setSystemAlert({ message: `Network Broadcast Transmitted to ${users?.length || 0} entities.`, type: "success" });
            setTitle("");
            setMessage("");
        } catch (err: any) {
            setSystemAlert({ message: err.message || "Broadcast failed", type: "error" });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                    <Send className="text-emerald-500 w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-heading text-white uppercase tracking-wider">
                        Network Broadcast
                    </h2>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        Ping users via Push Notifications / In-App
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Composer */}
                <div className="glass-card rounded-[2rem] p-8 border border-white/10 flex flex-col gap-6">
                    <h3 className="text-[10px] font-black text-white/50 tracking-widest uppercase">
                        Compose Signal
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-white/60 font-black uppercase tracking-widest ml-2 mb-2 block">
                                Recipients
                            </label>
                            <div className="flex gap-2">
                                {["all", "member", "coach"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setTargetGroup(type as "all" | "member" | "coach")}
                                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl border transition-colors ${targetGroup === type ? "bg-[#FFB800]/10 border-[#FFB800]/30 text-[#FFB800]" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-white/60 font-black uppercase tracking-widest ml-2 mb-2 block">
                                Header
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Alert: Facility Closed Tomorrow"
                                className="w-full bg-[#050505] border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#FFB800]/50 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-white/60 font-black uppercase tracking-widest ml-2 mb-2 block">
                                Payload
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your broadcast message here..."
                                rows={6}
                                className="w-full bg-[#050505] border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#FFB800]/50 transition-colors resize-none"
                            />
                        </div>

                        <button
                            onClick={handleBroadcast}
                            disabled={sending}
                            className="w-full py-4 premium-button rounded-2xl text-black font-black uppercase tracking-widest mt-4 flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <span className="relative z-10 flex items-center gap-2">
                                {sending ? "Transmitting..." : "Send Broadcast"} <Send size={16} />
                            </span>
                        </button>
                    </div>
                </div>

                {/* History / Preview */}
                <div className="flex flex-col gap-6">
                    <div className="glass-card rounded-[2rem] p-8 border border-white/10 h-full flex flex-col">
                        <h3 className="text-[10px] font-black text-white/50 tracking-widest uppercase mb-6 flex items-center justify-between">
                            <span>Signal History</span>
                            <span className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">Active</span>
                        </h3>

                        {/* Just showing system stats for now since admin doesn't fetch global history yet */}
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-4">
                            <Eye size={48} className="text-white" />
                            <p className="text-[10px] font-black tracking-widest uppercase text-center max-w-[200px]">
                                Broadcast logs will populate here once verified in production db.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
