import React from "react";
import { Dumbbell, Plus, X, Save } from "lucide-react";

interface Props {
  workouts: any[];
  logWorkout: (date: string, notes: string, exercises: any[]) => Promise<void>;
}

export default function WorkoutsPanel({ workouts, logWorkout }: Props) {
  const [isLogging, setIsLogging] = React.useState(false);
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = React.useState("");
  const [exercises, setExercises] = React.useState([{ id: Date.now(), exercise_name: "", sets: 0, reps: 0, weight: 0, completed: true }]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddExercise = () => {
    setExercises([...exercises, { id: Date.now(), exercise_name: "", sets: 0, reps: 0, weight: 0, completed: true }]);
  };

  const handleRemoveExercise = (id: number) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleUpdateExercise = (id: number, field: string, value: any) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cleanExercises = exercises
        .filter(ex => ex.exercise_name.trim() !== "")
        .map(ex => ({
          exercise_name: ex.exercise_name,
          sets: Number(ex.sets),
          reps: Number(ex.reps),
          weight: Number(ex.weight),
          completed: ex.completed,
        }));
      await logWorkout(date, notes, cleanExercises);
      setIsLogging(false);
      setNotes("");
      setExercises([{ id: Date.now(), exercise_name: "", sets: 0, reps: 0, weight: 0, completed: true }]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLogging) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-heading text-white uppercase italic">Log Workout</h3>
          <button type="button" onClick={() => setIsLogging(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm outline-none focus:border-[#FFB800]/50 transition-all font-bold uppercase color-scheme-dark" />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1 flex justify-between items-center">
              <span>Exercises</span>
              <button type="button" onClick={handleAddExercise} className="text-[#FFB800] flex items-center gap-1 hover:text-white transition-colors">
                <Plus size={12} /> Add
              </button>
            </label>

            {exercises.map((ex) => (
              <div key={ex.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 relative group">
                <button type="button" onClick={() => handleRemoveExercise(ex.id)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <X size={10} />
                </button>
                <input type="text" placeholder="Exercise Name (e.g. Bench Press)" value={ex.exercise_name} onChange={(e) => handleUpdateExercise(ex.id, "exercise_name", e.target.value)} required className="w-full bg-black/20 border border-white/5 p-3 rounded-xl text-xs outline-none focus:border-[#FFB800]/50 transition-all font-bold placeholder:text-white/20 uppercase" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 uppercase font-black tracking-widest pl-1">Sets</label>
                    <input type="number" min="0" value={ex.sets} onChange={(e) => handleUpdateExercise(ex.id, "sets", e.target.value)} className="w-full bg-black/20 border border-white/5 p-3 rounded-xl text-xs text-center outline-none focus:border-[#FFB800]/50 transition-all font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 uppercase font-black tracking-widest pl-1">Reps</label>
                    <input type="number" min="0" value={ex.reps} onChange={(e) => handleUpdateExercise(ex.id, "reps", e.target.value)} className="w-full bg-black/20 border border-white/5 p-3 rounded-xl text-xs text-center outline-none focus:border-[#FFB800]/50 transition-all font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-gray-500 uppercase font-black tracking-widest pl-1">Weight</label>
                    <input type="number" min="0" step="0.5" value={ex.weight} onChange={(e) => handleUpdateExercise(ex.id, "weight", e.target.value)} className="w-full bg-black/20 border border-white/5 p-3 rounded-xl text-xs text-center outline-none focus:border-[#FFB800]/50 transition-all font-bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Notes (Optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel?" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm outline-none focus:border-[#FFB800]/50 h-24 resize-none transition-all font-bold placeholder:text-white/10" />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-[#FFB800] text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-2xl hover:bg-white transition-all flex items-center justify-center gap-2">
          {isSubmitting ? "Saving..." : <><Save size={16} /> Save Session</>}
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => setIsLogging(true)} className="w-full py-5 bg-white/5 border border-white/10 text-[#FFB800] font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl hover:bg-[#FFB800] hover:text-black transition-all flex items-center justify-center gap-3 group border-dashed">
        <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Start New Workout
      </button>

      {workouts.length === 0 ? (
        <div className="p-10 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-50">
          <Dumbbell size={48} className="text-white/20 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-center">No workouts logged yet. Time to lift!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1">Training History</h3>
          <div className="space-y-4">
            {workouts.map((w: any) => (
              <div key={w.id} className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFB800]/10 flex items-center justify-center">
                      <Dumbbell size={18} className="text-[#FFB800]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm tracking-widest uppercase">{new Date(w.date).toLocaleDateString()}</p>
                      <p className="text-gray-500 text-[9px] uppercase font-black tracking-widest">{w.exercises?.length || 0} Exercises</p>
                    </div>
                  </div>
                </div>
                {w.exercises && w.exercises.length > 0 && (
                  <div className="space-y-2">
                    {w.exercises.map((ex: any) => (
                      <div key={ex.id} className="flex justify-between items-center bg-black/20 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/80">{ex.exercise_name}</span>
                        <span className="text-[#FFB800]">{ex.sets}x{ex.reps} @ {ex.weight}</span>
                      </div>
                    ))}
                  </div>
                )}
                {w.notes && (
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest italic pt-2 border-t border-white/5">
                    "{w.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
