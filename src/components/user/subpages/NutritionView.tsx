import React from "react";
import { TrendingUp, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface NutritionViewProps {
  currentUser: any;
  nutritionAssessments: any[];
}

export default function NutritionView({ currentUser, nutritionAssessments }: NutritionViewProps) {
  const assessments = nutritionAssessments
    .filter(a => a.member_id === currentUser?.id)
    .sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime())
    .map(a => ({
      ...a,
      formattedDate: new Date(a.assessment_date).toLocaleDateString([], { month: 'short', day: 'numeric' })
    }));

  const latestAssessment = assessments[assessments.length - 1];

  return (
    <div className="space-y-8">
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h4 className="font-black text-emerald-500 text-[10px] uppercase tracking-[0.4em] mb-4">
          Calculated Daily Target
        </h4>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-4xl font-heading text-white tracking-widest">
            {latestAssessment?.daily_calories_target || 2400}
          </span>
          <span className="text-xs text-emerald-500/60 font-black tracking-widest uppercase italic">
            KCAL
          </span>
        </div>
        <p className="text-[10px] text-white/40 font-black tracking-[0.2em] uppercase underline decoration-emerald-500/20">
          {latestAssessment?.protein_grams || 180}G PROTEIN • {latestAssessment?.carbs_grams || 220}G CARBS • {latestAssessment?.fats_grams || 80}G FATS
        </p>
      </div>

      {assessments.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-1 font-bold flex items-center gap-2">
            <TrendingUp size={12} className="text-[#FFB800]" /> Body Composition History
          </h3>
          <div className="p-4 bg-white/5 rounded-[2rem] border border-white/10 h-64">
            <ResponsiveContainer width="100%" minHeight={250}>
              <LineChart data={assessments}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="weight_kg" name="Weight (kg)" stroke="#FFB800" strokeWidth={3} dot={{ r: 4, fill: '#111', stroke: '#FFB800', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="body_fat_pct" name="Body Fat %" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#111', stroke: '#ef4444', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="muscle_mass_kg" name="Muscle (kg)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#111', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-xl font-heading text-[#FFB800]">{latestAssessment?.weight_kg || '-'}</span>
              <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-1">Weight kg</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-xl font-heading text-emerald-500">{latestAssessment?.muscle_mass_kg || '-'}</span>
              <span className="text-[8px] text-emerald-500/60 uppercase font-black tracking-widest mt-1">Muscle kg</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <span className="text-xl font-heading text-red-500">{latestAssessment?.body_fat_pct || '-'}</span>
              <span className="text-[8px] text-red-500/60 uppercase font-black tracking-widest mt-1">Fat %</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-50">
          <Info size={40} className="text-white/20 mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-center">No assessments found.<br />Book a session with a nutritionist.</p>
        </div>
      )}
    </div>
  );
}
