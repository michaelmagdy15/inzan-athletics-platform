import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  UserCheck,
  Plus,
  X,
  CreditCard,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "../../context/DataContext";

export default function StaffManagementView() {
  const {
    members,
    staffShifts,
    staffAttendance,
    payrollRecords,
    addStaffShift,
    deleteStaffShift,
  } = useData();

  const staffMembers = members.filter((m) =>
    ["admin", "coach", "nutritionist"].includes(m.role),
  );

  const [activeTab, setActiveTab] = useState<"shifts" | "attendance" | "payroll">(
    "shifts",
  );
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);

  const handleAddShift = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const staffId = formData.get("staffId") as string;
    const date = formData.get("date") as string;
    const startTimeStr = formData.get("startTime") as string;
    const endTimeStr = formData.get("endTime") as string;
    
    // Construct actual Date objects
    const startObj = new Date(`${date}T${startTimeStr}:00`);
    const endObj = new Date(`${date}T${endTimeStr}:00`);

    const staffMember = members.find(m => m.id === staffId);
    if (!staffMember) return;

    // determine sub role
    let roleForShift: "coach" | "admin" | "nutritionist" = "coach";
    if (staffMember.role === "admin") {
      roleForShift = "admin";
    } else if (staffMember.role === "nutritionist") {
      roleForShift = "nutritionist";
    }

    try {
      await addStaffShift({
        staff_id: staffId,
        start_time: startObj.toISOString(),
        end_time: endObj.toISOString(),
        role: roleForShift
      });
      setShowAddShiftModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-10 relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">
            Staff Management
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase font-medium">
            Shifts, Attendance & Payroll
          </p>
        </div>
        <div className="flex items-center gap-3 lg:gap-4 font-bold w-full lg:w-auto">
          <button
            onClick={() => setShowAddShiftModal(true)}
            className="flex items-center justify-center gap-2 flex-1 lg:flex-none premium-button px-4 lg:px-6 py-3 rounded-xl text-[9px] font-black tracking-widest uppercase text-black"
          >
            <Plus size={14} /> Schedule Shift
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 pb-px gap-6 font-bold overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("shifts")}
          className={`pb-4 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 relative ${
            activeTab === "shifts" ? "text-gold" : "text-white/30 hover:text-white"
          }`}
        >
          Shift Schedule
          {activeTab === "shifts" && (
            <motion.div
              layoutId="staffActivityTab"
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
              layoutId="staffActivityTab"
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
              layoutId="staffActivityTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
            />
          )}
        </button>
      </div>

      {/* Shifts Tab */}
      {activeTab === "shifts" && (
        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-bold border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/30">
                  <th className="pb-4 pl-4 font-black">Staff Member</th>
                  <th className="pb-4 font-black">Role</th>
                  <th className="pb-4 font-black">Date</th>
                  <th className="pb-4 font-black">Time</th>
                  <th className="pb-4 pr-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffShifts.map((shift) => {
                  const shiftDate = new Date(shift.start_time).toLocaleDateString();
                  const startTime = new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const endTime = new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <tr
                      key={shift.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 pl-4 text-sm text-white">
                        {shift.staff_name}
                      </td>
                      <td className="py-4 text-sm text-gold capitalize">
                        {shift.role}
                      </td>
                      <td className="py-4 text-sm text-white/70">
                        {shiftDate}
                      </td>
                      <td className="py-4 text-sm text-white">
                        {startTime} - {endTime}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <button 
                          onClick={() => deleteStaffShift(shift.id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors inline-block"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {staffShifts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/30 text-xs">
                      No shifts scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-bold border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/30">
                  <th className="pb-4 pl-4 font-black">Staff Member</th>
                  <th className="pb-4 font-black">Punch In</th>
                  <th className="pb-4 font-black">Punch Out</th>
                  <th className="pb-4 pr-4 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {staffAttendance.map((log) => {
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 pl-4 text-sm text-white">
                        {log.staff_name}
                      </td>
                      <td className="py-4 text-sm text-green-400">
                        {new Date(log.punch_in).toLocaleString()}
                      </td>
                      <td className="py-4 text-sm text-red-400">
                        {log.punch_out ? new Date(log.punch_out).toLocaleString() : 'Active'}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/50 uppercase tracking-widest font-black">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {staffAttendance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-white/30 text-xs">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === "payroll" && (
        <div className="glass-card p-6 rounded-[2rem] border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-heading tracking-widest uppercase text-white px-2">
              Payroll Periods
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold hover:bg-gold/20 rounded-xl text-[9px] uppercase tracking-widest font-black transition-colors">
              <DollarSign size={14} /> Generate Payroll
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-bold border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-white/30">
                  <th className="pb-4 pl-4 font-black">Staff Member</th>
                  <th className="pb-4 font-black">Period</th>
                  <th className="pb-4 font-black">Total Pay</th>
                  <th className="pb-4 pr-4 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((pay) => {
                  return (
                    <tr
                      key={pay.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 pl-4 text-sm text-white">
                        {pay.staff_name}
                      </td>
                      <td className="py-4 text-sm text-white/70">
                        {new Date(pay.period_start).toLocaleDateString()} - {new Date(pay.period_end).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-sm text-gold">
                        {pay.total_pay} EGP
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <span className={`px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-black ${pay.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {payrollRecords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-white/30 text-xs">
                      No payroll records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Shift Modal */}
      <AnimatePresence>
        {showAddShiftModal && (
          <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.form
              onSubmit={handleAddShift}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] rounded-[2rem] p-8 lg:p-12 w-full max-w-lg flex flex-col gap-8 shadow-2xl border border-white/5"
            >
              <button
                type="button"
                onClick={() => setShowAddShiftModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/50" />
              </button>
              
              <div className="text-center font-bold">
                <h2 className="text-2xl font-heading tracking-[0.2em] uppercase text-white mb-2">
                  Schedule Shift
                </h2>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60">
                  Assign hours to staff
                </p>
              </div>

              <div className="flex flex-col gap-4 font-bold">
                <select
                  name="staffId"
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold placeholder-white/20"
                >
                  <option value="" disabled selected>SELECT STAFF MEMBER</option>
                  {staffMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
                <input
                  name="date"
                  type="date"
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold"
                />
                <div className="flex gap-4">
                  <input
                    name="startTime"
                    type="time"
                    required
                    className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold"
                  />
                  <input
                    name="endTime"
                    type="time"
                    required
                    className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white focus:border-gold/30 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2 font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddShiftModal(false)}
                  className="flex-1 py-4 text-white/20 uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="premium-button flex-1 h-14 rounded-2xl text-black font-black tracking-[0.3em] uppercase text-[10px]"
                >
                  Save Shift
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
