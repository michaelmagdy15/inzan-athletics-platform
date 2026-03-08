import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Clock, LogOut, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function PendingApprovalPage() {
    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden selection:bg-gold/30">
            {/* Ambient Background */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-gold/5 blur-[120px] rounded-full pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10 text-center"
            >
                <div className="mb-12">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-gold/10 border border-gold/20 backdrop-blur-2xl mb-8 shadow-2xl relative group"
                    >
                        <ShieldAlert className="w-12 h-12 text-gold animate-pulse" />
                    </motion.div>
                    <h1 className="text-4xl font-heading font-light tracking-tight text-white mb-4 uppercase">
                        Access <span className="text-gold italic font-medium">Pending</span>
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-8 bg-gold/30" />
                        <p className="text-[10px] tracking-[0.4em] font-medium uppercase text-white/40">
                            Security Protocol Active
                        </p>
                        <div className="h-px w-8 bg-gold/30" />
                    </div>
                </div>

                <div className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden">
                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
                                    <Clock className="w-5 h-5 text-gold" />
                                </div>
                                <p className="text-xs font-bold text-white uppercase tracking-wider text-left">
                                    Verification Required
                                </p>
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed text-left uppercase tracking-widest">
                                Your application has been received. Our administrators are currently
                                verifying your profile. Access will be granted once approved.
                            </p>
                        </div>

                        <div className="py-4 border-t border-white/5 flex flex-col gap-4">
                            <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-medium italic">
                                Expected wait time: 2-24 Hours
                            </p>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="premium-button w-full h-16 rounded-2xl flex items-center justify-center gap-3 group"
                        >
                            <span className="text-black font-bold uppercase tracking-[0.2em] text-xs">
                                Log Out
                            </span>
                            <LogOut className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-white/20">
                    <p className="text-[9px] uppercase tracking-[0.4em] mb-2 font-medium">
                        Status: Identity Verified • Access Restricted
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
