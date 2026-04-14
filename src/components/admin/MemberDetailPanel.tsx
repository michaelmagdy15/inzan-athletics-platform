import { motion } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { useData, Member } from "../../context/DataContext";

interface Props {
  member: Member;
  onClose: () => void;
  onMemberUpdated: (member: Member) => void;
}

export default function MemberDetailPanel({ member, onClose, onMemberUpdated }: Props) {
  const {
    updateMemberRole,
    updateMemberStatus,
    deleteMember,
    renewMembership,
    resetUserPassword,
    assignMembership,
    membershipTiers,
    setSystemAlert,
  } = useData();

  return (
    <>
      {/* Mobile Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed lg:static inset-x-4 top-24 bottom-4 z-50 lg:z-auto w-auto lg:w-80 glass-card rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 shrink-0 h-[calc(100vh-8rem)] lg:h-fit lg:sticky lg:top-0 shadow-2xl overflow-y-auto scrollbar-hide bg-[#050505]/95 lg:bg-transparent border border-white/10"
      >
        <div className="flex flex-col gap-6 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] text-gold tracking-[0.4em] uppercase font-bold">
              Entity Registry
            </h3>
            <button
              onClick={onClose}
              className="text-white/20 hover:text-white transition-colors bg-white/5 lg:bg-transparent p-2 lg:p-0 rounded-full"
            >
              <X size={16} className="lg:w-[14px] lg:h-[14px]" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gold rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <img
                src={member.avatar}
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-[2rem] border-2 border-white/10 object-cover shadow-2xl relative z-10"
                alt=""
              />
            </div>
            <div className="text-center w-full">
              <h2 className="text-xl lg:text-2xl font-heading tracking-tight mb-2">
                {member.name}
              </h2>
              <div className="relative group inline-block">
                <select
                  value={member.role}
                  disabled={member.email === "michaelmitry13@gmail.com"}
                  onChange={async (e) => {
                    try {
                      await updateMemberRole(member.id, e.target.value as Member["role"]);
                      onMemberUpdated({ ...member, role: e.target.value as Member["role"] });
                    } catch (err: any) {
                      setSystemAlert({ message: err.message, type: "error" });
                    }
                  }}
                  className={`appearance-none bg-gold/10 border border-gold/20 text-[9px] text-gold font-bold uppercase tracking-widest rounded-full px-4 py-1.5 pr-8 focus:outline-none focus:border-gold/50 cursor-pointer transition-all hover:bg-gold/20 ${member.email === "michaelmitry13@gmail.com" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="member" className="bg-[#050505]">MEMBER</option>
                  <option value="coach" className="bg-[#050505]">COACH</option>
                  <option value="nutritionist" className="bg-[#050505]">NUTRITIONIST</option>
                  <option value="admin" className="bg-[#050505]">ADMIN</option>
                </select>
                <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gold/50 group-hover:text-gold rotate-90 transition-colors pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-black/20 p-5 lg:p-6 rounded-3xl border border-white/5">
          <div className="flex justify-between items-center group cursor-help">
            <span className="text-[9px] text-white/30 uppercase tracking-widest group-hover:text-white/50 transition-colors">
              Endpoint
            </span>
            <span className="text-[10px] lg:text-[11px] text-white font-medium truncate max-w-[120px]">
              {member.email}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-white/30 uppercase tracking-widest">Performance</span>
            <span className="text-[10px] lg:text-[11px] text-gold font-bold">{member.strain}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-white/30 uppercase tracking-widest">Readiness</span>
            <span className="text-[10px] lg:text-[11px] text-emerald-400 font-bold">{member.recovery}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-[9px] text-white/30 tracking-[0.3em] uppercase font-bold">
            Assign Membership
          </h4>
          <select
            onChange={async (e) => {
              if (e.target.value) {
                try {
                  await assignMembership(member.id, e.target.value);
                  e.target.value = "";
                } catch (err: any) {
                  setSystemAlert({ message: err.message, type: "error" });
                }
              }
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest text-white outline-none cursor-pointer focus:border-gold/30 transition-all"
          >
            <option value="" className="bg-[#050505] text-white/50">SELECT TIER</option>
            {membershipTiers.map((t: any) => (
              <option key={t.id} value={t.id} className="bg-[#050505]">
                {t.name} ({t.price} EGP)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h4 className="text-[9px] text-gold tracking-[0.3em] uppercase mb-4 font-bold opacity-60">
            Neural Insights
          </h4>
          <div className="p-4 lg:p-5 bg-gold/5 border border-gold/10 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gold/10 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <p className="text-[10px] text-white/60 leading-relaxed italic relative z-10">
              Member demonstrating peak performance levels. Strategy maintenance advised.
            </p>
            <button
              onClick={async () => {
                try {
                  await resetUserPassword(member.email);
                } catch (err: any) {
                  setSystemAlert({ message: err.message, type: "error" });
                }
              }}
              className="premium-button w-full py-3 rounded-xl mt-4 lg:mt-6 group/btn overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
              <span className="text-[10px] font-black tracking-widest uppercase text-black relative z-10">
                Reset Password
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          <button
            onClick={async () => {
              try {
                await renewMembership(member.id);
              } catch (err: any) {
                setSystemAlert({ message: err.message, type: "error" });
              }
            }}
            className="w-full py-3.5 lg:py-4 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all font-bold"
          >
            Renew Membership
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={async () => {
                try {
                  await updateMemberStatus(
                    member.id,
                    member.membershipStatus === "active" ? "suspended" : "active",
                  );
                } catch (err: any) {
                  setSystemAlert({ message: err.message, type: "error" });
                }
              }}
              className={`py-3 lg:py-3.5 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all font-bold ${member.membershipStatus === "active" ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20" : "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"}`}
            >
              {member.membershipStatus === "active" ? "Suspend" : "Activate"}
            </button>
            {member.email !== "michaelmitry13@gmail.com" && (
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to purge this entity?")) {
                    try {
                      await deleteMember(member.id);
                      onClose();
                    } catch (err: any) {
                      setSystemAlert({ message: err.message, type: "error" });
                    }
                  }
                }}
                className="py-3 lg:py-3.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all font-bold"
              >
                Purge Entity
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
