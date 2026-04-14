import React from "react";
import { Ticket, UserPlus } from "lucide-react";

interface InvitationsViewProps {
  currentUser: any;
  invitations: any[];
  createInvitation: (data: any) => Promise<void>;
}

export default function InvitationsView({ currentUser, invitations, createInvitation }: InvitationsViewProps) {
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
}
