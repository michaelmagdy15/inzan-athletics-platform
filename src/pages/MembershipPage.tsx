import React from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  Crown, 
  Zap, 
  ShieldCheck, 
  Star, 
  ChevronRight,
  ArrowLeft 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBranding } from "../context/BrandingContext";
import { MEMBERSHIP_PRICES, redirectToCheckout } from "../lib/stripe";

const Tiers = [
  {
    id: "standard",
    name: "Standard",
    price: "EGP 1,200",
    period: "/ MONTH",
    description: "Essential access to the arena.",
    features: [
      "Access to all facility areas",
      "Digital access pass",
      "Standard equipment access",
      "Community event access",
    ],
    highlight: false,
    priceId: MEMBERSHIP_PRICES.STANDARD,
  },
  {
    id: "elite",
    name: "Elite",
    price: "EGP 2,500",
    period: "/ MONTH",
    description: "The peak of athletic performance.",
    features: [
      "24/7 Unlimited Arena Access",
      "Priority equipment reservations",
      "Elite Recovery Suite access",
      "1x Monthly Nutrition Session",
      "Guest passes (2 per month)",
      "Premium Gear discounts",
    ],
    highlight: true,
    priceId: MEMBERSHIP_PRICES.ELITE,
  },
  {
    id: "pro",
    name: "Pro Performance",
    price: "EGP 1,800",
    period: "/ MONTH",
    description: "Advanced tools for the dedicated.",
    features: [
      "Access to specialized zones",
      "Basic recovery suite access",
      "Quarterly performance audit",
      "Extended booking window",
    ],
    highlight: false,
    priceId: MEMBERSHIP_PRICES.PRO,
  }
];

export default function MembershipPage() {
  const navigate = useNavigate();
  const { config } = useBranding();

  const handleSubscribe = async (priceId: string) => {
    try {
      await redirectToCheckout(priceId);
    } catch (err) {
      console.error(err);
      alert("Failed to initiate checkout. Please check your internet connection.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FFB800]/30 selection:text-white font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFB800]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFB800]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        {/* Header */}
        <header className="flex items-center justify-between mb-20">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Hub</span>
          </button>
          
          <div className="flex flex-col items-center">
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Crown className="text-[#FFB800]" size={20} />
             </div>
             <h1 className="text-xl font-light tracking-[0.5em] uppercase">
               Membership <span className="font-black text-[#FFB800]">Portal</span>
             </h1>
          </div>

          <div className="w-24" /> {/* Spacer */}
        </header>

        {/* Hero Section */}
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl lg:text-7xl font-heading tracking-tight mb-6">
              TRANSFORM YOUR <span className="text-gold italic">LEGACY.</span>
            </h2>
            <p className="text-white/40 leading-relaxed uppercase tracking-[0.2em] text-[10px] font-bold">
              Join the elite collective of athletes pushing beyond <br /> the thresholds of ordinary performance.
            </p>
          </motion.div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {Tiers.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative flex flex-col p-10 rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-500 group ${
                tier.highlight 
                ? "bg-white/[0.03] border-[#FFB800]/30 shadow-[0_0_80px_rgba(255,184,0,0.1)] scale-105 z-20" 
                : "bg-white/[0.02] border-white/5 hover:border-white/20"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFB800] text-black text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(255,184,0,0.5)]">
                  Most Elite
                </div>
              )}

              <div className="mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${
                  tier.highlight ? "bg-[#FFB800]/10 border border-[#FFB800]/20" : "bg-white/5 border border-white/10"
                }`}>
                  {tier.id === "elite" ? <Crown className="text-[#FFB800]" size={24} /> : 
                   tier.id === "pro" ? <Zap className="text-blue-400" size={24} /> : 
                   <Star className="text-white/40" size={24} />}
                </div>
                <h3 className="text-2xl font-heading tracking-tight mb-2 uppercase">{tier.name}</h3>
                <p className="text-[10px] text-white/30 tracking-widest uppercase font-bold">{tier.description}</p>
              </div>

              <div className="mb-10 flex items-baseline gap-2">
                <span className="text-4xl font-heading text-white">{tier.price}</span>
                <span className="text-[10px] text-white/20 font-black tracking-widest uppercase">{tier.period}</span>
              </div>

              <div className="flex-grow space-y-4 mb-10">
                {tier.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      tier.highlight ? "bg-[#FFB800]/10" : "bg-white/5"
                    }`}>
                      <Check size={10} className={tier.highlight ? "text-[#FFB800]" : "text-white/40"} />
                    </div>
                    <span className="text-[11px] text-white/60 tracking-wide font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(tier.priceId)}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                  tier.highlight 
                  ? "bg-[#FFB800] text-black shadow-[0_20px_40px_rgba(255,184,0,0.2)] hover:shadow-[0_25px_50px_rgba(255,184,0,0.3)]" 
                  : "bg-white/5 text-white border border-white/5 hover:bg-white/10"
                }`}
              >
                Select Protocol
                <ChevronRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Branding Footer */}
        <div className="text-center opacity-10">
          <p className="text-[8px] font-black uppercase tracking-[1em] mb-4">
            Powered by {config.shortName} Collective • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
