import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import {
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  Package,
  ChevronRight,
  Zap,
  Target,
  ArrowUpRight,
  Plus,
  RefreshCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBranding } from "../../context/BrandingContext";

export default function EKKitchenView() {
  const { config } = useBranding();
  const {
    kitchenItems,
    orders,
    updateOrderStatus,
    operatingGoals,
    transactions,
    broadcastAlert,
  } = useData();
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const totalSales = orders
    .filter((o) => o.status === "completed" || o.status === "picked_up")
    .reduce((acc, o) => acc + Number(o.total_price || 0), 0);

  const goalTypes = ["Daily", "Weekly", "Monthly"];
  const goals = goalTypes.map((period) => {
    const goal = operatingGoals.find(
      (g) => g.metric_name === `${period} Kitchen Goal`,
    );
    const target =
      goal?.target_value ||
      (period === "Daily" ? 5000 : period === "Weekly" ? 35000 : 150000);
    // Using total sales if no specific counter exists
    const current = goal
      ? goal.current_value
      : period === "Daily"
        ? totalSales
        : period === "Weekly"
          ? totalSales * 5
          : totalSales * 20;
    const trend = current >= target ? "HIT" : "RUNGING";
    return { label: `${period} Goal`, current, target, trend };
  });

  // Compute stock metrics based on actual catalog
  const totalCatalog = kitchenItems.length;
  const optimalStockCount = kitchenItems.filter(
    (item) => item.quantity > item.reorder_threshold,
  ).length;
  const lowStockCount = kitchenItems.filter(
    (item) => item.quantity <= item.reorder_threshold && item.quantity > 0,
  ).length;
  const restockingCount = kitchenItems.filter(
    (item) => item.quantity === 0,
  ).length;

  const opPercent =
    totalCatalog > 0 ? Math.round((optimalStockCount / totalCatalog) * 100) : 0;
  const lowPercent =
    totalCatalog > 0 ? Math.round((lowStockCount / totalCatalog) * 100) : 0;
  const outPercent =
    totalCatalog > 0 ? Math.round((restockingCount / totalCatalog) * 100) : 0;

  const getNextStatus = (current: string): any => {
    const flow = ["pending", "preparing", "ready", "picked_up"];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : current;
  };

  const handleAdvance = async (orderId: string, currentStatus: string) => {
    try {
      const next = getNextStatus(currentStatus);
      if (next !== currentStatus) {
        await updateOrderStatus(orderId, next);
        broadcastAlert(
          `Order #${orderId.slice(-4).toUpperCase()} updated to ${next.toUpperCase()}.`,
          "success",
        );
      }
    } catch (err) {
      broadcastAlert("Failed to update order status.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">
            {config.shortName} Kitchen
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">
            Kitchen Inventory
          </p>
        </div>
        <div className="flex items-center gap-3 lg:gap-4 font-bold w-full lg:w-auto">
          <button
            onClick={() =>
              broadcastAlert("Kitchen inventory status checked.", "info")
            }
            className="flex-1 lg:flex-none px-4 lg:px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-white/40 tracking-widest uppercase hover:text-white transition-all"
          >
            Inventory Check
          </button>
          <button
            onClick={() => broadcastAlert("Restock order placed.", "success")}
            className="flex-1 lg:flex-none premium-button px-4 lg:px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase text-black"
          >
            Bulk Restock
          </button>
        </div>
      </div>

      {/* Performance Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
        {goals.map((goal, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={goal.label}
            className="glass-card rounded-[2rem] lg:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 border border-white/5 relative overflow-hidden group font-bold"
          >
            <div className="flex justify-between items-center mb-4 lg:mb-6">
              <h4 className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] group-hover:text-gold transition-colors">
                {goal.label}
              </h4>
              <span className="text-[8px] font-black text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded-lg italic">
                {goal.trend}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-xl sm:text-2xl lg:text-3xl font-heading text-white">
                {goal.current.toLocaleString()}
              </span>
              <span className="text-[10px] text-white/20 font-black uppercase italic tracking-widest">
                EGP
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                className="h-full bg-gradient-to-r from-gold/50 to-gold shadow-[0_0_10px_rgba(202,138,4,0.3)]"
              />
            </div>
            <div className="flex justify-between mt-3 text-[8px] font-bold text-white/20 uppercase tracking-widest">
              <span>
                {Math.round((goal.current / goal.target) * 100)}%
              </span>
              <span>Target: {goal.target.toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
        <div className="xl:col-span-2 flex flex-col gap-6 lg:gap-10">
          {/* Inventory Registry Oversight */}
          <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
            <div className="px-6 lg:px-10 py-6 lg:py-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/20 font-bold gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-white/20" />
                  <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">
                    Inventory Overview
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 lg:gap-4">
                  {["ALL", "PROTEIN", "GREENS", "SYNC"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[8px] font-black tracking-widest uppercase transition-all ${selectedCategory === cat ? "text-gold" : "text-white/20 hover:text-white"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 hover:border-gold/30 transition-all text-white/40 hover:text-gold shrink-0">
                <Plus size={18} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-bold min-w-[500px]">
                <thead className="bg-[#0c0c0c]/50">
                  <tr>
                    <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black border-b border-white/5">
                      Item Name
                    </th>
                    <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black border-b border-white/5">
                      Category
                    </th>
                    <th className="px-10 py-6 text-[9px] text-white/20 uppercase tracking-[0.4em] font-black border-b border-white/5 text-right">
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {kitchenItems.map((item, idx) => (
                    <motion.tr
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={item.id}
                      className="hover:bg-white/[0.03] transition-all duration-500 group cursor-pointer"
                    >
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-1">
                          <span className="font-heading text-lg tracking-tight text-white group-hover:text-gold transition-colors">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-white/10 uppercase font-black tracking-widest italic">
                            {item.price} EGP / Unit
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-[10px] text-white/30 uppercase tracking-[0.2em] font-light italic">
                        {item.category}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-xl font-heading ${item.quantity <= item.reorder_threshold ? "text-red-500" : "text-white"}`}
                          >
                            {item.quantity}{" "}
                            <span className="text-[10px] text-white/20 uppercase italic ml-1">
                              {item.unit}
                            </span>
                          </span>
                          <div
                            className={`w-32 h-1 rounded-full bg-white/5 overflow-hidden`}
                          >
                            <div
                              className={`h-full ${item.quantity <= item.reorder_threshold ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-gold/40"}`}
                              style={{
                                width: `${Math.min((item.quantity / (item.reorder_threshold * 2)) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Real-time Order Stream */}
        <div className="flex flex-col gap-6 lg:gap-10">
          <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 p-6 lg:p-10 shadow-2xl h-fit font-bold">
            <div className="flex items-center justify-between mb-6 lg:mb-10">
              <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">
                Active Orders
              </h3>
              <button
                onClick={() => broadcastAlert("Order list updated.", "info")}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 hover:bg-gold/10 transition-all text-white/20 hover:text-gold"
              >
                <RefreshCcw size={12} />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {orders.slice(0, 4).map((o, idx) => (
                <motion.div
                  key={o.id}
                  className="bg-[#121212]/30 border border-white/5 hover:border-gold/20 rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase font-bold">
                      Order #{o.id.toString().slice(-6).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                      <span className="text-[8px] font-black text-gold uppercase tracking-[0.2em] font-bold">
                        {o.status}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-lg font-heading text-white mb-4 group-hover:text-gold transition-colors leading-tight">
                    1x {o.items?.[0]?.name || "Pre-Fuel Formula"}
                  </h4>
                  <div className="flex items-center justify-between gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-heading text-white/20 font-bold italic">
                      MK
                    </div>
                    <button
                      onClick={() => handleAdvance(o.id, o.status)}
                      className="flex-1 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black text-white/40 uppercase tracking-widest hover:bg-gold hover:text-black hover:border-gold transition-all font-bold"
                    >
                      Advance Status
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stock Distribution Stats */}
          <div className="glass-card rounded-[2rem] lg:rounded-[3rem] border border-white/5 p-6 lg:p-10 shadow-2xl relative overflow-hidden font-bold">
            <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase mb-6 lg:mb-8">
              Stock Distribution
            </h3>
            <div className="flex flex-col gap-4">
              <StockBar
                label="Optimal reserves"
                percent={65}
                color="bg-emerald-400"
              />
              <StockBar label="Low Stock" percent={12} color="bg-red-400" />
              <StockBar label="Restocking" percent={23} color="bg-gold" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StockBar({ label, percent, color }: any) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
        <span className="text-white/20">{label}</span>
        <span className="text-white/40">{percent}%</span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
