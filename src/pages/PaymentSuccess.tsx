import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, updateMembership } = useAuth();
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const finalizePayment = async () => {
      if (!currentUser) return;
      
      try {
        // In a real app, we'd verify the sessionId with our backend/Stripe API
        // For this demo/MVP, we'll perform a client-side update
        await updateMembership("Elite");
        setLoading(false);
      } catch (err) {
        console.error("Error updating membership:", err);
        setLoading(false);
      }
    };

    finalizePayment();
  }, [currentUser, updateMembership, sessionId]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden text-white font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#FFB800]/5 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 text-center shadow-2xl relative z-10"
      >
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="text-emerald-500" size={40} />
        </div>

        <h1 className="text-4xl font-heading tracking-tight mb-4 uppercase">
          Elite <span className="text-[#FFB800]">Confirmed</span>
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-8 text-[10px] tracking-[0.3em] font-black uppercase text-white/30">
           <ShieldCheck size={14} className="text-[#FFB800]" />
           Identity Protocol Updated
        </div>

        <p className="text-white/60 leading-relaxed text-[11px] uppercase tracking-widest mb-10 font-medium">
          Your transmission was successful. Your profile has been elevated to Elite Status within the collective.
        </p>

        <div className="bg-black/20 rounded-2xl p-6 mb-10 border border-white/5 space-y-4">
           <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
              <span className="text-white/20">New Tier</span>
              <span className="text-[#FFB800]">Elite Status</span>
           </div>
           <div className="h-px bg-white/5" />
           <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
              <span className="text-white/20">Activation</span>
              <span className="text-emerald-400">Instant</span>
           </div>
        </div>

        <button
          onClick={() => navigate("/")}
          disabled={loading}
          className="w-full py-5 bg-[#FFB800] text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,184,0,0.2)] hover:shadow-[0_25px_50px_rgba(255,184,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
             <>
               <Loader2 className="animate-spin" size={14} />
               Synchronizing...
             </>
          ) : (
            <>
              Enter Main Arena <ArrowRight size={14} />
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
