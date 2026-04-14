import React from "react";
import { Ticket } from "lucide-react";

interface MembershipPackagesViewProps {
  currentUser: any;
  membershipTiers: any[];
  packageOfferings: any[];
  checkoutPay: (type: string, id: string, promoCode: string) => Promise<void>;
  promoCodeInput: string;
  setPromoCodeInput: (val: string) => void;
}

export default function MembershipPackagesView({
  currentUser,
  membershipTiers,
  packageOfferings,
  checkoutPay,
  promoCodeInput,
  setPromoCodeInput
}: MembershipPackagesViewProps) {
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
        {Array.from(new Set<string>(packageOfferings.map((o: any) => o.category))).map((category: string) => (
          <div key={category} className="space-y-8">
            <h4 className="text-sm font-black text-[#FFB800] uppercase tracking-[0.3em] pl-4 border-l-2 border-[#FFB800] py-1 bg-gradient-to-r from-[#FFB800]/5 to-transparent">
              {category}
            </h4>
            {Array.from(new Set<string>(packageOfferings.filter((o: any) => o.category === category).map((o: any) => o.sub_category))).map((subCat: string) => (
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
}
