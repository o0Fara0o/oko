
import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, AreaChart, Area
} from 'recharts';
import { useStore } from '../store';
import { TrendingDown, TrendingUp, Info, Plus, Target, Sparkles, Calendar, Zap, AlertTriangle, ChevronRight, Image as ImageIcon } from 'lucide-react';

const Progress: React.FC = () => {
  const { language, weightHistory, logs, addWeight, profile, managedTrainees } = useStore();
  const [newWeight, setNewWeight] = useState('');
  
  const t = (fa: string, en: string) => language === 'fa' ? fa : en;
  const traineeData = managedTrainees.find(t => t.id === profile?.id);

  // 1. Progressive Overload Velocity Data
  const velocityData = useMemo(() => {
    const data = logs.slice(0, 10).reverse().map((log, i, arr) => {
      const prevVol = arr[i-1]?.volume || log.volume;
      const velocity = ((log.volume - prevVol) / prevVol) * 100;
      return {
        name: `S${i+1}`,
        velocity: parseFloat(velocity.toFixed(1)),
        volume: log.volume
      };
    });
    return data;
  }, [logs]);

  const isPlateauing = velocityData.length > 3 && velocityData.slice(-3).every(d => d.velocity <= 0);

  // 2. Training Frequency Heatmap Data (Last 90 Days)
  const heatmapData = useMemo(() => {
    const days = 91; 
    const data = [];
    const logDates = new Set(logs.map(l => new Date(l.date).toDateString()));
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date,
        active: logDates.has(date.toDateString()),
        dayIndex: date.getDay() 
      });
    }
    return data;
  }, [logs]);

  // 3. Muscle Distribution Radar
  const muscleDistribution = useMemo(() => [
    { subject: t('سینه', 'Chest'), A: 85 },
    { subject: t('پشت', 'Back'), A: 70 },
    { subject: t('پا', 'Legs'), A: 95 },
    { subject: t('شانه', 'Shoulders'), A: 60 },
    { subject: t('بازو', 'Arms'), A: 80 },
    { subject: t('شکم', 'Core'), A: 50 },
  ], [language]);

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    addWeight(parseFloat(newWeight));
    setNewWeight('');
  };

  return (
    <div className="space-y-8 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic">{t('تحلیل پیشرفت هوشمند', 'Insight Engine')}</h1>
          <p className="text-slate-400 font-medium">{t('آنالیز عملکرد بیومکانیکی و تغییرات فیزیکی', 'Biomechanical performance & body analysis')}</p>
        </div>
        <form onSubmit={handleWeightSubmit} className="flex gap-2">
          <input 
            type="number" 
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder={t('وزن جدید (kg)', 'New weight (kg)')}
            className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none w-36 font-black text-white shadow-xl"
          />
          <button type="submit" className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-90">
            <Plus size={24} />
          </button>
        </form>
      </header>

      {/* Heatmap Section */}
      <section className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-white flex items-center gap-3 italic">
            <Calendar size={20} className="text-indigo-400" />
            {t('نقشه حرارتی استمرار', 'Consistency Heatmap')}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('کم', 'Less')}</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-slate-800 rounded-sm" />
              <div className="w-3 h-3 bg-indigo-900 rounded-sm" />
              <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
              <div className="w-3 h-3 bg-indigo-400 rounded-sm" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('زیاد', 'More')}</span>
          </div>
        </div>
        
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2">
          {Array.from({ length: 13 }).map((_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const dayData = heatmapData[weekIdx * 7 + dayIdx];
                return (
                  <div 
                    key={dayIdx}
                    title={dayData?.date.toDateString()}
                    className={`w-3.5 h-3.5 rounded-sm transition-all duration-500 ${
                      dayData?.active 
                        ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)] scale-105' 
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Velocity Chart */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="font-black text-white flex items-center gap-2 italic">
                <Zap size={20} className="text-amber-400" />
                {t('سرعت بارگذاری تدریجی', 'Overload Velocity')}
              </h3>
            </div>
            {isPlateauing && (
              <div className="bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl flex items-center gap-2 animate-bounce">
                <AlertTriangle size={12} className="text-rose-500" />
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{t('هشدار استاپ', 'Plateau Alert')}</span>
              </div>
            )}
          </div>

          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} />
                <Area type="monotone" dataKey="velocity" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorVel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual Delta */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden group">
          <h3 className="font-black text-white flex items-center gap-2 italic">
            <Sparkles size={20} className="text-purple-400" />
            {t('تغییرات فیزیکی (دلتا)', 'Visual Transformation Delta')}
          </h3>
          <div className="grid grid-cols-2 gap-4 h-64">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800">
              <img src={profile?.reference_images?.front || "https://picsum.photos/seed/start/400/600"} className="w-full h-full object-cover grayscale opacity-60" alt="Baseline" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex items-end p-4">
                <span className="text-[10px] font-black text-white uppercase">{t('شروع مسیر', 'START')}</span>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden border-2 border-indigo-500">
              <img src={traineeData?.inspiration_image || "https://picsum.photos/seed/vision/400/600"} className="w-full h-full object-cover" alt="Current/Vision" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 to-transparent flex items-end p-4">
                <span className="text-[10px] font-black text-white uppercase">{t('چشم‌انداز هدف', 'VISION')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Radar Balance */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
          <h3 className="font-black text-white flex items-center gap-2">
            <Target size={18} className="text-rose-500" />
            {t('توازن عضلانی', 'Muscle Balance')}
          </h3>
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

        {/* Traditional Weight Trend */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl lg:col-span-2 space-y-6">
          <h3 className="font-black text-white flex items-center gap-2">
            <TrendingDown size={18} className="text-indigo-500" />
            {t('تغییرات وزن بدنی', 'Body Weight Trend')}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
