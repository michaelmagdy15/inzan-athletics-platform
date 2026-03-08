import React from "react";
import { useData } from "../context/DataContext";
import { Clock, CheckCircle2, AlertTriangle, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

/**
 * @feature {
 *   "role": "kitchen",
 *   "title": "Kitchen Display System (KDS)",
 *   "description": "The real-time order management interface for Inzan Athletics kitchen staff.",
 *   "steps": [
 *     "1. Monitor incoming food and drink orders.",
 *     "2. Mark orders as 'Ready' to notify students.",
 *     "3. Track order history for the current shift."
 *   ]
 * }
 */
export default function KDSApp() {
    const { orders, updateOrderStatus } = useData();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    const activeOrders = orders.filter(
        (o) => o.status === "pending" || o.status === "preparing",
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col p-6 gap-6 font-sans">
            <header className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4">
                <div>
                    <h1 className="text-xl font-heading tracking-widest uppercase text-white">
                        EK Kitchen
                    </h1>
                    <p className="text-[10px] text-gold tracking-[0.3em] font-bold uppercase">
                        Display System
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase">
                        {activeOrders.length} Active Tickets
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/10 transition-colors"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max overflow-y-auto">
                {activeOrders.map((order) => (
                    <div
                        key={order.id}
                        className={`border rounded-2xl p-5 flex flex-col justify-between transition-colors ${order.status === "pending"
                            ? "bg-amber-500/10 border-amber-500/30"
                            : "bg-blue-500/10 border-blue-500/30"
                            }`}
                    >
                        <div>
                            <div className="flex justify-between items-start border-b border-white/10 pb-3 mb-4">
                                <div>
                                    <p className="text-xl font-bold">
                                        Order #{order.id.slice(0, 4)}
                                    </p>
                                    <p className="text-[10px] text-white/50 tracking-widest uppercase mt-1">
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {order.status === "pending" ? (
                                    <AlertTriangle className="text-amber-500" size={20} />
                                ) : (
                                    <Clock className="text-blue-400" size={20} />
                                )}
                            </div>
                            <ul className="flex flex-col gap-2 mb-6">
                                {order.items?.map((item: any, idx: number) => (
                                    <li key={idx} className="flex justify-between text-sm">
                                        <span className="font-semibold text-white">
                                            {item.quantity}x {item.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {order.status === "pending" ? (
                            <button
                                onClick={() => updateOrderStatus(order.id, "preparing")}
                                className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold tracking-widest uppercase text-xs"
                            >
                                Mark Preparing
                            </button>
                        ) : (
                            <button
                                onClick={() => updateOrderStatus(order.id, "ready")}
                                className="w-full py-4 rounded-xl bg-emerald-500 text-black font-bold tracking-widest uppercase text-xs"
                            >
                                Mark Ready
                            </button>
                        )}
                    </div>
                ))}
                {activeOrders.length === 0 && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-white/20 border border-white/5 rounded-3xl bg-white/[0.02]">
                        <CheckCircle2 size={48} className="mb-4 text-emerald-500/50" />
                        <h2 className="text-xl font-heading tracking-widest uppercase">All Caught Up</h2>
                        <p className="text-xs">No active orders in queue.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
