
import React, { useState } from 'react';
import { 
  Play, Calendar, Flame, Trophy, ClipboardList, MessageCircle, 
  Sparkles, Smartphone, Dumbbell as DumbbellIcon, TrendingUp, 
  TrendingDown, Clock, Target, X, CheckCircle2, ChevronRight,
  BarChart3, History
} from 'lucide-react';
import { useStore } from '../store';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const Dashboard: React.FC = () => {
  const { language, profile, activeProgram, startSession, setActiveTab, managedTrainees, logs, weightHistory } = useStore();
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  const traineeData = managedTrainees.find(t => t.id === profile?.id);
  const inspirationImg = traineeData?.inspiration_image;

  const handleDownloadWallpaper = () => {
    if (!inspirationImg) return;
    const link = document.createElement('a');
    link.href = inspirationImg;
    link.download = `my-fitness-goal-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const today = new Date();
  const dayName = today.toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', { weekday: 'long' });

  const totalVolume = logs.filter(l => l.trainee_id === profile?.id).reduce((acc, curr) => acc + curr.volume, 0);
  const totalWorkouts = logs.filter(l => l.trainee_id === profile?.id).length;

  const stats = [
    { 
      id: 'sessions',
      label: t('جلسات', 'Sessions'), 
      value: totalWorkouts || 24, 
      unit: t('جلسه', 'Sets'),
      icon: Calendar, 
      color: 'indigo',
      detail: t('۸ جلسه اخیر', '8 recent'),
      trend: <TrendingUp size={10} className="text-emerald-400" />
    },
    { 
      id: 'volume',
      label: t('حجم کل', 'Volume'), 
      value: (totalVolume || 1240).toLocaleString(), 
      unit: t('kg', 'kg'),
      icon: Trophy, 
      color: 'emerald',
      detail: t('+۱۰٪ رشد', '+10% up'),
      trend: <TrendingUp size={10} className="text-emerald-400" />
    },
    { 
      id: 'weight',
      label: t('وزن', 'Weight'), 
      value: weightHistory[weightHistory.length - 1]?.weight || '--', 
      unit: t('kg', 'kg'),
      icon: Flame, 
      color: 'rose',
      detail: t('-۲.۴kg کات', '-2.4kg cut'),
      trend: <TrendingDown size={10} className="text-emerald-400" />
    },
    { 
      id: 'streak',
      label: t('استمرار', 'Pulse'), 
      value: '3', 
      unit: t('از ۵', '/ 5'),
      icon: Play, 
      color: 'amber',
      detail: t('هدف: ۴ روز', 'Goal: 4d'),
      trend: <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
    },
  ];

  const renderModalContent = () => {
    switch (selectedStat) {
      case 'sessions':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <History size={20} className="text-indigo-400" />
              {t('تاریخچه جلسات اخیر', 'Recent Sessions History')}
            </h3>
            <div className="space-y-2">
              {logs.filter(l => l.trainee_id === profile?.id).slice(0, 5).map((log, idx) => (
                <div key={idx} className="bg-slate-800/40 p-4 rounded-2xl flex justify-between items-center border border-slate-700/30">
                  <div>
                    <p className="font-bold text-white text-sm">{log.workout_name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(log.date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-400 font-black text-sm">{log.duration} {t('دقیقه', 'min')}</p>
                    <p className="text-[10px] text-slate-600 font-bold">{log.volume.toLocaleString()} kg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'volume':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-emerald-400" />
              {t('آنالیز حجم تمرینات', 'Training Volume Analysis')}
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logs.filter(l => l.trainee_id === profile?.id).slice(0, 7).reverse()}>
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#10b981" fillOpacity={1} fill="url(#colorVol)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-400 text-center">{t('روند حجم جابجا شده در ۷ جلسه اخیر', 'Volume trend over last 7 sessions')}</p>
          </div>
        );
      case 'weight':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <TrendingDown size={20} className="text-rose-400" />
              {t('تغییرات وزن بدنی', 'Body Weight Changes')}
            </h3>
            <div className="space-y-2">
              {weightHistory.slice(-5).reverse().map((w, idx) => (
                <div key={idx} className="bg-slate-800/40 p-4 rounded-2xl flex justify-between items-center border border-slate-700/30">
                  <p className="text-slate-400 text-xs font-bold">{w.date}</p>
                  <p className="text-white font-black text-lg">{w.weight} <small className="text-[10px] text-slate-500">KG</small></p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'streak':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Flame size={20} className="text-amber-400" />
              {t('استمرار و اهداف هفتگی', 'Consistency & Weekly Goals')}
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {['S', 'S', 'M', 'T', 'W', 'T', 'F'].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500">{day}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${idx < 3 ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-800 text-slate-700'}`}>
                    {idx < 3 ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mt-4">
              <p className="text-xs text-amber-200 leading-relaxed font-bold">
                {t('۳ روز استمرار ثبت شده است. ۲ روز دیگر تا دریافت نشان "ثبات قدم" باقی مانده!', '3-day streak active. 2 more days to earn the "Consistency Medal"!')}
              </p>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white italic tracking-tight">
            {t(`${profile?.full_name} عزیز خوش آمدی`, `Welcome back, ${profile?.full_name}`)}
          </h1>
          <p className="text-slate-400 mt-0.5 text-xs font-medium flex items-center gap-2">
            <Calendar size={14} className="text-indigo-400" />
            {dayName}، {today.toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}
          </p>
        </div>
      </header>

      {/* Compact 2x2 Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-1">
        {stats.map((stat, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedStat(stat.id)}
            className="bg-slate-900/60 p-4 rounded-[1.8rem] border border-slate-800/80 flex flex-col gap-1 shadow-xl hover:border-indigo-500/30 active:scale-[0.97] transition-all text-right group relative overflow-hidden h-32 justify-between"
          >
            <div className="flex justify-between items-center mb-1">
              <div className={`p-1.5 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                <stat.icon size={16} />
              </div>
              <div className="flex items-center gap-1">
                {stat.trend}
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{stat.value}</span>
                <span className="text-[10px] font-bold text-slate-500">{stat.unit}</span>
              </div>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* AI Inspiration Hero */}
      {inspirationImg && (
        <section className="mx-1 relative h-[300px] lg:h-[400px] rounded-[2.5rem] overflow-hidden group shadow-2xl border border-indigo-500/20">
           <img src={inspirationImg} className="w-full h-full object-cover" alt="AI Inspiration" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
           <div className="absolute top-4 right-4">
              <div className="bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 text-white border border-white/20">
                 <Sparkles size={14} className="text-amber-300" />
                 <span className="text-[8px] font-black tracking-widest uppercase">{t('آینده تو', 'FUTURE')}</span>
              </div>
           </div>
           
           <div className="absolute bottom-6 inset-x-6 flex flex-col md:flex-row items-end justify-between gap-4">
              <div className="space-y-1 text-right">
                 <h2 className="text-xl md:text-3xl font-black text-white leading-tight italic drop-shadow-lg">
                    {t('فقط یک گام دیگر!', 'ONE REP AWAY.')}
                 </h2>
                 <p className="text-slate-300 font-bold text-[10px] md:text-sm drop-shadow-md">
                    {t('نسترن معتقد است شما به این نسخه می‌رسید.', 'Nastaran sees your potential.')}
                 </p>
              </div>
              <button 
                onClick={handleDownloadWallpaper}
                className="bg-white text-slate-950 p-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shrink-0"
              >
                <Smartphone size={18} />
                <span className="text-[10px] font-black uppercase">{t('والپیپر', 'Download')}</span>
              </button>
           </div>
        </section>
      )}

      {/* Protocol Section */}
      <div className="space-y-4 px-1">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <DumbbellIcon size={18} className="text-indigo-400" />
            <h2 className="text-lg font-black text-white">{t('پروتکل امروز', "Today's Routine")}</h2>
          </div>
          <button 
            onClick={() => setActiveTab('exercises')}
            className="text-indigo-400 text-[10px] font-black uppercase tracking-widest"
          >
            {t('مشاهده کل', 'Full')}
          </button>
        </div>
        
        {activeProgram?.workout_days?.[0] ? (
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-950 p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/20">
                    {activeProgram.workout_days[0].focus}
                  </span>
                </div>

                <h3 className="text-2xl font-black mt-4 italic tracking-tighter">
                  {language === 'fa' ? activeProgram.workout_days[0].name_fa : activeProgram.workout_days[0].name_en}
                </h3>

                <div className="flex gap-6 mt-6 mb-8">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-indigo-300 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} />
                      {t('مدت', 'Dur')}
                    </span>
                    <span className="font-black text-xl">۶۰ <small className="text-[10px] opacity-70">{t('دقیقه', 'دقیقه')}</small></span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-r border-white/10 pr-6">
                    <span className="text-indigo-300 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                      <DumbbellIcon size={10} />
                      {t('حرکات', 'Total')}
                    </span>
                    <span className="font-black text-xl">{activeProgram.workout_days[0].exercises?.length || 0}</span>
                  </div>
                </div>

                <button 
                  onClick={() => startSession(activeProgram.workout_days![0].id)}
                  className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
                >
                  <Play size={16} fill="currentColor" />
                  <span className="text-sm font-black">{t('آغاز جلسه تمرینی', 'Launch Session')}</span>
                </button>
              </div>
              <DumbbellIcon className="absolute -bottom-8 -left-8 w-40 h-40 text-white/5 rotate-12" />
            </div>

            <div className="bg-slate-900/40 p-5 rounded-[2.2rem] border border-slate-800/80">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-3">{t('لیست حرکات', 'Ex List')}</h4>
              <div className="space-y-2">
                {activeProgram.workout_days[0].exercises?.map((ex, idx) => (
                  <div key={idx} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30 flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-indigo-400 font-black text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white text-xs truncate">{language === 'fa' ? ex.exercise?.name_fa : ex.exercise?.name_en}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{ex.sets} ست × {ex.reps} تکرار</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border-2 border-dashed border-slate-800 p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4">
            <ClipboardList className="text-slate-800" size={48} />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">{t('در انتظار طراحی', 'Crafting Routine')}</h3>
              <p className="text-slate-600 text-xs font-medium">
                {t('نسترن در حال طراحی برنامه شماست.', 'Nastaran is designing your protocol.')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Stat Modal */}
      {selectedStat && (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 lg:p-0 lg:items-center">
          <div className="bg-slate-900 w-full max-w-lg rounded-t-[3rem] lg:rounded-[3rem] border-t lg:border border-slate-800 shadow-2xl animate-in slide-in-from-bottom-full lg:slide-in-from-bottom-0 duration-500 overflow-hidden">
            <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
               <div>
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t('جزئیات آماری', 'STAT DETAILS')}</h4>
                  <p className="text-xl font-black text-white">{stats.find(s => s.id === selectedStat)?.label}</p>
               </div>
               <button onClick={() => setSelectedStat(null)} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white">
                 <X size={20} />
               </button>
            </header>
            <div className="p-8 pb-12">
              {renderModalContent()}
              <button 
                onClick={() => setSelectedStat(null)}
                className="w-full mt-8 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm active:scale-95 transition-all"
              >
                {t('بستن', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
