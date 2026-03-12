import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, QrCode, ShieldX, CheckCircle2, Info, UserPlus, Ticket, Clock, Calendar as CalIcon, Dumbbell, Plus, X, Save, TrendingUp, MessageSquare, Send } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useData } from "../context/DataContext";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const ContentLibraryView = React.lazy(() => import('../components/user/ContentLibraryView'));
const EventsOffersView = React.lazy(() => import('../components/user/EventsOffersView'));

export default function UserSubPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { currentUser, registerAttendance, membershipTiers, checkoutPay, invitations, createInvitation, packageOfferings, attendanceLogs, submitFreezeRequest, freezeRequests, workouts, logWorkout, nutritionAssessments, messages, sendMessage, markAsRead, members } = useData();
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  const handleSimulateScan = async () => {
    if (!currentUser) return;
    try {
      await registerAttendance(currentUser.code);
      setScanStatus("success");
      setTimeout(() => setScanStatus("idle"), 3000);
    } catch (err: any) {
      setScanStatus("error");
      setTimeout(() => setScanStatus("idle"), 3000);
    }
  };

  const renderContent = () => {
    switch (pageId) {
      case "qr-scanner":
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
                        value={currentUser?.code || "INZAN"}
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

      case "request-freeze":
        return (
          <div className="flex flex-col gap-6">
            <div className="bg-[#FFB800]/10 border border-[#FFB800]/20 p-5 rounded-2xl">
              <p className="text-[#FFB800] text-xs font-bold uppercase tracking-[0.2em] mb-2">
                Protocol Note
              </p>
              <p className="text-gray-300 text-[11px] leading-relaxed italic font-bold uppercase">
                Freeze requests require 7 days notice. Maximum freeze duration
                is 30 days per cycle.
              </p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await submitFreezeRequest(
                    formData.get("startDate") as string,
                    formData.get("endDate") as string,
                    formData.get("reason") as string
                  );
                  (e.target as HTMLFormElement).reset();
                } catch (err: any) {
                  alert(err.message);
                }
              }}
              className="space-y-4 font-bold"
            >
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">
                  START DATE
                </label>
                <input
                  name="startDate"
                  type="date"
                  required
                  className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white outline-none focus:border-[#FFB800]/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">
                  END DATE
                </label>
                <input
                  name="endDate"
                  type="date"
                  required
                  className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white outline-none focus:border-[#FFB800]/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">
                  RATIONALE
                </label>
                <textarea
                  name="reason"
                  placeholder="Specify reason for membership suspension..."
                  className="bg-white/5 border border-white/10 rounded-xl p-4 w-full text-white outline-none h-32 focus:border-[#FFB800]/50 transition-colors resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-[#FFB800] text-black font-black uppercase tracking-[0.3em] text-[10px] py-5 rounded-2xl hover:bg-white transition-all shadow-2xl shadow-[#FFB800]/20"
              >
                Transmit Request
              </button>
            </form>

            {/* Freeze Request History */}
            {freezeRequests.filter(fr => fr.member_id === currentUser?.id).length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/5">
                <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">
                  Request History
                </h3>
                <div className="space-y-3">
                  {freezeRequests
                    .filter(fr => fr.member_id === currentUser?.id)
                    .map((fr) => (
                      <div key={fr.id} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white text-[11px] font-black uppercase tracking-widest">
                            {new Date(fr.start_date).toLocaleDateString()} — {new Date(fr.end_date).toLocaleDateString()}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                            fr.status === 'approved' ? 'bg-emerald-500/20 text-emerald-500' :
                            fr.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                            'bg-[#FFB800]/10 text-[#FFB800]'
                          }`}>
                            {fr.status}
                          </span>
                        </div>
                        {fr.reason && (
                          <p className="text-[10px] text-gray-500 italic">{fr.reason}</p>
                        )}
                        {fr.admin_notes && (
                          <p className="text-[10px] text-[#FFB800]/60 italic mt-1">Admin: {fr.admin_notes}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        );

      case "daily-schedule":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1 mb-2">
              <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                Active Sessions (Today)
              </h3>
              <span className="text-[9px] text-[#FFB800] font-black uppercase tracking-widest">
                3 Classes
              </span>
            </div>
            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 group cursor-pointer hover:border-[#FFB800]/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] text-[#FFB800] font-black uppercase tracking-[0.3em]">
                  Open
                </span>
              </div>
              <p className="text-[#FFB800] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                08:00 AM
              </p>
              <h4 className="font-heading text-xl mb-1 text-white uppercase tracking-tight">
                Morning HIIT
              </h4>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                Coach Alex • 12/20 Booked
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-3xl border border-white/10 group cursor-pointer hover:border-[#FFB800]/30 transition-all relative overflow-hidden">
              <p className="text-[#FFB800] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                10:00 AM
              </p>
              <h4 className="font-heading text-xl mb-1 text-white uppercase tracking-tight">
                Powerlifting
              </h4>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                Coach Sarah • 8/12 Booked
              </p>
            </div>
          </div>
        );

      case "packages":
        return (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] mb-8 relative overflow-hidden group hover:border-[#FFB800]/30 transition-all shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB800]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10">
                <Ticket size={16} className="text-[#FFB800]" />
                Have a Promo or Referral Code?
              </h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 relative z-10">Enter it before selecting a package to apply your discount.</p>
              <div className="flex gap-2 relative z-10">
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-black uppercase tracking-widest focus:outline-none focus:border-[#FFB800]/50 transition-colors"
                />
              </div>
            </div>

            <h3 className="text-xl font-heading text-white tracking-widest uppercase mb-4">Membership Tiers</h3>
            {membershipTiers.map((tier) => (
              <div key={tier.id} className={`p-6 bg-gradient-to-br from-white/5 via-black to-black rounded-[2.5rem] border ${tier.name.includes("Premium") ? "border-[#FFB800]/50 shadow-[#FFB800]/20" : "border-white/10"} relative overflow-hidden group shadow-2xl`}>
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                  <span className={`text-[8px] font-black uppercase tracking-[0.5em] italic ${tier.name.includes("Premium") ? "text-[#FFB800]" : "text-white"}`}>
                    {tier.billing_cycle}
                  </span>
                </div>
                <h4 className={`font-heading text-2xl mb-2 uppercase tracking-tight ${tier.name.includes("Premium") ? "text-[#FFB800]" : "text-white"}`}>
                  {tier.name}
                </h4>
                <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-6 border-b border-white/5 pb-4 h-12">
                  {typeof tier.features === 'string' ? tier.features : (tier.features as string[]).join(' + ')}
                </p>
                <div className="flex items-baseline gap-2 mb-8">
                  <p className="font-heading text-4xl text-white tracking-widest">
                    {tier.price}
                  </p>
                  <span className="text-xs text-gray-500 font-black tracking-widest italic">
                    EGP
                  </span>
                </div>
                <button
                  onClick={() => checkoutPay("membership", tier.id, promoCodeInput)}
                  className={`w-full text-black font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl shadow-2xl hover:scale-[1.02] transition-transform ${tier.name.includes("Premium") ? "bg-[#FFB800] shadow-[#FFB800]/20" : "bg-white"}`}>
                  Authorize Enrollment
                </button>
              </div>
            ))}

            <h3 className="text-xl font-heading text-white tracking-widest uppercase mb-4 mt-12 pt-8 border-t border-white/5">PT & Class Packages</h3>
            <div className="space-y-12 pb-20">
              {Array.from(new Set(packageOfferings.map(o => o.category))).map(category => (
                <div key={category} className="space-y-8">
                  <h4 className="text-sm font-black text-[#FFB800] uppercase tracking-[0.3em] pl-4 border-l-2 border-[#FFB800] py-1 bg-gradient-to-r from-[#FFB800]/5 to-transparent">
                    {category}
                  </h4>
                  {Array.from(new Set(packageOfferings.filter(o => o.category === category).map(o => o.sub_category))).map(subCat => (
                    <div key={subCat || 'Standard'} className="space-y-4">
                      {subCat && subCat !== 'Standard' && (
                        <p className="text-[10px] text-white/20 uppercase font-black tracking-widest ml-1 flex items-center gap-2">
                          <span className="w-4 h-[1px] bg-white/10" /> {subCat}
                        </p>
                      )}
                      <div className="grid grid-cols-1 gap-4">
                        {packageOfferings
                          .filter(o => o.category === category && o.sub_category === subCat)
                          .map((pkg) => (
                            <div key={pkg.id} className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl group hover:border-[#FFB800]/30 transition-all">
                              <div className="flex justify-between items-start mb-6">
                                <div>
                                  <h4 className="font-bold text-white text-lg tracking-tight uppercase tracking-widest leading-none mb-2">{pkg.name}</h4>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                                    {pkg.total_sessions} Units • {pkg.session_type.replace('_', ' ')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-heading text-[#FFB800] leading-none mb-1">
                                    {(currentUser?.membershipStatus === 'active' || !pkg.price_outsider)
                                      ? pkg.price_member
                                      : pkg.price_outsider}
                                  </p>
                                  <p className="text-[8px] text-gray-600 font-black tracking-widest uppercase">EGP</p>
                                </div>
                              </div>
                              <button
                                onClick={() => checkoutPay("package", pkg.id, promoCodeInput)}
                                className="w-full py-4 bg-white/5 hover:bg-[#FFB800] hover:text-black border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                              >
                                <Ticket size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                Purchase Units
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case "nutrition": {
        const assessments = nutritionAssessments
          .filter(a => a.member_id === currentUser?.id)
          .sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime())
          .map(a => ({
            ...a,
            formattedDate: new Date(a.assessment_date).toLocaleDateString([], { month: 'short', day: 'numeric' })
          }));

        const latestAssessment = assessments[assessments.length - 1];

        return (
          <div className="space-y-8">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h4 className="font-black text-emerald-500 text-[10px] uppercase tracking-[0.4em] mb-4">
                Calculated Daily Target
              </h4>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-heading text-white tracking-widest">
                  {latestAssessment?.daily_calories_target || 2400}
                </span>
                <span className="text-xs text-emerald-500/60 font-black tracking-widest uppercase italic">
                  KCAL
                </span>
              </div>
              <p className="text-[10px] text-white/40 font-black tracking-[0.2em] uppercase underline decoration-emerald-500/20">
                {latestAssessment?.protein_grams || 180}G PROTEIN • {latestAssessment?.carbs_grams || 220}G CARBS • {latestAssessment?.fats_grams || 80}G FATS
              </p>
            </div>

            {assessments.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1 font-bold flex items-center gap-2">
                  <TrendingUp size={12} className="text-[#FFB800]" /> Body Composition History
                </h3>
                <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={assessments}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="formattedDate" 
                        stroke="rgba(255,255,255,0.2)" 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.2)" 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }}
                        tickLine={false}
                        axisLine={false}
                        width={30}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="weight_kg" name="Weight (kg)" stroke="#FFB800" strokeWidth={3} dot={{ r: 4, fill: '#111', stroke: '#FFB800', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="body_fat_pct" name="Body Fat %" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#111', stroke: '#ef4444', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="muscle_mass_kg" name="Muscle (kg)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#111', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-heading text-[#FFB800]">{latestAssessment?.weight_kg || '-'}</span>
                    <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-1">Weight kg</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-heading text-emerald-500">{latestAssessment?.muscle_mass_kg || '-'}</span>
                    <span className="text-[8px] text-emerald-500/60 uppercase font-black tracking-widest mt-1">Muscle kg</span>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-heading text-red-500">{latestAssessment?.body_fat_pct || '-'}</span>
                    <span className="text-[8px] text-red-500/60 uppercase font-black tracking-widest mt-1">Fat %</span>
                  </div>
                </div>
              </div>
            ) : (
                <div className="p-10 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-50">
                  <Info size={40} className="text-white/20 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">No assessments found.<br/>Book a session with a nutritionist.</p>
                </div>
            )}
          </div>
        );
      }

      case "invitations":
        return (
          <div className="flex flex-col gap-8">
            <div className="bg-gradient-to-br from-[#FFB800] to-[#b38100] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform">
                <Ticket size={80} className="rotate-12" />
              </div>
              <p className="text-black font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                Invitation Balance
              </p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-6xl font-heading text-black tracking-tighter">
                  {currentUser?.invitationsBalance || 0}
                </h3>
                <span className="text-black font-black uppercase tracking-widest text-xs italic">
                  Remaining
                </span>
              </div>
              <p className="mt-4 text-black/60 text-[10px] uppercase font-black tracking-widest leading-relaxed">
                Yearly Allocation: 14 Units <br />
                Status: {(currentUser?.invitationsBalance || 0) > 0 ? "Authorized" : "Depleted"}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <UserPlus size={16} className="text-[#FFB800]" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">
                  Register Invitee
                </h3>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  try {
                    await createInvitation({
                      guest_name: formData.get("name") as string,
                      guest_email: formData.get("email") as string,
                      guest_phone: formData.get("phone") as string,
                      visit_date: formData.get("date") as string,
                    });
                    (e.target as HTMLFormElement).reset();
                  } catch (err: any) {
                    console.error(err);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-1">Guest Name</label>
                    <input
                      name="name"
                      required
                      placeholder="Enter guest's full name"
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm outline-none focus:border-[#FFB800]/50 transition-all font-bold placeholder:text-white/10 uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-1">Visit Date</label>
                    <input
                      name="date"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm outline-none focus:border-[#FFB800]/50 transition-all font-bold uppercase color-scheme-dark"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest ml-1">Guest Contact (Optional)</label>
                    <input
                      name="phone"
                      placeholder="Phone Number"
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm outline-none focus:border-[#FFB800]/50 transition-all font-bold placeholder:text-white/10 uppercase"
                    />
                  </div>
                </div>
                <button
                  disabled={(currentUser?.invitationsBalance || 0) <= 0}
                  className="w-full bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] py-5 rounded-2xl shadow-2xl hover:bg-[#FFB800] transition-all disabled:opacity-30 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                >
                  <Ticket size={16} className="group-hover:rotate-12 transition-transform" />
                  Issue Access Token
                </button>
              </form>
            </div>

            {invitations.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-white/5">
                <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">
                  Issuance Logs
                </h3>
                <div className="space-y-3">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center group">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FFB800]/60 group-hover:text-[#FFB800] transition-colors">
                          <Ticket size={18} />
                        </div>
                        <div>
                          <p className="text-white text-[11px] font-black uppercase tracking-widest">{inv.guest_name}</p>
                          <p className="text-gray-500 text-[9px] uppercase font-bold italic tracking-wider mt-0.5">
                            {inv.visit_date}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${inv.status === 'used' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-[#FFB800]/10 text-[#FFB800]'}`}>
                        {inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "attendance": {
        const myLogs = attendanceLogs.filter(log => log.member_id === currentUser?.id);
        const today = new Date().toDateString();
        const todayCount = myLogs.filter(log => new Date(log.checked_in_at).toDateString() === today).length;
        
        // Calculate streak
        let streak = 0;
        const uniqueDays = [...new Set<string>(myLogs.map(log => new Date(log.checked_in_at).toDateString()))];
        const sortedDays = uniqueDays.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        for (let i = 0; i < sortedDays.length; i++) {
          const expected = new Date();
          expected.setDate(expected.getDate() - i);
          if (sortedDays[i] === expected.toDateString()) {
            streak++;
          } else {
            break;
          }
        }

        // Group logs by date
        const grouped: Record<string, typeof myLogs> = {};
        myLogs.forEach(log => {
          const dateKey = new Date(log.checked_in_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(log);
        });

        return (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-heading text-white italic">{myLogs.length}</p>
                <p className="text-[8px] text-white/30 font-black uppercase tracking-widest mt-1">Total</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-heading text-emerald-500 italic">{streak}</p>
                <p className="text-[8px] text-emerald-500/60 font-black uppercase tracking-widest mt-1">Streak</p>
              </div>
              <div className="bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-heading text-[#FFB800] italic">{todayCount}</p>
                <p className="text-[8px] text-[#FFB800]/60 font-black uppercase tracking-widest mt-1">Today</p>
              </div>
            </div>

            {/* Log History */}
            <div className="space-y-4">
              <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">
                Check-In History
              </h3>
              {Object.keys(grouped).length === 0 ? (
                <div className="p-8 text-center text-white/20">
                  <Clock size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No check-ins yet</p>
                </div>
              ) : (
                Object.entries(grouped).map(([date, logs]) => (
                  <div key={date} className="space-y-2">
                    <p className="text-[9px] text-[#FFB800] font-black uppercase tracking-[0.3em] px-1">{date}</p>
                    {logs.map(log => (
                      <div key={log.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          </div>
                          <span className="text-white text-[11px] font-bold uppercase tracking-widest">
                            {new Date(log.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">
                          {log.checked_in_by === 'admin' ? 'ADMIN' : 'SELF'}
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      case "messages":
        return <MessagesPanel currentUser={currentUser} messages={messages} sendMessage={sendMessage} markAsRead={markAsRead} staff={members.filter(m => m.role === 'admin' || m.role === 'coach' || m.role === 'nutritionist')} />;

      case "workouts":
        return <WorkoutsPanel workouts={workouts.filter(w => w.member_id === currentUser?.id)} logWorkout={logWorkout} />;

      case "workouts":
        return <WorkoutsPanel workouts={workouts.filter((w: any) => w.member_id === currentUser?.id)} logWorkout={logWorkout} />;

      case "library":
        return (
          <React.Suspense fallback={<div className="p-10 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#FFB800] border-t-transparent mx-auto rounded-full"/></div>}>
            <ContentLibraryView />
          </React.Suspense>
        );

      case "events-offers":
        return (
          <React.Suspense fallback={<div className="p-10 text-center"><div className="animate-spin w-8 h-8 border-2 border-[#FFB800] border-t-transparent mx-auto rounded-full"/></div>}>
            <EventsOffersView />
          </React.Suspense>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 opacity-40">
            <Info size={40} className="text-gray-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Protocol data pending initialization.
            </p>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      "qr-scanner": "Identity Portal",
      "request-freeze": "Protocol Freeze",
      "daily-schedule": "Temporal Matrix",
      packages: "Service Units",
      nutrition: "Kinetic Fuel",
      attendance: "Session Logs",
      billing: "Financial Ledger",
      trainers: "Unit Instructors",
      "events-offers": "Special Ops",
      about: "Facility Origin",
      contact: "Direct Uplink",
      notifications: "Comms Feed",
      invitations: "Guest Access",
      workouts: "Physical Logs",
      messages: "Direct Comms",
      library: "Content Library",
    };
    return titles[pageId || ""] || "Unknown Protocol";
  };

  return (
    <div className="h-[100dvh] bg-[#050505] text-white font-sans flex flex-col max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="flex items-center gap-4 p-6 pt-12 relative z-10 border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-xl font-heading uppercase tracking-tight text-white">
            {getPageTitle()}
          </h2>
          <p className="text-[8px] text-[#FFB800] font-black uppercase tracking-[0.3em] italic">
            Sub-Protocol Active
          </p>
        </div>
      </header>

      <main className="content-fit p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden min-h-[500px]"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB800]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
}

function WorkoutsPanel({ workouts, logWorkout }: { workouts: any[], logWorkout: any }) {
  const [isLogging, setIsLogging] = React.useState(false);
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = React.useState("");
  const [exercises, setExercises] = React.useState([{ id: Date.now(), exercise_name: "", sets: 0, reps: 0, weight: 0, completed: true }]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddExercise = () => {
    setExercises([...exercises, { id: Date.now(), exercise_name: "", sets: 0, reps: 0, weight: 0, completed: true }]);
  };

  const handleRemoveExercise = (id: number) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleUpdateExercise = (id: number, field: string, value: any) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cleanExercises = exercises.filter(ex => ex.exercise_name.trim() !== "").map(ex => ({
        exercise_name: ex.exercise_name,
        sets: Number(ex.sets),
        reps: Number(ex.reps),
        weight: Number(ex.weight),
        completed: ex.completed
      }));
      await logWorkout(date, notes, cleanExercises);
      setIsLogging(false);
      setNotes("");
      setExercises([{ id: Date.now(), exercise_name: "", sets: 0, reps: 0, weight: 0, completed: true }]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLogging) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-heading text-white uppercase italic">Log Workout</h3>
          <button type="button" onClick={() => setIsLogging(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm outline-none focus:border-[#FFB800]/50 transition-all font-bold uppercase color-scheme-dark" />
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1 flex justify-between items-center">
              <span>Exercises</span>
              <button type="button" onClick={handleAddExercise} className="text-[#FFB800] flex items-center gap-1 hover:text-white transition-colors">
                <Plus size={12} /> Add
              </button>
            </label>
            
            {exercises.map((ex, idx) => (
              <div key={ex.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 relative group">
                <button type="button" onClick={() => handleRemoveExercise(ex.id)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <X size={10} />
                </button>
                <input type="text" placeholder="Exercise Name (e.g. Bench Press)" value={ex.exercise_name} onChange={(e) => handleUpdateExercise(ex.id, "exercise_name", e.target.value)} required className="w-full bg-black/20 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-[#FFB800]/50 transition-all font-bold placeholder:text-white/20 uppercase" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 uppercase font-black tracking-widest pl-1">Sets</label>
                    <input type="number" min="0" value={ex.sets} onChange={(e) => handleUpdateExercise(ex.id, "sets", e.target.value)} className="w-full bg-black/20 border border-white/5 p-3 rounded-xl text-xs text-center outline-none focus:border-[#FFB800]/50 transition-all font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 uppercase font-black tracking-widest pl-1">Reps</label>
                    <input type="number" min="0" value={ex.reps} onChange={(e) => handleUpdateExercise(ex.id, "reps", e.target.value)} className="w-full bg-black/20 border border-white/5 p-3 rounded-xl text-xs text-center outline-none focus:border-[#FFB800]/50 transition-all font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 uppercase font-black tracking-widest pl-1">Weight</label>
                    <input type="number" min="0" step="0.5" value={ex.weight} onChange={(e) => handleUpdateExercise(ex.id, "weight", e.target.value)} className="w-full bg-black/20 border border-white/5 p-3 rounded-xl text-xs text-center outline-none focus:border-[#FFB800]/50 transition-all font-bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Notes (Optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel?" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm outline-none focus:border-[#FFB800]/50 h-24 resize-none transition-all font-bold placeholder:text-white/10" />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#FFB800] text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-2xl hover:bg-white transition-all flex items-center justify-center gap-2">
          {isSubmitting ? "Saving..." : <><Save size={16} /> Save Session</>}
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => setIsLogging(true)} className="w-full py-5 bg-white/5 border border-white/10 text-[#FFB800] font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl hover:bg-[#FFB800] hover:text-black transition-all flex items-center justify-center gap-3 group border-dashed">
        <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Start New Workout
      </button>

      {workouts.length === 0 ? (
        <div className="p-10 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-50">
          <Dumbbell size={48} className="text-white/20 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-center">No workouts logged yet. Time to lift!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">Training History</h3>
          <div className="space-y-4">
            {workouts.map((w: any) => (
              <div key={w.id} className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFB800]/10 flex items-center justify-center">
                      <Dumbbell size={18} className="text-[#FFB800]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm tracking-widest uppercase">{new Date(w.date).toLocaleDateString()}</p>
                      <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest">{w.exercises?.length || 0} Exercises</p>
                    </div>
                  </div>
                </div>
                {w.exercises && w.exercises.length > 0 && (
                  <div className="space-y-2">
                    {w.exercises.map((ex: any) => (
                      <div key={ex.id} className="flex justify-between items-center bg-black/20 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/80">{ex.exercise_name}</span>
                        <span className="text-[#FFB800]">
                          {ex.sets}x{ex.reps} @ {ex.weight}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {w.notes && (
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest italic pt-2 border-t border-white/5">
                    "{w.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProtocolItem({ number, label, desc }: any) {
  return (
    <div className="flex gap-6 group">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-[#FFB800] font-heading group-hover:bg-[#FFB800] group-hover:text-black transition-all">
          {number}
        </div>
        <div className="w-px flex-1 bg-white/5 my-2" />
      </div>
      <div className="pb-8">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white group-hover:text-[#FFB800] transition-colors mb-2">
          {label}
        </h4>
        <p className="text-[10px] text-gray-400 font-bold italic line-clamp-2 uppercase tracking-widest">
          {desc}
        </p>
      </div>
    </div>
  );
}

function MessagesPanel({ currentUser, messages, sendMessage, markAsRead, staff }: any) {
  const [selectedStaffId, setSelectedStaffId] = React.useState(staff[0]?.id || "");
  const [content, setContent] = React.useState("");

  React.useEffect(() => {
    if (staff.length > 0 && !selectedStaffId) {
      setSelectedStaffId(staff[0].id);
    }
  }, [staff, selectedStaffId]);

  const conversation = messages.filter((m: any) => 
    (m.sender_id === currentUser?.id && m.receiver_id === selectedStaffId) ||
    (m.receiver_id === currentUser?.id && m.sender_id === selectedStaffId)
  ).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedStaffId) return;
    await sendMessage(selectedStaffId, content.trim());
    setContent("");
  };

  React.useEffect(() => {
    // Mark incoming messages as read
    conversation.forEach((m: any) => {
      if (m.receiver_id === currentUser?.id && !m.read_at) {
        markAsRead(m.id);
      }
    });
  }, [conversation, currentUser, markAsRead]);

  return (
    <div className="flex flex-col h-[600px] border border-white/10 rounded-3xl overflow-hidden bg-black/40">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest pl-1">Select Staff Member</label>
        <select 
          value={selectedStaffId} 
          onChange={(e) => setSelectedStaffId(e.target.value)}
          className="w-full mt-2 bg-black border border-white/10 p-3 rounded-xl text-white outline-none focus:border-[#FFB800]/50 transition-colors uppercase tracking-widest text-xs font-bold"
        >
          {staff.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <MessageSquare size={48} className="mb-4" />
            <p className="text-[10px] uppercase font-black tracking-widest text-center">No messages yet.<br/>Start the transmission.</p>
          </div>
        ) : (
          conversation.map((msg: any) => {
            const isMe = msg.sender_id === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${isMe ? 'bg-[#FFB800] text-black rounded-br-none' : 'bg-white/10 text-white rounded-bl-none border border-white/10'}`}>
                  <p className={`text-sm font-bold ${isMe ? '' : 'text-white'}`}>{msg.content}</p>
                  <p className={`text-[8px] uppercase tracking-widest mt-2 font-black opacity-60 ${isMe ? 'text-black' : 'text-white/50'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && msg.read_at && ' • READ'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
        <input 
          type="text" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter message..." 
          className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#FFB800]/50 transition-colors"
        />
        <button type="submit" disabled={!content.trim()} className="w-12 h-12 bg-[#FFB800] text-black rounded-xl flex items-center justify-center disabled:opacity-50 transition-all hover:bg-white active:scale-95">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
