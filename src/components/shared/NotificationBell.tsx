import React, { useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useData } from "../../context/DataContext";

export default function NotificationBell() {
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useData();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const typeIcons: Record<string, string> = {
    booking: "📋",
    cancellation: "❌",
    reschedule: "🔄",
    reminder: "⏰",
    capacity: "📊",
    no_show: "⚠️",
    info: "ℹ️",
    system_alert: "📢",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors relative"
      >
        <Bell size={18} className="text-white/70" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FFB800] text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-[#FFB800]/30">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h4 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    markAllNotificationsRead();
                  }}
                  className="text-[9px] text-[#FFB800] font-bold tracking-widest uppercase flex items-center gap-1 hover:text-white transition-colors"
                >
                  <CheckCheck size={12} />
                  Mark all
                </button>
              )}
            </div>
            {notifications.length === 0 && (
              <p className="text-center text-white/20 text-sm py-8">
                No notifications
              </p>
            )}
            {notifications.slice(0, 20).map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.is_read) markNotificationRead(n.id);
                }}
                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex gap-3 ${!n.is_read ? "bg-white/[0.02]" : ""}`}
              >
                <span className="text-lg mt-0.5">
                  {typeIcons[n.type] || "ℹ️"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs font-bold truncate ${n.is_read ? "text-white/40" : "text-white"}`}
                    >
                      {n.title}
                    </p>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-[#FFB800] shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-white/30 mt-1 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[9px] text-white/20 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
