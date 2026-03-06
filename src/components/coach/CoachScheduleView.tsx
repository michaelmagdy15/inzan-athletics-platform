import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
} from "lucide-react";
import { useData, CoachAvailability } from "../../context/DataContext";

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
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
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

  const mySlots = coachAvailabilities.filter(
    (a) => a.coach_id === currentUser.id && a.day_of_week === selectedDay,
  );

  const isDayOff = mySlots.length > 0 && mySlots.every((s) => s.is_day_off);

  const handleToggleDayOff = async () => {
    setSaving(true);
    try {
      if (isDayOff) {
        // Remove the day-off marker
        for (const slot of mySlots) {
          await deleteCoachAvailability(slot.id);
        }
      } else {
        // Set as day off
        await setCoachAvailability({
          coach_id: currentUser.id,
          day_of_week: selectedDay,
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
        day_of_week: selectedDay,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
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
      <div>
        <h1 className="text-2xl lg:text-3xl font-heading tracking-tight text-white mb-1 uppercase">
          Schedule Management
        </h1>
        <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-medium">
          Set your availability & capacity
        </p>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 p-2 bg-black/40 rounded-3xl border border-white/5 overflow-x-auto scrollbar-hide">
        {DAYS.map((day, idx) => (
          <button
            key={day}
            onClick={() => setSelectedDay(idx)}
            className={`flex-1 min-w-[60px] py-4 rounded-2xl text-[9px] font-black tracking-[0.3em] transition-all relative overflow-hidden ${
              selectedDay === idx
                ? "text-white bg-white/10 border border-white/10"
                : "text-white/20 hover:text-white/50"
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Day Off Toggle */}
      <div className="glass-card rounded-[2rem] p-6 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <CalendarDays className="text-red-400" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {DAYS[selectedDay]}
            </h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">
              {isDayOff ? "Day Off" : "Working Day"}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggleDayOff}
          disabled={saving}
          className="flex items-center gap-2 text-xs"
        >
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">
              Time Slots
            </h3>
            <button
              onClick={() => setShowAddSlot(true)}
              className="premium-button px-5 py-3 rounded-xl flex items-center gap-2"
            >
              <Plus size={14} />
              <span className="text-[9px] font-black tracking-widest uppercase text-black">
                Add Slot
              </span>
            </button>
          </div>

          {mySlots.filter((s) => !s.is_day_off).length === 0 && (
            <p className="text-center text-white/20 text-sm py-8">
              No slots set for {DAYS[selectedDay]}. Add your first slot above.
            </p>
          )}

          <div className="flex flex-col gap-4">
            {mySlots
              .filter((s) => !s.is_day_off)
              .map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FFB800]/10 flex items-center justify-center border border-[#FFB800]/20">
                      <Clock size={18} className="text-[#FFB800]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {formatTime(slot.start_time)} —{" "}
                        {formatTime(slot.end_time)}
                      </p>
                      <div className="flex gap-3 mt-1 text-[9px] text-white/40 tracking-widest uppercase">
                        <span>1on1: {slot.max_pt_1on1}</span>
                        <span>Partner: {slot.max_partner}</span>
                        <span>Group: {slot.max_group}</span>
                        <span>Nutrition: {slot.max_nutrition}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCoachAvailability(slot.id)}
                    className="self-end sm:self-center w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#111] border border-white/10 rounded-[2rem] p-8 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-6">Add Time Slot</h3>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[9px] text-white/40 uppercase tracking-widest mb-2 block">
                    Start
                  </label>
                  <select
                    value={newSlot.start_time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, start_time: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {formatTime(t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-white/40 uppercase tracking-widest mb-2 block">
                    End
                  </label>
                  <select
                    value={newSlot.end_time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, end_time: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {formatTime(t)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {["max_pt_1on1", "max_partner", "max_group", "max_nutrition"].map(
                (key) => (
                  <div key={key}>
                    <label className="text-[9px] text-white/40 uppercase tracking-widest mb-2 block">
                      {key.replace("max_", "").replace("_", " ")} Capacity
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={(newSlot as any)[key]}
                      onChange={(e) =>
                        setNewSlot({
                          ...newSlot,
                          [key]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                    />
                  </div>
                ),
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowAddSlot(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-[10px] font-bold tracking-widest uppercase hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSlot}
                  disabled={saving}
                  className="flex-1 premium-button py-3 rounded-xl text-[10px] font-black tracking-widest uppercase text-black flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
