import React from "react";

interface DailyScheduleViewProps {
  classes: any[];
}

export default function DailyScheduleView({ classes }: DailyScheduleViewProps) {
  const todayStr = new Date().toLocaleDateString();
  const todayClasses = classes.filter(c => c.date === todayStr);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1 mb-2">
        <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
          Active Sessions (Today)
        </h3>
        <span className="text-[9px] text-[#FFB800] font-black uppercase tracking-widest">
          {todayClasses.length} {todayClasses.length === 1 ? 'Class' : 'Classes'}
        </span>
      </div>
      {todayClasses.length > 0 ? (
        todayClasses.map(c => (
          <div key={c.id} className="p-5 bg-white/5 rounded-3xl border border-white/10 group cursor-pointer hover:border-[#FFB800]/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] text-[#FFB800] font-black uppercase tracking-[0.3em]">
                {c.spots_left > 0 ? 'Open' : 'Full'}
              </span>
            </div>
            <p className="text-[#FFB800] text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              {c.time}
            </p>
            <h4 className="font-heading text-xl mb-1 text-white uppercase tracking-tight">
              {c.title}
            </h4>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
              {c.trainer} • {c.total_spots - c.spots_left}/{c.total_spots} Booked
            </p>
          </div>
        ))
      ) : (
        <div className="p-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic leading-relaxed">
            The training floor is clear. <br />No sessions currently registered for this cycle.
          </p>
        </div>
      )}
    </div>
  );
}
