import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { Clock, DollarSign, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CoachStaffView() {
  const { currentUser, staffShifts, payrollRecords, staffAttendance, punchIn, punchOut } = useData();

  const [activeTab, setActiveTab] = useState<"shifts" | "attendance" | "payroll">("shifts");

  if (!currentUser) return null;

  const myShifts = staffShifts.filter((s) => s.staff_id === currentUser.id);
  const myAttendance = staffAttendance.filter((a) => a.staff_id === currentUser.id);
  const myPayroll = payrollRecords.filter((p) => p.staff_id === currentUser.id);
  
  const activePunch = myAttendance.find(a => !a.punch_out);

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">
            My Staff Profile
          </h2>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">
            Shifts, Attendance & Pay
          </p>
        </div>

        <div className="flex bg-black/40 p-2 rounded-2xl border border-white/5 w-full md:w-auto">
          {activePunch ? (
            <button 
              onClick={punchOut}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
            >
              <Clock size={16} /> Punch Out
            </button>
          ) : (
            <button 
              onClick={punchIn}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 premium-button text-black px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
            >
              <Clock size={16} /> Punch In
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-white/5 pb-px gap-6 font-bold overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("shifts")}
          className={`pb-4 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 relative ${
            activeTab === "shifts" ? "text-gold" : "text-white/30 hover:text-white"
          }`}
        >
          My Shifts
          {activeTab === "shifts" && (
            <motion.div
              layoutId="coachStaffTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-4 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 relative ${
            activeTab === "attendance" ? "text-gold" : "text-white/30 hover:text-white"
          }`}
        >
          Time & Attendance
          {activeTab === "attendance" && (
            <motion.div
              layoutId="coachStaffTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("payroll")}
          className={`pb-4 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 relative ${
            activeTab === "payroll" ? "text-gold" : "text-white/30 hover:text-white"
          }`}
        >
          Payroll Records
          {activeTab === "payroll" && (
            <motion.div
              layoutId="coachStaffTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
            />
          )}
        </button>
      </div>

      {activeTab === "shifts" && (
        <div className="grid gap-4">
          {myShifts.length === 0 ? (
            <div className="glass-card p-10 rounded-[2rem] border border-white/5 text-center flex flex-col items-center justify-center">
              <Calendar className="text-white/10 mb-4" size={48} />
              <p className="text-white/30 text-sm font-bold tracking-widest uppercase">No shifts scheduled</p>
            </div>
          ) : (
            myShifts.map((shift) => (
              <div key={shift.id} className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gold">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{new Date(shift.start_time).toLocaleDateString()}</p>
                    <p className="text-[10px] font-black tracking-widest uppercase text-white/40">
                      {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5">
                  <span className="text-[10px] font-black uppercase text-gold tracking-widest">{shift.role}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="grid gap-4">
          {myAttendance.length === 0 ? (
            <div className="glass-card p-10 rounded-[2rem] border border-white/5 text-center flex flex-col items-center justify-center">
              <Clock className="text-white/10 mb-4" size={48} />
              <p className="text-white/30 text-sm font-bold tracking-widest uppercase">No attendance records</p>
            </div>
          ) : (
            myAttendance.map((log) => (
              <div key={log.id} className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:border-white/10 transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-green-400 font-bold">In: {new Date(log.punch_in).toLocaleString()}</span>
                  <span className="text-sm text-red-400 font-bold">Out: {log.punch_out ? new Date(log.punch_out).toLocaleString() : 'Active'}</span>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">{log.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "payroll" && (
        <div className="grid gap-4">
          {myPayroll.length === 0 ? (
            <div className="glass-card p-10 rounded-[2rem] border border-white/5 text-center flex flex-col items-center justify-center">
              <DollarSign className="text-white/10 mb-4" size={48} />
              <p className="text-white/30 text-sm font-bold tracking-widest uppercase">No payroll records</p>
            </div>
          ) : (
            myPayroll.map((pay) => (
              <div key={pay.id} className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-6 group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-white font-heading text-lg mb-1">{pay.total_pay} EGP</p>
                    <p className="text-[10px] font-black tracking-widest uppercase text-white/40">
                      {new Date(pay.period_start).toLocaleDateString()} - {new Date(pay.period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full border border-white/5 ${pay.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">{pay.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
