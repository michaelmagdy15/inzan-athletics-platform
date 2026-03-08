import React, { useState, useMemo } from "react";
import {
  Dumbbell,
  User,
  CalendarDays,
  Clock,
  ChevronRight,
  CheckCircle2,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useData,
  SessionType,
  SESSION_TYPE_LABELS,
  PTPackage,
} from "../../context/DataContext";

type Step = "type" | "packages" | "coach" | "date" | "time" | "confirm";

export default function PTBookingTab() {
  const {
    currentUser,
    ptPackages,
    members,
    coachAvailabilities,
    ptSessions,
    bookPTSession,
    bookTrialSession,
  } = useData();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("packages");
  const [bookingType, setBookingType] = useState<"package" | "trial">("package");
  const [selectedPackage, setSelectedPackage] = useState<PTPackage | null>(
    null,
  );
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  if (!currentUser) return null;

  // Active packages for this user
  const activePackages = ptPackages.filter(
    (p) =>
      p.member_id === currentUser.id &&
      p.status === "active" &&
      p.payment_confirmed &&
      p.remaining_sessions > 0,
  );

  // Available coaches (from members with role=coach)
  const coaches = members.filter((m) => m.role === "coach");

  // Available dates for selected coach (next 14 days)
  const availableDates = useMemo(() => {
    if (!selectedCoachId) return [];
    const coachSlots = coachAvailabilities.filter(
      (a) => a.coach_id === selectedCoachId && !a.is_day_off,
    );
    const workingDays = new Set(coachSlots.map((s) => s.day_of_week));
    const dates: string[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (workingDays.has(d.getDay()))
        dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }, [selectedCoachId, coachAvailabilities]);

  // Available time slots for selected coach + date
  const availableSlots = useMemo(() => {
    if (!selectedCoachId || !selectedDate) return [];
    const dayOfWeek = new Date(selectedDate).getDay();
    const coachSlots = coachAvailabilities.filter(
      (a) =>
        a.coach_id === selectedCoachId &&
        a.day_of_week === dayOfWeek &&
        !a.is_day_off,
    );
    return coachSlots.map((slot) => {
      const bookedCount = ptSessions.filter(
        (s) =>
          s.coach_id === selectedCoachId &&
          s.scheduled_date === selectedDate &&
          s.scheduled_time === slot.start_time &&
          s.status === "scheduled",
      ).length;
      const sessionType = selectedPackage?.package_type || "pt_1on1";
      const capKey = `max_${sessionType}` as keyof typeof slot;
      const maxCap = (slot[capKey] as number) || 1;
      return {
        ...slot,
        booked: bookedCount,
        maxCapacity: maxCap,
        available: bookedCount < maxCap,
      };
    });
  }, [
    selectedCoachId,
    selectedDate,
    coachAvailabilities,
    ptSessions,
    selectedPackage,
  ]);

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const handleBook = async () => {
    if ((bookingType === "package" && !selectedPackage) || !selectedCoachId || !selectedDate || !selectedTime)
      return;
    setBooking(true);
    setError("");
    try {
      if (bookingType === "trial") {
        await bookTrialSession({
          coach_id: selectedCoachId,
          member_id: currentUser.id,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
        });
      } else if (selectedPackage) {
        await bookPTSession({
          package_id: selectedPackage.id,
          coach_id: selectedCoachId,
          member_id: currentUser.id,
          session_type: selectedPackage.package_type,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
        });
      }
      setStep("packages");
      setSelectedPackage(null);
      setSelectedCoachId(null);
      setSelectedDate("");
      setSelectedTime("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  };

  const selectedCoach = coaches.find((c) => c.id === selectedCoachId);

  return (
    <div className="p-6 pt-12 flex flex-col gap-6">
      <header className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-light tracking-tight">Book PT</h2>
        <div className="w-10 h-10 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/20 flex items-center justify-center">
          <Dumbbell size={18} className="text-[#FFB800]" />
        </div>
      </header>

      {/* Progress Steps */}
      <div className="flex items-center gap-1">
        {(["packages", "coach", "date", "time", "confirm"] as Step[]).map(
          (s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s
                  ? "bg-[#FFB800] text-black"
                  : ["packages", "coach", "date", "time", "confirm"].indexOf(
                    step,
                  ) > i
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                    : "bg-white/5 text-white/30 border border-white/10"
                  }`}
              >
                {["packages", "coach", "date", "time", "confirm"].indexOf(
                  step,
                ) > i
                  ? "✓"
                  : i + 1}
              </div>
              {i < 4 && (
                <div
                  className={`flex-1 h-0.5 ${["packages", "coach", "date", "time", "confirm"].indexOf(step) > i ? "bg-emerald-500/30" : "bg-white/5"}`}
                />
              )}
            </React.Fragment>
          ),
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Select Package or Trial */}
      {step === "packages" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              Choose Booking Method
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBookingType("package")}
                className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 ${bookingType === "package" ? "bg-[#FFB800]/10 border-[#FFB800] text-[#FFB800]" : "bg-white/5 border-white/10 text-white/40"}`}
              >
                <Package size={20} />
                <span className="text-[10px] uppercase font-bold tracking-widest">My Packages</span>
              </button>
              <button
                onClick={() => {
                  setBookingType("trial");
                  setStep("coach");
                }}
                className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 ${bookingType === "trial" ? "bg-[#FFB800]/10 border-[#FFB800] text-[#FFB800]" : "bg-white/5 border-white/10 text-white/40"}`}
              >
                <Dumbbell size={20} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Free Trial</span>
              </button>
            </div>
          </div>

          {bookingType === "package" && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  Select Active Package
                </p>
                <button
                  onClick={() => navigate("/p/packages")}
                  className="text-[10px] text-[#FFB800] uppercase tracking-widest font-bold hover:underline"
                >
                  Buy More +
                </button>
              </div>
              {activePackages.length === 0 && (
                <div className="text-center py-10 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                  <Package size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs text-white/40 mb-4 px-6 leading-relaxed">
                    You don't have any active PT packages yet.
                  </p>
                  <button
                    onClick={() => navigate("/p/packages")}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-[10px] uppercase font-bold tracking-widest transition-colors"
                  >
                    View Packages
                  </button>
                </div>
              )}
              {activePackages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setBookingType("package");
                    setStep("coach");
                  }}
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#FFB800]/30 rounded-2xl p-5 text-left transition-all group"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] bg-[#FFB800]/10 text-[#FFB800] px-3 py-1 rounded-full font-bold tracking-widest uppercase border border-[#FFB800]/20">
                      {SESSION_TYPE_LABELS[pkg.package_type]}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-white/10 group-hover:text-[#FFB800] transition-colors"
                    />
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {pkg.remaining_sessions}
                        <span className="text-white/20 text-sm">
                          /{pkg.total_sessions}
                        </span>
                      </p>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest">
                        Sessions Left
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60">
                        {pkg.coach_name || "Any Coach"}
                      </p>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest">
                        Expires{" "}
                        {pkg.expires_at
                          ? new Date(pkg.expires_at).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Coach */}
      {step === "coach" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep("packages")}
              className="text-white/40 hover:text-white text-sm"
            >
              ← Back
            </button>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              Select Coach
            </p>
          </div>
          {coaches.map((coach) => (
            <button
              key={coach.id}
              onClick={() => {
                setSelectedCoachId(coach.id);
                setStep("date");
              }}
              className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#FFB800]/30 rounded-2xl p-5 flex items-center gap-4 transition-all group"
            >
              <img
                src={coach.avatar}
                alt={coach.name}
                className="w-12 h-12 rounded-full border-2 border-white/10 object-cover"
              />
              <div className="flex-1 text-left">
                <p className="font-bold text-white">{coach.name}</p>
                <div className="flex gap-2 items-center">
                  <p className="text-[10px] text-white/40 tracking-widest uppercase">
                    Coach
                  </p>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <p className="text-[9px] text-[#FFB800] font-bold uppercase tracking-tight">5.0 ★</p>
                </div>
              </div>
              <ChevronRight
                size={18}
                className="text-white/10 group-hover:text-[#FFB800] transition-colors"
              />
            </button>
          ))}
        </div>
      )}

      {/* ... rest of steps ... */}
      {step === "date" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep("coach")}
              className="text-white/40 hover:text-white text-sm"
            >
              ← Back
            </button>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              Select Date
            </p>
          </div>
          <p className="text-sm text-white/40">With {selectedCoach?.name}</p>
          <div className="grid grid-cols-3 gap-3">
            {availableDates.map((d) => {
              const date = new Date(d);
              return (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDate(d);
                    setStep("time");
                  }}
                  className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#FFB800]/30 rounded-2xl p-4 text-center transition-all"
                >
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p className="text-xl font-bold text-white mt-1">
                    {date.getDate()}
                  </p>
                  <p className="text-[9px] text-white/30 uppercase">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </p>
                </button>
              );
            })}
          </div>
          {availableDates.length === 0 && (
            <p className="text-center text-white/20 text-sm py-8 italic font-bold">
              Coach has no available time slots in the next 14 days.
            </p>
          )}
        </div>
      )}

      {step === "time" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep("date")}
              className="text-white/40 hover:text-white text-sm"
            >
              ← Back
            </button>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              Select Time Slot
            </p>
          </div>
          <p className="text-sm text-white/40">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="flex flex-col gap-3">
            {availableSlots.map((slot) => {
              const sessionType = bookingType === "trial" ? "trial" : (selectedPackage?.package_type || "pt_1on1");
              const capKey = `max_${sessionType}` as keyof typeof slot;
              const maxCap = (slot[capKey] as number) || 1;
              const isAvailable = slot.booked < maxCap;

              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedTime(slot.start_time);
                      setStep("confirm");
                    }
                  }}
                  disabled={!isAvailable}
                  className={`border rounded-2xl p-5 flex justify-between items-center transition-all ${isAvailable
                    ? "bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-[#FFB800]/30 cursor-pointer"
                    : "bg-red-500/5 border-red-500/10 opacity-50 cursor-not-allowed"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock
                      size={16}
                      className={
                        isAvailable ? "text-[#FFB800]" : "text-red-400"
                      }
                    />
                    <span className="font-bold text-white">
                      {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${isAvailable ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {maxCap - slot.booked} left
                    </span>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">
                      {slot.booked}/{maxCap} booked
                    </p>
                  </div>
                </button>
              );
            })}
            {availableSlots.length === 0 && (
              <p className="text-center text-white/20 text-sm py-8">
                No slots available on this date.
              </p>
            )}
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep("time")}
              className="text-white/40 hover:text-white text-sm"
            >
              ← Back
            </button>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              Confirm Booking
            </p>
          </div>

          <div className="bg-[#111] rounded-[2rem] border border-[#FFB800]/20 p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFB800]/5 rounded-full blur-2xl" />

            <div className="text-center">
              <div className="w-16 h-16 bg-[#FFB800]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFB800]/20">
                <CheckCircle2 size={32} className="text-[#FFB800]" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Booking Summary</h3>
              <p className="text-[9px] text-[#FFB800] uppercase tracking-[0.3em] font-black mt-1">Status: Pending Transmission</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Session Type",
                  value: bookingType === "trial"
                    ? "Free Trial Session"
                    : (selectedPackage ? SESSION_TYPE_LABELS[selectedPackage.package_type] : ""),
                },
                { label: "Coach", value: selectedCoach?.name || "" },
                {
                  label: "Date",
                  value: selectedDate
                    ? new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                    : "",
                },
                {
                  label: "Time",
                  value: selectedTime ? formatTime(selectedTime) : "",
                },
                {
                  label: "Sessions After",
                  value: bookingType === "trial"
                    ? "Trial Session"
                    : (selectedPackage ? `${selectedPackage.remaining_sessions - 1} remaining` : ""),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-3 border-b border-white/5 last:border-0"
                >
                  <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-white uppercase tracking-tight">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleBook}
              disabled={booking}
              className="w-full py-5 bg-[#FFB800] hover:bg-white rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase text-black mt-2 shadow-2xl shadow-[#FFB800]/20 transition-all active:scale-[0.98]"
            >
              {booking ? "Transmitting..." : "Confirm & Book Session"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
