import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, ShieldX, Info } from "lucide-react";

interface QRScannerViewProps {
  currentUser: any;
  config: any;
  scanStatus: "idle" | "success" | "error";
  handleSimulateScan: () => void;
}

export default function QRScannerView({ currentUser, config, scanStatus, handleSimulateScan }: QRScannerViewProps) {
  return (
    <div className="flex flex-col items-center gap-8 py-4">
      <div className="text-center font-bold">
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-2 font-bold italic">
          Digital Identity
        </p>
        <h3 className="text-2xl font-heading text-white uppercase">
          Access Key
        </h3>
      </div>

      <div className="relative group">
        <AnimatePresence mode="wait">
          {scanStatus === "idle" ? (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="relative"
            >
              <div className="absolute -inset-8 bg-[#FFB800]/10 rounded-full blur-3xl group-hover:bg-[#FFB800]/20 transition-all duration-700" />
              <div className="w-64 h-64 bg-white p-6 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/20 transition-transform group-hover:scale-[1.02] duration-500">
                <QRCodeSVG
                  value={currentUser?.code || config.shortName}
                  size={256}
                  level="H"
                  includeMargin={false}
                  className="w-full h-full"
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full z-20 whitespace-nowrap">
                <span className="text-[10px] text-white font-black tracking-widest uppercase">
                  Member ID: {currentUser?.code}
                </span>
              </div>
            </motion.div>
          ) : scanStatus === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-64 h-64 flex flex-col items-center justify-center bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl relative z-10"
            >
              <CheckCircle2
                size={64}
                className="text-emerald-500 mb-4 animate-bounce"
              />
              <p className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">
                Access Granted
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-64 h-64 flex flex-col items-center justify-center bg-red-500/10 rounded-[2.5rem] border border-red-500/20 shadow-2xl relative z-10"
            >
              <ShieldX size={64} className="text-red-500 mb-4" />
              <p className="text-red-500 font-black uppercase tracking-widest text-[10px]">
                Identity Denied
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6 w-full mt-4">
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-[#FFB800]/10 flex items-center justify-center border border-[#FFB800]/20 font-bold shrink-0">
            <Info size={16} className="text-[#FFB800]" />
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed italic font-bold">
            Show this code at the terminal boundary for synchronized
            facility entry.
          </p>
        </div>
        <button
          onClick={handleSimulateScan}
          className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl shadow-2xl hover:bg-[#FFB800] transition-all transform active:scale-95"
        >
          Simulate Terminal Scan
        </button>
      </div>
    </div>
  );
}
