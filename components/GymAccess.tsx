
import React, { useState, useRef, useEffect } from 'react';
import { Camera, QrCode, X, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, Scale, Save, Info } from 'lucide-react';
import { useStore } from '../store';

const GymAccess: React.FC = () => {
  const { language, recordAttendance, profile, gyms, addWeight } = useStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ gymId: string; type: 'enter' | 'exit' } | null>(null);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(profile?.weight?.toString() || '');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  const startScan = async () => {
    setIsScanning(true);
    setError(null);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError(t('دسترسی به دوربین امکان‌پذیر نیست', 'Camera access denied'));
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

  const simulateScan = (type: 'enter' | 'exit') => {
    if (!profile) return;
    const gymId = gyms[0]?.id || 'gym-1';
    recordAttendance(profile.id, gymId, type);
    
    if (type === 'enter') {
      setShowWeightInput(true);
      setScanResult({ gymId, type });
    } else {
      setScanResult({ gymId, type });
    }
    stopScan();
  };

  const handleWeightSubmit = () => {
    const weightVal = parseFloat(currentWeight);
    if (!isNaN(weightVal)) {
      addWeight(weightVal);
      setShowWeightInput(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-0">
      <header>
        <h1 className="text-3xl font-black text-white">{t('ورود و خروج هوشمند', 'Gym Gatekeeping')}</h1>
        <p className="text-slate-400 mt-1 font-medium">{t('برای ثبت حضور، کد QR نصب شده در باشگاه را اسکن کنید', 'Scan the gym QR code to record your attendance')}</p>
      </header>

      {!isScanning && !scanResult && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-800 space-y-6">
           <div className="w-32 h-32 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-500 animate-pulse">
              <QrCode size={64} />
           </div>
           <div className="text-center space-y-2 px-6">
              <h2 className="text-2xl font-black text-white">{t('آماده اسکن هستید؟', 'Ready to Scan?')}</h2>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                {t('دوربین گوشی خود را مقابل کد QR قرار دهید تا ورود یا خروج شما ثبت شود.', 'Point your camera at the QR code to check in or out.')}
              </p>
           </div>
           <button 
            onClick={startScan}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3"
           >
             <Camera size={24} />
             {t('شروع اسکن کد', 'Start Scanning')}
           </button>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-6">
           <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-[2rem] border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
              <video ref={videoRef} className="w-full h-full object-cover grayscale opacity-50" />
              <div className="absolute inset-0 border-[40px] border-black/40" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/50 rounded-2xl flex items-center justify-center">
                 <div className="w-full h-0.5 bg-indigo-500 absolute animate-scan-line shadow-[0_0_10px_#6366f1]" />
              </div>
              
              <div className="absolute bottom-10 inset-x-0 flex justify-center gap-4 px-6">
                 <button onClick={() => simulateScan('enter')} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl">{t('شبیه‌ساز ورود', 'ENTRY SIM')}</button>
                 <button onClick={() => simulateScan('exit')} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl">{t('شبیه‌ساز خروج', 'EXIT SIM')}</button>
              </div>
           </div>

           <button 
            onClick={stopScan}
            className="mt-12 bg-white/10 text-white p-5 rounded-full hover:bg-white/20 transition-all"
           >
             <X size={32} />
           </button>
           <p className="mt-6 text-indigo-400 font-bold tracking-widest animate-pulse uppercase text-xs">{t('درحال جستجوی کد QR...', 'Searching for QR Code...')}</p>
        </div>
      )}

      {scanResult && !showWeightInput && (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 text-center space-y-6 animate-in zoom-in-95">
           <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${scanResult.type === 'enter' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
              <CheckCircle2 size={48} />
           </div>
           <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">
                {scanResult.type === 'enter' ? t('خوش آمدید!', 'Welcome!') : t('خداحافظ!', 'See you soon!')}
              </h2>
              <p className="text-slate-400 font-medium">
                {scanResult.type === 'enter' 
                  ? t('ورود شما با موفقیت ثبت شد. تمرین خوبی داشته باشید.', 'Your entry has been recorded. Have a great workout!') 
                  : t('خروج شما ثبت شد. به امید دیدار در جلسه بعدی.', 'Your exit has been recorded. Hope to see you next session.')}
              </p>
           </div>
           <div className="bg-slate-800/50 p-6 rounded-2xl inline-flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">{t('باشگاه', 'Gym')}</span>
              <span className="text-white font-bold">{gyms.find(g => g.id === scanResult.gymId)?.name_fa || 'oko Elite Academy'}</span>
              <span className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-black">{t('زمان ثبت', 'Timestamp')}</span>
              <span className="text-indigo-400 font-mono font-bold">{new Date().toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US')}</span>
           </div>
           <div className="pt-6">
              <button 
                onClick={() => setScanResult(null)}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
              >
                {t('تایید و بازگشت', 'Confirm & Return')}
              </button>
           </div>
        </div>
      )}

      {/* Weight Input Modal for Entry */}
      {showWeightInput && (
        <div className="fixed inset-0 z-[1100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 w-full max-w-md rounded-[3rem] border border-slate-800 p-10 space-y-8 shadow-[0_0_80px_rgba(99,102,241,0.2)]">
              <div className="text-center space-y-3">
                 <div className="w-20 h-20 bg-amber-500/10 rounded-[1.5rem] flex items-center justify-center text-amber-500 mx-auto">
                    <Scale size={40} />
                 </div>
                 <h2 className="text-2xl font-black text-white italic">{t('وزن‌کشی پیش از تمرین', 'Pre-Workout Weigh-In')}</h2>
                 <p className="text-slate-500 text-sm leading-relaxed">
                   {t('نسترن عزیز توصیه کرده قبل از شروع تمرین حتما خود را وزن کنید و عدد را برای آنالیز دقیق‌تر وارد نمایید.', 'Coach Nastaran recommends weighing yourself before starting for accurate progress tracking.')}
                 </p>
              </div>

              <div className="space-y-4">
                 <div className="relative group">
                    <input 
                      type="number" 
                      step="0.1"
                      autoFocus
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-10 py-6 text-4xl font-black text-white text-center focus:border-indigo-500 transition-all outline-none"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 font-black text-xl uppercase">KG</span>
                 </div>
                 
                 <div className="bg-slate-800/50 p-4 rounded-2xl flex gap-3">
                    <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-tight">
                       {t('وارد کردن وزن دقیق به هوش مصنوعی oko کمک می‌کند تا شدت تمرینات شما را بهینه‌سازی کند.', 'Accurate weight input helps oko AI optimize your training intensity.')}
                    </p>
                 </div>
              </div>

              <button 
                onClick={handleWeightSubmit}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Save size={20} />
                {t('ثبت وزن و ورود به باشگاه', 'Save & Start Session')}
              </button>
              
              <button 
                onClick={() => setShowWeightInput(false)}
                className="w-full py-2 text-slate-600 hover:text-slate-400 text-xs font-black uppercase tracking-widest"
              >
                {t('بعداً وارد می‌کنم', 'Skip for now')}
              </button>
           </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-4 text-rose-500">
           <AlertTriangle size={24} />
           <p className="font-bold">{error}</p>
        </div>
      )}
    </div>
  );
};

export default GymAccess;
