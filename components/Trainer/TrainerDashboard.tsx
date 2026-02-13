
import React, { useState, useMemo } from 'react';
import { Users, Activity, AlertCircle, CheckCircle2, ChevronRight, MessageSquare, Search, X, Calendar, ArrowRight, Trash2, TrendingUp } from 'lucide-react';
import { useStore } from '../../store';

const TrainerDashboard: React.FC = () => {
  const { language, managedTrainees, setSelectedTrainee, setActiveTab, unreadMessagesCount, alerts, dailyWorkouts, dismissAlert, resetUnreadCount, logs } = useStore();
  const [drilldown, setDrilldown] = useState<'workouts' | 'alerts' | null>(null);
  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  // Team Consistency Heatmap
  const teamHeatmap = useMemo(() => {
    const days = 35; 
    const data = [];
    const logDates = new Map<string, number>();
    logs.forEach(l => {
      const d = new Date(l.date).toDateString();
      logDates.set(d, (logDates.get(d) || 0) + 1);
    });

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const count = logDates.get(date.toDateString()) || 0;
      data.push({ date, intensity: Math.min(count, 4) });
    }
    return data;
  }, [logs]);

  const stats = [
    { id: 'trainees', label: t('کل شاگردان', 'Total Trainees'), value: managedTrainees.length, icon: Users, color: 'indigo' },
    { id: 'workouts', label: t('تمرینات امروز', 'Workouts Today'), value: dailyWorkouts.length, icon: Activity, color: 'emerald' },
    { id: 'alerts', label: t('هشدارها', 'Alerts'), value: alerts.length, icon: AlertCircle, color: 'rose' },
    { id: 'messages', label: t('پیام‌های جدید', 'Unread Msgs'), value: unreadMessagesCount, icon: MessageSquare, color: 'amber' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <button 
            key={i} 
            className="bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700/50 flex flex-col items-start gap-2 hover:border-indigo-500/50 transition-all text-right group relative overflow-hidden"
          >
            <div className={`p-3 rounded-2xl bg-${s.color}-500/10 text-${s.color}-500`}>
              <s.icon size={24} />
            </div>
            <span className="text-3xl font-black text-white mt-2">{s.value}</span>
            <span className="text-xs text-slate-400 font-black uppercase tracking-widest">{s.label}</span>
          </button>
        ))}
      </div>

      <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
        <h3 className="font-black text-white flex items-center gap-3 italic">
          <TrendingUp size={20} className="text-emerald-400" />
          {t('نبض تمرینی تیم (۳۵ روز)', 'Team Training Pulse (35d)')}
        </h3>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
          {Array.from({ length: 5 }).map((_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1.5">
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const dayData = teamHeatmap[weekIdx * 7 + dayIdx];
                const intensityClass = dayData?.intensity === 0 ? 'bg-slate-800' :
                                      dayData?.intensity === 1 ? 'bg-emerald-900' :
                                      dayData?.intensity === 2 ? 'bg-emerald-700' :
                                      dayData?.intensity === 3 ? 'bg-emerald-500' : 'bg-emerald-400 scale-110';
                return (
                  <div key={dayIdx} className={`w-4 h-4 rounded-md transition-all ${intensityClass}`} />
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        <h2 className="text-2xl font-black italic text-white uppercase">{t('شاگردان', 'Athletes')}</h2>
        <div className="grid gap-4">
          {managedTrainees.map((trainee) => (
            <button 
              key={trainee.id}
              onClick={() => setSelectedTrainee(trainee.id)}
              className="bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800/60 flex items-center justify-between group hover:border-amber-500/50 transition-all text-right w-full"
            >
              <div className="flex items-center gap-5 text-left">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-white border border-white/5 overflow-hidden">
                   {trainee.avatar_data ? <img src={trainee.avatar_data} className="w-full h-full object-cover" /> : trainee.full_name[0]}
                </div>
                <div>
                  <h3 className="font-black text-lg text-white group-hover:text-amber-400 transition-colors">{trainee.full_name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-black">{trainee.active_program_name || 'No Protocol'}</p>
                </div>
              </div>
              <ChevronRight className={language === 'fa' ? '' : 'rotate-180'} size={24} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
