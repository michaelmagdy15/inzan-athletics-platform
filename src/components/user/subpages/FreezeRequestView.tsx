import React from "react";

interface FreezeRequestViewProps {
  currentUser: any;
  submitFreezeRequest: (startDate: string, endDate: string, reason: string) => Promise<void>;
  freezeRequests: any[];
}

export default function FreezeRequestView({ currentUser, submitFreezeRequest, freezeRequests }: FreezeRequestViewProps) {
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
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${fr.status === 'approved' ? 'bg-emerald-500/20 text-emerald-500' :
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
}
