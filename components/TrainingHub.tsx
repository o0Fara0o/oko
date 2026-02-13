
import React, { useState, useRef, useEffect } from 'react';
import { 
  QrCode, Camera, Scale, Save, Play, Clock, 
  Dumbbell, CheckCircle2, X, Info, ChevronRight, 
  BookOpen, ClipboardList, Search, PlayCircle, MapPin, Loader2
} from 'lucide-react';
import { useStore } from '../store';
import { Exercise } from '../types';

const TrainingHub: React.FC = () => {
  const { 
    language, profile, recordAttendance, attendance, 
    addWeight, activeProgram, startSession, exercises, gyms 
  } = useStore();
  
  const [hubStep, setHubStep] = useState<'check-in' | 'weight' | 'protocol' | 'library'>('check-in');
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(profile?.weight?.toString() || '');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const t = (fa: string, en: string) => language === 'fa' ? fa : en;
  const isPresent = attendance.some(a => a.trainee_id === profile?.id && a.status === 'present');

  useEffect(() => {
    if (isPresent) {
      setHubStep('protocol');
    } else {
      setHubStep('check-in');
    }
  }, [isPresent]);

  const startScan = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert(t('دسترسی به دوربین امکان‌پذیر نیست', 'Camera access denied'));
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const simulateCheckIn = async () => {
    if (!profile) return;
    
    // Simulate Geolocation verification
    setIsVerifyingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, compare position with gym coordinates
          console.log("Verified location:", position.coords.latitude, position.coords.longitude);
          recordAttendance(profile.id, gyms[0]?.id || 'gym-1', 'enter');
          setHubStep('weight');
          stopScan();
          setIsVerifyingLocation(false);
        },
        (error) => {
          console.error("Location error:", error);
          // For demo purposes, we'll allow it anyway if user denies, but alert
          alert(t('مکان شما تایید نشد، اما برای دمو ورود ثبت شد.', 'Location not verified, but logged for demo.'));
          recordAttendance(profile.id, gyms[0]?.id || 'gym-1', 'enter');
          setHubStep('weight');
          stopScan();
          setIsVerifyingLocation(false);
        }
      );
    } else {
      recordAttendance(profile.id, gyms[0]?.id || 'gym-1', 'enter');
      setHubStep('weight');
      stopScan();
      setIsVerifyingLocation(false);
    }
  };

  const handleWeightSubmit = () => {
    const weightVal = parseFloat(currentWeight);
    if (!isNaN(weightVal)) {
      addWeight(weightVal);
      setHubStep('protocol');
    }
  };

  const renderStep = () => {
    switch (hubStep) {
      case 'check-in':
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-800 space-y-8 animate-in fade-in zoom-in-95">
             <div className="relative">
                <div className="w-32 h-32 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 animate-pulse">
                   <QrCode size={64} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                   <span className="text-[10px] font-black text-white">1</span>
                </div>
             </div>
             <div className="text-center space-y-2 px-6">
                <h2 className="text-2xl font-black text-white">{t('ورود به باشگاه', 'Check-in Required')}</h2>
                <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
                  {t('برای شروع پروتکل تمرینی امروز، ابتدا حضور خود را در شعبه تایید کنید.', 'Verify your presence at the branch to unlock today\'s routine.')}
                </p>
             </div>
             <button 
              onClick={startScan}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3"
             >
               <Camera size={24} />
               {t('اسکن کد QR', 'Scan QR Code')}
             </button>
          </div>
        );

      case 'weight':
        return (
          <div className="bg-slate-900/60 border border-slate-800 p-10 rounded-[3rem] space-y-8 animate-in slide-in-from-bottom-4 shadow-2xl">
             <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-amber-500/10 rounded-[1.5rem] flex items-center justify-center text-amber-500 mx-auto">
                   <Scale size={40} />
                </div>
                <h2 className="text-2xl font-black text-white italic">{t('وزن‌کشی پیش از تمرین', 'Pre-Workout Ritual')}</h2>
                <p className="text-slate-500 text-sm font-medium">
                   {t('ثبت وزن دقیق به نسترن کمک می‌کند تا فشار تمرینی را کالیبره کند.', 'Logging your weight helps Nastaran calibrate your daily intensity.')}
                </p>
             </div>
             <div className="space-y-6">
                <div className="relative group max-w-xs mx-auto">
                   <input 
                    type="number" 
                    step="0.1"
                    autoFocus
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-10 py-6 text-4xl font-black text-white text-center focus:border-indigo-500 transition-all outline-none"
                   />
                   <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 font-black text-xl">KG</span>
                </div>
                <button 
                  onClick={handleWeightSubmit}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Save size={20} />
                  {t('تایید و مشاهده برنامه', 'Save & Unlock Routine')}
                </button>
                <button onClick={() => setHubStep('protocol')} className="w-full py-2 text-slate-600 hover:text-slate-400 text-xs font-black uppercase tracking-widest">{t('رد کردن', 'Skip')}</button>
             </div>
          </div>
        );

      case 'protocol':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-950 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                     <div>
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">
                           {activeProgram?.workout_days?.[0]?.focus || 'FULL BODY'}
                        </span>
                        <h2 className="text-3xl font-black mt-2 italic tracking-tighter">
                           {activeProgram?.workout_days?.[0] ? (language === 'fa' ? activeProgram.workout_days[0].name_fa : activeProgram.workout_days[0].name_en) : t('برنامه امروز', 'Today\'s Routine')}
                        </h2>
                     </div>
                     <div className="bg-white/10 p-4 rounded-2xl flex flex-col items-center border border-white/5">
                        <CheckCircle2 size={24} className="text-emerald-400" />
                        <span className="text-[8px] font-black uppercase mt-1">{t('تایید شده', 'Verified')}</span>
                     </div>
                  </div>

                  <div className="flex gap-8">
                     <div className="flex flex-col">
                        <span className="text-indigo-300 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                           <Clock size={10} /> {t('مدت', 'Dur')}
                        </span>
                        <span className="font-black text-xl">۶۰ <small className="text-[10px] opacity-70">MIN</small></span>
                     </div>
                     <div className="flex flex-col border-r border-white/10 pr-8">
                        <span className="text-indigo-300 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                           <Dumbbell size={10} /> {t('حرکات', 'Ex')}
                        </span>
                        <span className="font-black text-xl">{activeProgram?.workout_days?.[0]?.exercises?.length || 0}</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => activeProgram?.workout_days?.[0] && startSession(activeProgram.workout_days[0].id)}
                    className="w-full bg-white text-indigo-900 py-5 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
                  >
                    <Play size={20} fill="currentColor" />
                    <span className="text-lg font-black">{t('شروع جلسه تمرینی', 'Launch Session')}</span>
                  </button>
               </div>
               <Dumbbell className="absolute -bottom-8 -left-8 w-48 h-48 text-white/5 rotate-12" />
            </div>

            <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800/80">
               <div className="flex justify-between items-center px-2 mb-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('لیست حرکات', 'Movement List')}</h3>
                  <button onClick={() => setHubStep('library')} className="text-indigo-400 text-[10px] font-black uppercase flex items-center gap-1">
                    {t('آموزش حرکات', 'View Library')} <ChevronRight size={12} className={language === 'fa' ? 'rotate-180' : ''} />
                  </button>
               </div>
               <div className="space-y-2">
                  {activeProgram?.workout_days?.[0]?.exercises?.map((ex, idx) => (
                    <div key={idx} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400 font-black">
                          {idx + 1}
                       </div>
                       <div className="flex-1">
                          <p className="font-bold text-white text-sm">{language === 'fa' ? ex.exercise?.name_fa : ex.exercise?.name_en}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{ex.sets} ست × {ex.reps} تکرار</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );

      case 'library':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
               <div className="relative">
                 <Search className="absolute right-3 top-3 lg:right-auto lg:left-3 text-slate-500" size={20} />
                 <input
                   type="text"
                   placeholder={t('جستجو در تمام حرکات...', 'Search movements...')}
                   className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-600 outline-none text-white font-medium"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {exercises.filter(ex => (language === 'fa' ? ex.name_fa : ex.name_en).toLowerCase().includes(searchTerm.toLowerCase())).map(ex => (
                   <div 
                    key={ex.id}
                    onClick={() => setSelectedExercise(ex)}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex gap-4 cursor-pointer hover:border-indigo-500/50 transition-all group"
                   >
                     <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-slate-700 relative overflow-hidden shrink-0">
                       <img src={`https://picsum.photos/seed/${ex.id}/200`} className="absolute inset-0 object-cover opacity-50" alt="" />
                       <PlayCircle size={24} className="z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                     <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">{language === 'fa' ? ex.name_fa : ex.name_en}</h3>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{ex.muscle_group}</p>
                     </div>
                   </div>
                 ))}
               </div>
               <button onClick={() => setHubStep('protocol')} className="w-full py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-sm">{t('بازگشت به برنامه امروز', 'Back to Protocol')}</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 pb-24 lg:pb-0 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tight">{t('هاب تمرین oko', 'Training Hub')}</h1>
          <p className="text-slate-400 font-medium mt-1">{t('مدیریت حضور، آمادگی و اجرای پروتکل روزانه', 'Manage presence, readiness, and protocol execution')}</p>
        </div>
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
           <button 
             onClick={() => setHubStep(isPresent ? 'protocol' : 'check-in')}
             className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
               hubStep !== 'library' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
             }`}
           >
             <ClipboardList size={14} /> {t('برنامه اصلی', 'Routine')}
           </button>
           <button 
             onClick={() => setHubStep('library')}
             className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
               hubStep === 'library' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
             }`}
           >
             <BookOpen size={14} /> {t('کتابخانه', 'Tutorials')}
           </button>
        </div>
      </header>

      {renderStep()}

      {/* QR Scan Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-[2000] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-md">
           <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-[2.5rem] border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
              <video ref={videoRef} className="w-full h-full object-cover grayscale opacity-50" />
              <div className="absolute inset-0 border-[60px] border-black/60" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/30 rounded-3xl flex items-center justify-center">
                 <div className="w-full h-1 bg-indigo-500 absolute animate-scan-line shadow-[0_0_15px_#6366f1]" />
              </div>
              <div className="absolute bottom-10 inset-x-0 flex justify-center px-10">
                 <button 
                  disabled={isVerifyingLocation}
                  onClick={simulateCheckIn} 
                  className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                   {isVerifyingLocation ? <Loader2 size={24} className="animate-spin" /> : <MapPin size={24} />}
                   {isVerifyingLocation ? t('در حال تایید مکان...', 'Verifying GPS...') : t('تایید حضور (شبیه‌ساز)', 'Confirm Presence (Sim)')}
                 </button>
              </div>
           </div>
           <button onClick={stopScan} className="mt-12 p-4 bg-slate-800 text-white rounded-full"><X size={32} /></button>
           <p className="mt-6 text-indigo-400 font-black tracking-widest animate-pulse uppercase text-xs">{t('درحال شناسایی کد oko...', 'Detecting oko Code...')}</p>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in">
           <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl relative">
              <button onClick={() => setSelectedExercise(null)} className="absolute top-6 right-6 z-50 p-2 bg-slate-800 rounded-full text-white"><X size={20} /></button>
              <div className="aspect-video bg-black relative">
                 <img src={`https://picsum.photos/seed/${selectedExercise.id}/800/450`} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-indigo-400">
                    <PlayCircle size={64} className="opacity-60" />
                    <p className="text-[10px] font-black uppercase tracking-widest">{t('آموزش ویدئویی', 'Tutorial Video')}</p>
                 </div>
              </div>
              <div className="p-10 space-y-6">
                 <div>
                    <h2 className="text-3xl font-black text-white italic">{language === 'fa' ? selectedExercise.name_fa : selectedExercise.name_en}</h2>
                    <div className="flex gap-2 mt-2">
                       <span className="bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">{selectedExercise.muscle_group}</span>
                       <span className="bg-slate-800 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedExercise.difficulty}</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h4 className="font-black text-white flex items-center gap-2"><Info size={18} className="text-indigo-400" /> {t('نحوه اجرا', 'Execution')}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{t('با تمرکز کامل بر روی عضله هدف، حرکت را در دامنه کامل حرکتی و با کنترل کامل روی وزنه انجام دهید.', 'Focus on the target muscle and execute the full range of motion with absolute control.')}</p>
                 </div>
                 <button onClick={() => setSelectedExercise(null)} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg">{t('متوجه شدم', 'Understood')}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TrainingHub;
