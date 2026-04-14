import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 text-center shadow-2xl"
      >
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="text-amber-500" size={40} />
        </div>

        <h1 className="text-3xl font-heading tracking-tight mb-4 uppercase">
          Transition <span className="text-amber-500">Aborted</span>
        </h1>
        
        <p className="text-white/40 leading-relaxed text-[11px] uppercase tracking-widest mb-10 font-bold">
          The payment protocol was cancelled. No changes have been made to your identity profile.
        </p>

        <button
          onClick={() => navigate("/membership")}
          className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all border border-white/10"
        >
          <ArrowLeft size={14} />
          Return to Portal
        </button>
      </motion.div>
    </div>
  );
}
