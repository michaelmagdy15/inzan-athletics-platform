import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useData, CoachAvailability } from "../../context/DataContext";
import { motion, AnimatePresence } from "motion/react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 6; // 6 AM to 9 PM
  return `${h.toString().padStart(2, "0")}:00:00`;
});

export default function CoachScheduleView() {
  const {
    currentUser,
    coachAvailabilities,
    setCoachAvailability,
    deleteCoachAvailability,
  } = useData();

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }, []);

  const [viewMode, setViewMode] = useState<"recurring" | "flexible">("flexible");
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDay());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    start_time: "08:00:00",
    end_time: "09:00:00",
    max_pt_1on1: 1,
    max_partner: 2,
    max_group: 5,
    max_class: 20,
    max_nutrition: 1,
  });
  const [saving, setSaving] = useState(false);

  if (!currentUser) return null;

  // Derive slots based on selection
  const mySlots = useMemo(() => {
    if (viewMode === "recurring" && selectedDay !== null) {
      return coachAvailabilities.filter(
        (a) => a.coach_id === currentUser.id && a.day_of_week === selectedDay && a.specific_date === null
      );
    }
    if (viewMode === "flexible" && selectedDate !== null) {
      return coachAvailabilities.filter(
        (a) => a.coach_id === currentUser.id && a.specific_date === selectedDate
      );
    }
    return [];
  }, [coachAvailabilities, viewMode, selectedDay, selectedDate, currentUser.id]);

  const isDayOff = mySlots.length > 0 && mySlots.every((s) => s.is_day_off);

  // Calendar Logic
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const hasSpecific = coachAvailabilities.some(a => a.coach_id === currentUser.id && a.specific_date === dateStr);
      days.push({ day: i, dateStr, hasSpecific });
    }
    return days;
  }, [currentMonth, coachAvailabilities, currentUser.id]);

  const handleToggleDayOff = async () => {
    setSaving(true);
    try {
      if (isDayOff) {
        for (const slot of mySlots) {
          await deleteCoachAvailability(slot.id);
        }
      } else {
        await setCoachAvailability({
          coach_id: currentUser.id,
          day_of_week: viewMode === "recurring" ? selectedDay : null,
          specific_date: viewMode === "flexible" ? selectedDate : null,
          start_time: "00:00:00",
          end_time: "23:59:00",
          is_day_off: true,
          max_pt_1on1: 0,
          max_partner: 0,
          max_group: 0,
          max_class: 0,
          max_nutrition: 0,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlot = async () => {
    setSaving(true);
    try {
      await setCoachAvailability({
        coach_id: currentUser.id,
        day_of_week: viewMode === "recurring" ? selectedDay : null,
        specific_date: viewMode === "flexible" ? selectedDate : null,
        is_day_off: false,
        ...newSlot,
      });
      setShowAddSlot(false);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (t: string) => {
    const [h] = t.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">
            Schedule Hub
          </h1>
          <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">
            Manage recurring & specific availability
          </p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
          <button
            onClick={() => setViewMode("flexible")}
            className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase transition-all ${viewMode === "flexible" ? "bg-gold text-black" : "text-white/40"}`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode("recurring")}
            className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase transition-all ${viewMode === "recurring" ? "bg-gold text-black" : "text-white/40"}`}
          >
            Recurring
          </button>
        </div>
      </div>

      {/* Flexible Calendar View */}
      {viewMode === "flexible" && (
        <div className="glass-card rounded-[2.5rem] border border-white/5 p-6 overflow-hidden relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-white/20 tracking-[0.3em] uppercase">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={16} className="text-white/60" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={16} className="text-white/60" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["S", "M", "T", "W", "T", "F", "S"].map(d => (
              <div key={d} className="text-center text-[8px] font-black text-white/20 pb-2">{d}</div>
            ))}
            {calendarDays.map((d, idx) => (
              <button
                key={idx}
                disabled={!d}
                onClick={() => d && setSelectedDate(d.dateStr)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group ${!d ? "opacity-0" :
                  selectedDate === d.dateStr ? "bg-gold text-black shadow-lg shadow-gold/20" :
                    "bg-white/[0.03] hover:bg-white/[0.08]"
                  }`}
              >
                <span className={`text-[10px] font-black ${selectedDate === d.dateStr ? "text-black" : "text-white/60 group-hover:text-white"}`}>
                  {d?.day}
                </span>
                {d?.hasSpecific && (
                  <div className={`w-1 h-1 rounded-full absolute bottom-2 ${selectedDate === d.dateStr ? "bg-black" : "bg-gold"}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recurring Weekly View */}
      {viewMode === "recurring" && (
        <div className="flex gap-2 p-2 bg-black/40 rounded-3xl border border-white/5 overflow-x-auto scrollbar-hide">
          {DAYS.map((day, idx) => (
            <button
              key={day}
              onClick={() => setSelectedDay(idx)}
              className={`flex-1 min-w-[60px] py-4 rounded-2xl text-[9px] font-black tracking-[0.3em] transition-all relative overflow-hidden ${selectedDay === idx
                ? "text-white bg-white/10 border border-white/10"
                : "text-white/20 hover:text-white/50"
                }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      )}

      {/* Day / Date Summary Section */}
      <div className="flex flex-col gap-4">
        {/* Day Off Toggle */}
        <div className="glass-card rounded-[2rem] p-6 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${isDayOff ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
              <CalendarDays className={isDayOff ? "text-red-400" : "text-emerald-400"} size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                {viewMode === "recurring" ? DAYS[selectedDay || 0] : new Date(selectedDate || "").toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                {isDayOff ? "Inactive Day" : "Operational"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleDayOff}
            disabled={saving}
            className="flex items-center gap-3"
          >
            <span className={`text-[8px] font-black uppercase tracking-widest ${isDayOff ? "text-red-400" : "text-emerald-400"}`}>
              {isDayOff ? "Set Active" : "Set Off"}
            </span>
            {isDayOff ? (
              <ToggleLeft size={32} className="text-red-400" />
            ) : (
              <ToggleRight size={32} className="text-emerald-400" />
            )}
          </button>
        </div>

        {/* Time Slots */}
        {!isDayOff && (
          <div className="glass-card rounded-[2rem] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase mb-1">
                  Availability Slots
                </h3>
                <p className="text-[8px] text-white/10 uppercase tracking-widest font-bold">
                  {mySlots.length} Slots Defined
                </p>
              </div>
              <button
                onClick={() => setShowAddSlot(true)}
                className="premium-button px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-gold/20"
              >
                <Plus size={14} className="text-black" />
                <span className="text-[9px] font-black tracking-widest uppercase text-black">
                  New Slot
                </span>
              </button>
            </div>

            {mySlots.filter((s) => !s.is_day_off).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                  <Clock size={24} className="text-white/20" />
                </div>
                <p className="text-white/30 text-[10px] uppercase font-black tracking-widest max-w-[200px] leading-relaxed">
                  No availability windows defined for this time.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {mySlots
                  .filter((s) => !s.is_day_off)
                  .map((slot) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={slot.id}
                      className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col lg:flex-row justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                          <Clock size={16} className="text-gold" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-white leading-none">
                              {formatTime(slot.start_time).split(' ')[0]}
                            </p>
                            <span className="text-[8px] text-white/30">—</span>
                            <p className="text-sm font-bold text-white leading-none">
                              {formatTime(slot.end_time)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[8px] text-white/30 tracking-[0.2em] uppercase font-black">
                            <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-gold/40" /> PT: {slot.max_pt_1on1}</span>
                            <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-400/40" /> PARTNER: {slot.max_partner}</span>
                            <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-blue-400/40" /> GROUP: {slot.max_group}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCoachAvailability(slot.id)}
                        className="self-end lg:self-center w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 hover:bg-red-500/20 transition-colors group"
                        title="Remove Availability"
                      >
                        <Trash2 size={14} className="text-red-400/60 group-hover:text-red-400 transition-colors" />
                      </button>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      <AnimatePresence>
        {showAddSlot && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 max-w-md w-full shadow-[0_0_100px_rgba(202,138,4,0.1)]"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-heading text-white uppercase tracking-tight">Add Time Slot</h3>
                <p className="text-[10px] text-gold/60 font-black tracking-[0.3em] uppercase">Set window & limits</p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black mb-2.5 block ml-1">
                      Start Time
                    </label>
                    <select
                      value={newSlot.start_time}
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, start_time: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-gold/30"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t} className="bg-[#0a0a0a]">
                          {formatTime(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black mb-2.5 block ml-1">
                      End Time
                    </label>
                    <select
                      value={newSlot.end_time}
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, end_time: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-gold/30"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t} className="bg-[#0a0a0a]">
                          {formatTime(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                  {[
                    { key: "max_pt_1on1", label: "PT 1on1" },
                    { key: "max_partner", label: "Partner" },
                    { key: "max_group", label: "Group" },
                    { key: "max_class", label: "Class" },
                    { key: "max_nutrition", label: "Nutrition" }
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black mb-2 block ml-1">
                        {item.label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={(newSlot as any)[item.key]}
                        onChange={(e) =>
                          setNewSlot({
                            ...newSlot,
                            [item.key]: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm font-bold focus:outline-none focus:border-gold/30"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => setShowAddSlot(false)}
                    className="flex-1 py-4 text-white/20 text-[10px] font-black tracking-widest uppercase hover:text-white transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleAddSlot}
                    disabled={saving}
                    className="flex-1 premium-button py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase text-black flex items-center justify-center gap-2 shadow-xl shadow-gold/10"
                  >
                    {saving ? "Deploying..." : "Confirm Slot"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
