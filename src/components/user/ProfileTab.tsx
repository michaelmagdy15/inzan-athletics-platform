import React from "react";
import {
  Bell,
  Shield,
  Flame,
  Droplets,
  Award,
  Clock,
  Users,
  Package,
  Apple,
  Calendar,
  FileText,
  LogOut,
  ScanLine,
  Ticket,
} from "lucide-react";
import { useData, SESSION_TYPE_LABELS } from "../../context/DataContext";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function ProfileTab() {
  const { currentUser, ptPackages } = useData();
  const navigate = useNavigate();

  const activePackages = ptPackages.filter(
    (p) =>
      p.member_id === currentUser?.id &&
      p.status === "active" &&
      p.payment_confirmed &&
      p.remaining_sessions > 0
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="relative flex flex-col pb-24">
      <div className="absolute top-0 left-0 w-full h-80">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-30"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#050505]/80 to-[#050505]" />
      </div>

      <div className="relative z-10 p-4 lg:p-10 pt-8 lg:pt-16 flex flex-col gap-6 lg:gap-12">
        <header className="flex justify-between items-center mb-2 lg:mb-4 px-1">
          <h2 className="text-2xl lg:text-4xl font-heading tracking-tight text-white uppercase italic">
            Command Center
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/p/notifications")}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg"
            >
              <Bell size={18} lg:size={20} />
            </button>
            <button
              onClick={handleSignOut}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors shadow-lg"
            >
              <LogOut size={18} lg:size={20} />
            </button>
          </div>
        </header>

        <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-6 lg:p-10 border border-white/10 shadow-2xl relative overflow-hidden group transition-all hover:border-gold/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB800]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
            <div className="flex gap-4 lg:gap-8 items-center">
              <div className="relative group/avatar shrink-0">
                <div className="absolute inset-0 bg-gold blur-xl opacity-0 group-hover/avatar:opacity-20 transition-opacity" />
                <img
                  src={currentUser?.avatar}
                  className="w-20 h-20 lg:w-28 lg:h-28 rounded-2xl lg:rounded-3xl object-cover border-2 border-white/10 shadow-2xl relative z-10"
                  alt="Profile"
                />
                <div className="absolute -bottom-2 -right-2 w-7 h-7 lg:w-9 lg:h-9 bg-[#FFB800] rounded-full border-4 border-[#050505] flex items-center justify-center shadow-xl">
                  <Shield size={12} lg:size={16} className="text-black" />
                </div>
              </div>
              <div className="flex flex-col justify-center gap-1">
                <h2 className="font-heading text-2xl lg:text-4xl tracking-tight text-white uppercase italic">
                  {currentUser?.name}
                </h2>
                <p className="text-[9px] lg:text-[11px] text-[#FFB800] tracking-[0.4em] uppercase font-black italic opacity-80">
                  {currentUser?.role} • NODE {currentUser?.code}
                </p>
                <button
                  onClick={() => navigate("/p/qr-scanner")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FFB800] text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,184,0,0.3)] w-max mt-2"
                >
                  <ScanLine size={16} /> SCAN INGRESS
                </button>
              </div>
            </div>
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white p-2.5 rounded-2xl shrink-0 shadow-2xl rotate-3 flex items-center justify-center border-4 border-black group-hover:rotate-0 transition-transform duration-700">
              <QRCodeSVG
                value={currentUser?.code || "INZAN"}
                size={80}
                level="H"
                includeMargin={false}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-heading text-base lg:text-lg tracking-widest text-white/50 uppercase italic font-black">Biometric Diagnostics</h3>
            <span className="flex items-center gap-1.5 text-[9px] text-emerald-500 uppercase tracking-widest font-black italic">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />{" "}
              LINK ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 lg:p-8 border border-white/10 relative overflow-hidden group hover:border-red-500/20 transition-all">
              <Flame size={20} lg:size={24} className="text-red-500 mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-[9px] lg:text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mb-1">
                Day Strain
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl lg:text-5xl font-heading text-white italic">
                  {currentUser?.strain || 0}
                </p>
                <span className="text-[10px] text-white/20 font-black tracking-widest uppercase">NODE</span>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 lg:p-8 border border-white/10 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
              <Droplets size={20} lg:size={24} className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-[9px] lg:text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mb-1">
                Recovery
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl lg:text-5xl font-heading text-white italic">
                  {currentUser?.recovery || 0}
                </p>
                <span className="text-xl text-emerald-500/50 font-heading">%</span>
              </div>
            </div>
          </div>
        </div>

        {activePackages.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-base lg:text-lg tracking-widest text-white/50 uppercase italic font-black px-1">Tactical Subscriptions</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => navigate("/p/packages")}
                  className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 flex justify-between items-center cursor-pointer hover:bg-white/10 hover:border-gold/30 transition-all group"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#FFB800]/10 flex items-center justify-center border border-[#FFB800]/20 text-[#FFB800] group-hover:scale-110 transition-transform">
                      <Package size={20} lg:size={24} />
                    </div>
                    <div>
                      <p className="text-white font-black text-[11px] lg:text-sm uppercase tracking-widest italic">
                        {SESSION_TYPE_LABELS[pkg.package_type]}
                      </p>
                      <p className="text-[8px] lg:text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold mt-1.5 font-mono">
                        MOD: {pkg.coach_name || "OMNI"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl lg:text-4xl font-heading text-white italic">
                      {pkg.remaining_sessions}
                    </p>
                    <p className="text-[9px] text-[#FFB800] uppercase tracking-widest font-black italic">
                      CREDITS
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-base lg:text-lg tracking-widest text-white/50 uppercase italic font-black px-1">
            Athletic Passport
          </h3>
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 flex gap-8 lg:gap-12 overflow-x-auto scrollbar-hide snap-x">
            {(currentUser?.badges || []).map((badge, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center gap-4 min-w-[100px] lg:min-w-[120px] snap-center transition-all ${badge.achieved ? "opacity-100 scale-100" : "opacity-30 grayscale scale-95"}`}
              >
                <div
                  className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center border-4 ${idx === 0
                    ? "bg-gradient-to-br from-[#FFB800] to-[#b38100] border-white/20 shadow-[0_0_30px_#FFB80033]"
                    : idx === 1
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-white/20 shadow-[0_0_30px_#3b81f633]"
                      : "bg-white/10 border-white/10"
                    }`}
                >
                  {badge.icon === "Award" && (
                    <Award
                      size={badge.achieved ? 32 : 24}
                      className={idx === 0 ? "text-black" : "text-white"}
                    />
                  )}
                  {badge.icon === "Clock" && (
                    <Clock size={badge.achieved ? 32 : 24} className="text-white" />
                  )}
                  {badge.icon === "Dumbbell" && (
                    <Users size={badge.achieved ? 32 : 24} className="text-white" />
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] lg:text-[11px] font-black tracking-widest uppercase text-center leading-none whitespace-pre-line text-white/80 italic">
                    {badge.label.replace(" ", "\n")}
                  </span>
                  {badge.count && (
                    <span className="text-[9px] font-black text-gold tracking-widest italic">{badge.count} UNITS</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pb-10">
          <OptionItem
            icon={<Package size={22} />}
            label="Packages"
            onClick={() => navigate("/p/packages")}
          />
          <OptionItem
            icon={<Apple size={22} />}
            label="Nutrition"
            onClick={() => navigate("/p/nutrition")}
          />
          <OptionItem
            icon={<Calendar size={22} />}
            label="Logs"
            onClick={() => navigate("/p/attendance")}
          />
          <OptionItem
            icon={<FileText size={22} />}
            label="Financials"
            onClick={() => navigate("/p/billing")}
          />
          <div className="col-span-2 lg:col-span-4">
            <OptionItem
              icon={<Ticket size={24} />}
              label="Member Privileges & Invitations Balance"
              onClick={() => navigate("/p/invitations")}
              isFullWidth
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionItem({
  icon,
  label,
  onClick,
  isFullWidth
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isFullWidth?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-3xl rounded-3xl p-6 border border-white/5 flex ${isFullWidth ? "flex-row items-center gap-6" : "flex-col gap-5"} cursor-pointer hover:border-gold/30 hover:bg-white/[0.08] transition-all group shadow-xl`}
    >
      <div className={`rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#FFB800] group-hover:bg-[#FFB800]/10 transition-all shrink-0 ${isFullWidth ? "w-14 h-14" : "w-12 h-12"}`}>
        {icon}
      </div>
      <span className={`text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] leading-tight text-white/40 group-hover:text-white transition-colors italic ${isFullWidth ? "flex-1" : ""}`}>{label}</span>
      {isFullWidth && (
        <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-white/10 group-hover:text-gold group-hover:border-gold/30 transition-all">
          <ScanLine size={14} />
        </div>
      )}
    </div>
  );
}
