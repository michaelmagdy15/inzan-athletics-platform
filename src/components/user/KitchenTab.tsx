import React, { useMemo, useState } from "react";
import { Bell, Clock, Zap } from "lucide-react";
import { useData } from "../../context/DataContext";

export default function KitchenTab() {
  const { kitchenItems, placeOrder, orders } = useData();
  const [toast, setToast] = useState<string | null>(null);

  // Optimized: Memoize filtered items
  const shakes = useMemo(
    () => kitchenItems.filter((item) => item.category === "shake"),
    [kitchenItems],
  );
  const meals = useMemo(
    () => kitchenItems.filter((item) => item.category === "meal"),
    [kitchenItems],
  );

  const handlePlaceOrder = async (item: any) => {
    try {
      await placeOrder(
        [{ id: item.id, quantity: 1, name: item.name }],
        item.price,
      );
      setToast(`Order placed: ${item.name}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast(`Failed: ${err.message}`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="p-6 pt-12 flex flex-col gap-8 pb-32">
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#FFB800] text-black px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl animate-bounce">
          {toast}
        </div>
      )}
      <header className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-light tracking-tight">EK Kitchen</h2>
        <button className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell size={18} />
        </button>
      </header>

      <div className="bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB800]/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <h3 className="text-lg font-medium tracking-tight mb-2 relative z-10 text-[#FFB800]">
          Skip the Line
        </h3>
        <p className="text-sm text-gray-300 mb-5 relative z-10">
          Pre-order your post-workout recovery shake. Sync active.
        </p>
        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 relative z-10">
          <Clock size={16} className="text-[#FFB800]" />
          <span className="text-xs font-medium">Auto-ordering available</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end px-1">
          <h3 className="font-medium text-lg tracking-tight">
            Post-Recovery Shakes
          </h3>
          <button className="text-[10px] text-gray-400 tracking-widest uppercase hover:text-[#FFB800] transition-colors">
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {shakes.map((item) => (
            <KitchenCard
              key={item.id}
              item={item}
              onOrder={() => handlePlaceOrder(item)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end px-1">
          <h3 className="font-medium text-lg tracking-tight">Pre-Fuel Meals</h3>
          <button className="text-[10px] text-gray-400 tracking-widest uppercase hover:text-[#FFB800] transition-colors">
            View All
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {meals.map((item) => (
            <KitchenListItem
              key={item.id}
              item={item}
              onOrder={() => handlePlaceOrder(item)}
            />
          ))}
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="flex flex-col gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl mt-4">
          <h3 className="text-[10px] font-bold text-[#FFB800] tracking-widest uppercase mb-2">
            Recent Orders ({orders.length})
          </h3>
          {orders.slice(0, 5).map((order) => {
            const statusColors: any = {
              pending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
              preparing: "text-blue-400 bg-blue-500/10 border-blue-500/20",
              ready: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
              picked_up: "text-gray-400 bg-white/5 border-white/5",
            };
            return (
              <div
                key={order.id}
                className="flex flex-col gap-2 bg-black/40 p-4 rounded-2xl border border-white/5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-bold text-white">
                      Order #{order.id.slice(0, 5).toUpperCase()}
                    </span>
                    <p className="text-xs text-white/50 mt-1">
                      {order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(", ") || "Custom Order"}
                    </p>
                  </div>
                  <span className={`text-[9px] font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-lg border ${statusColors[order.status] || statusColors.pending}`}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function KitchenCard({ item, onOrder }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden group hover:bg-white/10 transition-colors">
      <div className="h-32 relative overflow-hidden">
        <img
          src={
            item.image_url ||
            "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=400&auto=format&fit=crop"
          }
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      <div className="p-4">
        <h4 className="font-medium text-sm mb-1 truncate">{item.name}</h4>
        <p className="text-[10px] text-gray-400 mb-3 line-clamp-2">
          {item.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-mono text-[#FFB800]">
            {(item.price || 0).toFixed(2)}{" "}
            <span className="text-[10px] italic">EGP</span>
          </span>
          <button
            onClick={onOrder}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FFB800] hover:text-black transition-colors"
          >
            <Zap size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function KitchenListItem({ item, onOrder }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-3 flex gap-4 items-center group hover:bg-white/10 transition-colors">
      <img
        src={
          item.image_url ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"
        }
        alt={item.name}
        className="w-20 h-20 rounded-xl object-cover"
      />
      <div className="flex-1">
        <h4 className="font-medium text-sm mb-1">{item.name}</h4>
        <p className="text-[10px] text-gray-400 mb-2 line-clamp-1">
          {item.description}
        </p>
        <span className="text-sm font-mono text-[#FFB800]">
          {(item.price || 0).toFixed(2)}{" "}
          <span className="text-[10px] italic">EGP</span>
        </span>
      </div>
      <button
        onClick={onOrder}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FFB800] hover:text-black transition-colors shrink-0"
      >
        <Zap size={16} />
      </button>
    </div>
  );
}
