import React, { useState } from "react";
import { Bell, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { useData } from "../../context/DataContext";
import { downloadIcsFile } from "../../utils/CalendarSyncApi";
import { useBranding } from "../../context/BrandingContext";

export default function ClassesTab() {
  const { classes, currentUser, bookClass, cancelClass, loading, classWaitlists, joinWaitlist, leaveWaitlist } = useData();
  const { config } = useBranding();
  const [subTab, setSubTab] = useState("date");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterValue, setFilterValue] = useState("");

  const handleAction = async (classId: string, isBooked: boolean, isWaitlisted: boolean, isFull: boolean) => {
    setProcessingId(classId);
    try {
      if (isBooked) {
        await cancelClass(classId);
      } else if (isWaitlisted) {
        await leaveWaitlist(classId);
      } else if (isFull) {
        await joinWaitlist(classId);
      } else {
        await bookClass(classId);
      }
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 pt-10 sm:pt-16 flex flex-col gap-6 lg:gap-10">
      <header className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-2xl lg:text-4xl font-heading tracking-tight uppercase italic text-white flex items-center gap-4">
          Training Modules
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_8px_#ffb800]" />
        </h2>
        <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg">
          <Bell size={18} />
        </button>
      </header>

      <div className="flex bg-white/5 p-1.5 lg:p-2 rounded-2xl lg:rounded-3xl border border-white/10 backdrop-blur-3xl shadow-2xl">
        <button
          onClick={() => {
            setSubTab("date");
            setFilterValue("");
          }}
          className={`flex-1 py-3 lg:py-4 text-[9px] lg:text-[11px] uppercase tracking-[0.2em] font-black rounded-xl lg:rounded-2xl transition-all ${subTab === "date" ? "bg-white text-black shadow-xl scale-[1.02]" : "text-white/30 hover:text-white"}`}
        >
          Temporal Registry
        </button>
        <button
          onClick={() => {
            setSubTab("instructor");
            setFilterValue("");
          }}
          className={`flex-1 py-3 lg:py-4 text-[9px] lg:text-[11px] uppercase tracking-[0.2em] font-black rounded-xl lg:rounded-2xl transition-all ${subTab === "instructor" ? "bg-white text-black shadow-xl scale-[1.02]" : "text-white/30 hover:text-white"}`}
        >
          Commanding Officers
        </button>
        <button
          onClick={() => {
            setSubTab("class");
            setFilterValue("");
          }}
          className={`flex-1 py-3 lg:py-4 text-[9px] lg:text-[11px] uppercase tracking-[0.2em] font-black rounded-xl lg:rounded-2xl transition-all ${subTab === "class" ? "bg-white text-black shadow-xl scale-[1.02]" : "text-white/30 hover:text-white"}`}
        >
          Operation Type
        </button>
      </div>

      <div className="relative group">
        <div
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[2rem] p-5 lg:p-6 flex justify-between items-center cursor-pointer border border-white/10 hover:border-gold/30 transition-all shadow-xl group-hover:bg-white/[0.08]"
        >
          <span className="text-[10px] lg:text-[12px] font-black tracking-[0.3em] uppercase mx-auto text-gold group-hover:text-white transition-colors italic">
            {filterValue ||
              (subTab === "date"
                ? "Select Temporal Node"
                : subTab === "instructor"
                  ? "Select Commanding Unit"
                  : "Select Operation")}
          </span>
          <ChevronDown size={20} className="text-white/20 group-hover:text-gold" />
        </div>
        {showDropdown && (
          <div className="absolute top-full left-0 w-full mt-3 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden z-20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-4 duration-300">
            <div
              onClick={() => {
                setFilterValue("");
                setShowDropdown(false);
              }}
              className="p-5 lg:p-6 border-b border-white/5 text-[10px] lg:text-[11px] uppercase tracking-widest cursor-pointer hover:bg-white/10 font-black text-white/30 italic"
            >
              Reset Protocol
            </div>
            {Array.from(
              new Set(
                classes.map((c) =>
                  subTab === "date"
                    ? c.date
                    : subTab === "instructor"
                      ? c.trainer
                      : c.title,
                ),
              ),
            ).map((option, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setFilterValue(option);
                  setShowDropdown(false);
                }}
                className="p-5 lg:p-6 border-b border-white/5 text-[10px] lg:text-[11px] font-black uppercase tracking-widest cursor-pointer hover:bg-gold hover:text-black transition-all"
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-8 mt-2 pb-10">
        {classes
          .filter((c) => {
            if (!filterValue) return true;
            if (subTab === "date") return c.date === filterValue;
            if (subTab === "instructor") return c.trainer === filterValue;
            if (subTab === "class") return c.title === filterValue;
            return true;
          })
          .map((c) => {
            const isBooked =
              currentUser?.bookedClasses?.includes(c.id) || false;

            // Waitlist calculations
            const waitlistForClass = classWaitlists
              .filter(w => w.schedule_id === c.id && w.status === 'waiting')
              .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());

            const isWaitlisted = waitlistForClass.some(w => w.member_id === currentUser?.id);
            const waitlistPosition = waitlistForClass.findIndex(w => w.member_id === currentUser?.id) + 1;
            const isFull = c.spots_left <= 0;

            return (
              <ClassCard
                key={c.id}
                session={c}
                isBooked={isBooked}
                isWaitlisted={isWaitlisted}
                isFull={isFull}
                waitlistPosition={waitlistPosition}
                isProcessing={processingId === c.id}
                onAction={() => handleAction(c.id, isBooked, isWaitlisted, isFull)}
              />
            );
          })}
      </div>
    </div>
  );
}

function ClassCard({ session, isBooked, isWaitlisted, isFull, waitlistPosition, onAction, isProcessing }: any) {
  const { config } = useBranding();
  return (
    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 group shadow-2xl transition-all hover:border-gold/30 hover:scale-[1.02] bg-black/40 backdrop-blur-md">
      <img
        src={session.image}
        alt={session.title}
        className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale transition-all duration-1000 group-hover:scale-110 group-hover:opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/70 to-transparent" />

      <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-7xl lg:text-8xl font-black text-white/[0.03] tracking-tighter rotate-[-90deg] pointer-events-none uppercase">
        {session.watermark || "UNIT"}
      </div>

      <div className="relative p-6 lg:p-10 z-10 flex flex-col h-full gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-[8px] lg:text-[9px] text-gold tracking-[0.4em] uppercase font-black italic">TACTICAL UNIT ID: {session.id.slice(0, 8)}</span>
          <h3 className="font-heading text-xl lg:text-3xl tracking-tight leading-none text-white uppercase italic">
            {session.title}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-3 border border-white/10 text-center group-hover:bg-white/10 transition-colors">
            <p className="text-[7px] text-white/30 mb-1 uppercase tracking-widest font-black italic">
              UNIT LDR
            </p>
            <p className="text-[10px] font-black text-white truncate uppercase italic">
              {session.trainer.split(' ')[0]}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-3 border border-white/10 text-center group-hover:bg-white/10 transition-colors">
            <p className="text-[7px] text-white/30 mb-1 uppercase tracking-widest font-black italic">
              DEPLOY
            </p>
            <p className="text-[10px] font-black text-gold uppercase italic">{session.time}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-3 border border-white/10 text-center group-hover:bg-white/10 transition-colors">
            <p className="text-[7px] text-white/30 mb-1 uppercase tracking-widest font-black italic">
              OPS DUR
            </p>
            <p className="text-[10px] font-black text-white uppercase italic">{session.duration}</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-white/10 mt-auto">
          <div className="flex flex-col">
            {isWaitlisted ? (
              <p className="text-[9px] text-orange-400 font-black tracking-[0.2em] uppercase italic">
                STANDBY POS: {waitlistPosition}
              </p>
            ) : isFull ? (
              <p className="text-[9px] text-red-500 font-black tracking-[0.2em] uppercase italic">
                CAPACITY REACHED
              </p>
            ) : (
              <p className="text-[9px] text-gold font-black tracking-[0.2em] uppercase italic animate-pulse">
                {session.spots_left} UNITS REMAINING
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isBooked && (
              <button
                onClick={() => {
                  const start = new Date(`${session.date}T${session.time}`);
                  const durationMins = parseInt(session.duration) || 60;
                  const end = new Date(start.getTime() + durationMins * 60000);
                  downloadIcsFile({
                    id: session.id,
                    title: session.title,
                    description: `Training session with ${session.trainer}`,
                    location: config.name,
                    startTime: start,
                    endTime: end
                  }, `class-${session.id}`, config.name, config.contact.email.split('@')[1]);
                }}
                className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                title="Add to Calendar"
              >
                <CalendarIcon size={14} />
              </button>
            )}
            <button
              onClick={onAction}
              disabled={isProcessing}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all shadow-2xl active:scale-95 ${isProcessing ? "opacity-50 cursor-not-allowed" : ""} ${isBooked || isWaitlisted
                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                : isFull
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "bg-gold text-black hover:bg-white"
                }`}
            >
              {isProcessing ? "SYNC..." : isBooked ? "ABORT" : isWaitlisted ? "ABORT STANDBY" : isFull ? "JOIN STANDBY" : "ENGAGE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
