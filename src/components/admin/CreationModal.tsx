import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

type CreationMode = "member" | "coach" | "class";

interface Props {
  mode: CreationMode;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

function Select({ name, options }: { name: string; options: string[] }) {
  return (
    <div className="relative group">
      <select
        name={name}
        className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm outline-none text-white appearance-none uppercase tracking-widest cursor-pointer focus:border-gold/30 transition-all font-bold"
      >
        {options.map((opt) => (
          <option key={opt} className="bg-black" value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-gold rotate-90 transition-colors pointer-events-none" />
    </div>
  );
}

export default function CreationModal({ mode, onClose, onSubmit }: Props) {
  return (
    <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <motion.form
        onSubmit={onSubmit}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-card rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 w-full max-w-lg flex flex-col gap-6 lg:gap-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/10 max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{ background: "rgba(20, 20, 20, 0.8)" }}
      >
        <div className="text-center font-bold">
          <h2 className="text-2xl lg:text-3xl font-heading tracking-[0.2em] uppercase text-white mb-2">
            {mode === "member"
              ? "Initialize Entity"
              : mode === "coach"
                ? "Recruit Instructor"
                : "Deploy Class"}
          </h2>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold/60 font-bold">
            New Registry Entry
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:gap-6">
          {mode === "member" && (
            <>
              <input name="name" required placeholder="FULL NAME" className="form-input" />
              <input name="email" type="email" required placeholder="EMAIL ADDRESS" className="form-input" />
              <Select name="tier" options={["High Performance", "Fuel Plan", "Holistic Flow"]} />
            </>
          )}
          {mode === "coach" && (
            <>
              <input name="name" required placeholder="COACH NAME" className="form-input" />
              <input name="email" type="email" required placeholder="COACH EMAIL" className="form-input" />
              <input name="specialty" required placeholder="SPECIALTY" className="form-input" />
              <textarea name="bio" placeholder="BIOGRAPHY" className="form-input h-24 pt-4 lg:pt-6 resize-none" />
            </>
          )}
          {mode === "class" && (
            <>
              <input name="title" required placeholder="CLASS NAME" className="form-input" />
              <input name="trainer" required placeholder="INSTRUCTOR NAME" className="form-input" />
              <input name="time" required placeholder="TIME (e.g. 12:00 PM)" className="form-input" />
              <input name="spots" type="number" required placeholder="CAPACITY" className="form-input" />
              <Select name="category" options={["Strength", "Cardio", "Yoga", "HIIT"]} />
            </>
          )}
        </div>

        <div className="flex gap-4 lg:gap-6 pt-2 lg:pt-4 font-bold">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 text-white/20 uppercase text-[10px] font-bold tracking-[0.3em] hover:text-white transition-colors"
          >
            Abort
          </button>
          <button
            type="submit"
            className="premium-button flex-1 h-14 rounded-2xl text-black font-black tracking-[0.3em] uppercase text-[10px] shadow-2xl shadow-gold/20"
          >
            Confirm Deployment
          </button>
        </div>
      </motion.form>
    </div>
  );
}
