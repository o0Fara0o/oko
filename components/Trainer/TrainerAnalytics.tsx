
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, AreaChart, Area
} from 'recharts';
import { useStore } from '../../store';
import { 
  Users, TrendingUp, AlertCircle, CheckCircle2, 
  Target, Zap, AlertTriangle, DollarSign, 
  ArrowUpRight, PieChart, User
} from 'lucide-react';

const TrainerAnalytics: React.FC = () => {
  const { language, managedTrainees, logs } = useStore();
  const [selectedInsightTraineeId, setSelectedInsightTraineeId] = useState<string>(managedTrainees[0]?.id || '');
  
  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  // General Compliance Data
  const complianceData = managedTrainees.map(t => ({
    name: t.full_name.split(' ')[0],
    rate: t.compliance_rate
  }));

  // Selected Trainee Specific Insights (Moved from TraineeDetail)
  const selectedTrainee = managedTrainees.find(t => t.id === selectedInsightTraineeId);

  const velocityData = useMemo(() => {
    if (!selectedInsightTraineeId) return [];
    const traineeLogs = logs.filter(l => l.trainee_id === selectedInsightTraineeId).slice(0, 10).reverse();
    return traineeLogs.map((log, i, arr) => {
      const prevVol = arr[i-1]?.volume || log.volume;
      const velocity = ((log.volume - prevVol) / prevVol) * 100;
      return {
        name: `S${i+1}`,
        velocity: parseFloat(velocity.toFixed(1)),
        volume: log.volume
      };
    });
  }, [logs, selectedInsightTraineeId]);

  const muscleDistribution = useMemo(() => [
    { subject: t('سینه', 'Chest'), A: selectedInsightTraineeId === 'u1' ? 85 : 40 },
    { subject: t('پشت', 'Back'), A: selectedInsightTraineeId === 'u1' ? 70 : 85 },
    { subject: t('پا', 'Legs'), A: selectedInsightTraineeId === 'u1' ? 95 : 60 },
    { subject: t('شانه', 'Shoulders'), A: selectedInsightTraineeId === 'u1' ? 60 : 50 },
    { subject: t('بازو', 'Arms'), A: selectedInsightTraineeId === 'u1' ? 80 : 75 },
    { subject: t('شکم', 'Core'), A: selectedInsightTraineeId === 'u1' ? 50 : 90 },
  ], [selectedInsightTraineeId, language]);

  const isPlateauing = velocityData.length > 3 && velocityData.slice(-3).every(d => d.velocity <= 0);

  // Earning Calculator Logic
  const financialStats = useMemo(() => {
    const totalEarnings = managedTrainees.reduce((acc, t) => acc + (t.subscription?.price || 0), 0);
    const vipCount = managedTrainees.filter(t => t.subscription?.type === 'vip').length;
    const activeSubs = managedTrainees.filter(t => (t.subscription?.sessions_remaining || 0) > 0).length;
    return { totalEarnings, vipCount, activeSubs };
  }, [managedTrainees]);

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
             <PieChart className="text-indigo-500" size={32} />
             {t('مرکز تحلیل و فرماندهی', 'Data Command Center')}
          </h1>
          <p className="text-slate-400 font-medium mt-1">{t('آنالیز پیشرفته عملکرد تیم و شاخص‌های مالی', 'Advanced team performance & financial metrics')}</p>
        </div>
      </header>

      {/* Financial Earning Calculator */}
      <section className="bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-800 p-8 lg:p-12 rounded-[3rem] shadow-2xl space-y-10 relative overflow-hidden group">
         <div className="flex justify-between items-center relative z-10">
            <h3 className="text-2xl font-black text-white italic flex items-center gap-3">
               <DollarSign size={28} className="text-emerald-500" />
               {t('ماشین حساب درآمد و اشتراک‌ها', 'Earnings & Revenue Projection')}
            </h3>
            <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20">
               {t('بروزرسانی زنده', 'Live Forecast')}
            </div>
         </div>

         <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800 space-y-4 shadow-inner">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('درآمد کل فعال', 'Total Active Revenue')}</span>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-emerald-400 tabular-nums">{(financialStats.totalEarnings / 1000000).toFixed(1)}M</span>
                  <span className="text-xs font-bold text-slate-600">IRT</span>
               </div>
               <p className="text-[10px] text-slate-600 font-bold uppercase">{t('بر اساس اشتراک‌های جاری', 'Based on current subs')}</p>
            </div>

            <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800 space-y-4 shadow-inner">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('توزیع VIP', 'VIP Distribution')}</span>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-amber-500 tabular-nums">{financialStats.vipCount}</span>
                  <span className="text-xs font-bold text-slate-600">/ {managedTrainees.length} {t('ورزشکار', 'Athletes')}</span>
               </div>
               <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(financialStats.vipCount / managedTrainees.length) * 100}%` }} />
               </div>
            </div>

            <div className="bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800 space-y-4 shadow-inner">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('پتانسیل درآمد (تمدید)', 'Renewal Potential')}</span>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-indigo-400 tabular-nums">{managedTrainees.filter(t => (t.subscription?.sessions_remaining || 0) <= 3).length}</span>
                  <span className="text-xs font-bold text-slate-600">{t('در انتظار شارژ', 'Pending Renewal')}</span>
               </div>
               <p className="text-[9px] text-indigo-400/70 font-black uppercase tracking-widest flex items-center gap-1">
                  <ArrowUpRight size={10} />
                  {t('آماده تمدید در ۳ جلسه آینده', 'Ready in next 3 sessions')}
               </p>
            </div>
         </div>
      </section>

      {/* Trainee Insight Drilldown */}
      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Users size={14} />
                 {t('انتخاب شاگرد برای تحلیل', 'Select Insight Focus')}
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
                 {managedTrainees.map(trainee => (
                   <button 
                    key={trainee.id}
                    onClick={() => setSelectedInsightTraineeId(trainee.id)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border ${
                      selectedInsightTraineeId === trainee.id ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                   >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedInsightTraineeId === trainee.id ? 'bg-white/20' : 'bg-slate-900'}`}>
                         {trainee.full_name[0]}
                      </div>
                      <span className="font-black text-xs uppercase truncate">{trainee.full_name}</span>
                   </button>
                 ))}
              </div>
           </div>
        </aside>

        <div className="lg:col-span-3 space-y-8">
           <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden group">
              <div className="flex justify-between items-center pb-8 border-b border-slate-800/50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                       <Zap size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white italic">{t('تحلیل بیومکانیکی و سرعت حجم', 'Performance & Volume Insights')}</h3>
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">{selectedTrainee?.full_name}</p>
                    </div>
                 </div>
                 {isPlateauing && (
                   <div className="bg-rose-500/10 border border-rose-500 px-4 py-1.5 rounded-xl flex items-center gap-2">
                      <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{t('هشدار فلات', 'Plateau Detected')}</span>
                   </div>
                 )}
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">{t('روند سرعت بارگذاری (٪)', 'Overload Velocity Trend (%)')}</span>
                    <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={velocityData}>
                           <defs>
                             <linearGradient id="colorVelTrainerAnalytics" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                               <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <Tooltip cursor={{ stroke: '#f59e0b', strokeWidth: 2 }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                           <Area type="monotone" dataKey="velocity" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorVelTrainerAnalytics)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">{t('توازن عضلانی هدف', 'Muscle Balance Map')}</span>
                    <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={muscleDistribution}>
                           <PolarGrid stroke="#334155" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                           <Radar dataKey="A" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.5} />
                         </RadarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>

           {/* Global Compliance Chart (Moved below focused insight) */}
           <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] space-y-8 shadow-2xl">
              <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                 <Target size={24} className="text-indigo-400" />
                 {t('پایبندی کلی تیم به پروتکل‌ها', 'Overall Team Compliance')}
              </h3>
              <div className="h-64 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey="rate" radius={[12, 12, 0, 0]}>
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.rate > 80 ? '#10b981' : entry.rate > 50 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerAnalytics;
