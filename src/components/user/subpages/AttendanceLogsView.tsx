import React from "react";
import { Clock, CheckCircle2 } from "lucide-react";

interface AttendanceLogsViewProps {
  currentUser: any;
  attendanceLogs: any[];
}

export default function AttendanceLogsView({ currentUser, attendanceLogs }: AttendanceLogsViewProps) {
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
