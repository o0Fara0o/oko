
import React, { useState } from 'react';
import { 
  ArrowLeft, MessageSquare, Sparkles, X, 
  Loader2, CreditCard, Calendar, ShieldCheck, 
  Star, AlertTriangle, Bell, DollarSign, 
  ChevronRight, RefreshCcw, Soup, Save, Target
} from 'lucide-react';
import { useStore } from '../../store';
import { generateInspirationImage } from '../../services/gemini';
import { Subscription, MacroGoals } from '../../types';

interface Props {
  traineeId: string;
  onBack: () => void;
}

const TraineeDetail: React.FC<Props> = ({ traineeId, onBack }) => {
  const { language, managedTrainees, setInspirationImage, updateSubscription, addMessage, setNutritionProgramForTrainee } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'nutrition'>('profile');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  
  const trainee = managedTrainees.find(t => t.id === traineeId);
  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  if (!trainee) return null;

  const sub = trainee.subscription || { type: 'normal', price: 2000000, sessions_total: 12, sessions_remaining: 0, is_paid: false };
  const nutProgram = trainee.nutrition_program || { calories: 2000, protein: 150, carbs: 200, fats: 60, guidelines: '' };

  const [localNut, setLocalNut] = useState<MacroGoals>(nutProgram);

  const handleGenerateInspiration = async () => {
    const refs = [];
    if (trainee.avatar_data) refs.push(trainee.avatar_data);
    if (trainee.reference_images?.face) refs.push(trainee.reference_images.face);
    if (trainee.reference_images?.front) refs.push(trainee.reference_images.front);
    if (trainee.reference_images?.angle) refs.push(trainee.reference_images.angle);

    if (refs.length === 0) {
      alert(t('شاگرد باید ابتدا عکس‌های مرجع را بارگذاری کند', 'Trainee must upload reference photos first'));
      return;
    }

    setIsGenerating(true);
    const goalText = `${trainee.goal || 'fitness'} - current weight ${trainee.weight}kg, target transformation.`;
    const result = await generateInspirationImage(refs, goalText);
    
    if (result) {
      setGeneratedImg(result);
    } else {
      alert(t('خطا در تولید تصویر. لطفا دوباره تلاش کنید.', 'Error generating image. Please try again.'));
    }
    setIsGenerating(false);
  };

  const handleSaveInspiration = () => {
    if (generatedImg) {
      setInspirationImage(trainee.id, generatedImg);
      setIsAiModalOpen(false);
      setGeneratedImg(null);
    }
  };

  const handleSaveNutrition = () => {
    setNutritionProgramForTrainee(traineeId, localNut);
    addMessage({
      id: Date.now().toString(),
      type: 'text',
      chat_type: 'direct',
      text: language === 'fa' 
        ? `برنامه تغذیه جدید شما توسط مربی ثبت شد. همین حالا در بخش سوخت چک کنید!` 
        : `Your new nutrition plan is active. Check the Fuel tab now!`,
      sender: 'trainer',
      timestamp: new Date(),
      trainee_id: traineeId
    });
    alert(t('برنامه تغذیه ذخیره و به شاگرد ابلاغ شد.', 'Nutrition plan saved and athlete notified.'));
  };

  const notifyRenewal = () => {
    addMessage({
      id: Date.now().toString(),
      type: 'text',
      chat_type: 'direct',
      text: language === 'fa' 
        ? `بیزحمت! اشتراک شما رو به اتمام است (${sub.sessions_remaining} جلسه باقی‌مانده). لطفاً برای تمدید اقدام کنید.` 
        : `Reminder: Your subscription is running low (${sub.sessions_remaining} sessions left). Please renew soon.`,
      sender: 'trainer',
      timestamp: new Date(),
      trainee_id: traineeId
    });
    alert(t('پیام تمدید برای شاگرد ارسال شد', 'Renewal notification sent to athlete'));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl shadow-lg">
            <ArrowLeft className={language === 'fa' ? 'rotate-180' : ''} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-600 rounded-3xl flex items-center justify-center text-2xl font-black text-white shadow-xl overflow-hidden border border-white/10">
              {trainee.avatar_data ? <img src={trainee.avatar_data} alt={trainee.full_name} className="w-full h-full object-cover" /> : trainee.full_name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{trainee.full_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {trainee.is_vip && <Star size={14} className="text-amber-500 fill-amber-500" />}
                <p className="text-slate-400 text-xs font-bold">{trainee.active_program_name || t('بدون برنامه', 'No Program')}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-xl">
           <button onClick={() => setActiveTab('profile')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'profile' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}>{t('پروفایل و مالی', 'Profile & Subs')}</button>
           <button onClick={() => setActiveTab('nutrition')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'nutrition' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>{t('پروتکل تغذیه', 'Nutrition Plan')}</button>
        </div>
      </header>

      {activeTab === 'profile' ? (
        <div className="grid lg:grid-cols-2 gap-8">
          <section className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 lg:p-10 space-y-10 shadow-2xl relative overflow-hidden group">
            <header className="flex justify-between items-center pb-8 border-b border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                      <CreditCard size={28} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-black text-white italic">{t('مدیریت اشتراک و مالی', 'Subscription & Billing')}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">{t('کنترل دوره‌های آموزشی و پرداخت‌ها', 'Manage training cycles & payments')}</p>
                  </div>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/30 flex flex-col gap-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('نوع عضویت', 'Subscription Type')}</span>
                  <div className="flex items-center gap-2">
                      {sub.type === 'vip' ? <Star size={18} className="text-amber-500 fill-amber-500" /> : <ShieldCheck size={18} className="text-indigo-500" />}
                      <span className="text-xl font-black text-white uppercase">{sub.type}</span>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/30 flex flex-col gap-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('جلسات باقی‌مانده', 'Sessions Left')}</span>
                  <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${sub.sessions_remaining <= 3 ? 'text-rose-500' : 'text-white'}`}>{sub.sessions_remaining}</span>
                      <span className="text-xs font-bold text-slate-600">/ {sub.sessions_total}</span>
                  </div>
                  {sub.sessions_remaining <= 3 && (
                    <button 
                      onClick={notifyRenewal}
                      className="mt-3 bg-amber-600 hover:bg-amber-500 text-white py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 animate-pulse"
                    >
                      <Bell size={12} />
                      {t('ارسال نوتیفیکیشن', 'Notify Trainee')}
                    </button>
                  )}
                </div>

                <div className="col-span-2 bg-slate-800/30 p-8 rounded-3xl border border-slate-700/20 space-y-6">
                  <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">{t('شارژ سریع دوره', 'Quick Charge')}</span>
                  </div>
                  <button 
                    onClick={() => updateSubscription(traineeId, { sessions_remaining: sub.sessions_total, is_paid: true })}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all active:scale-95"
                  >
                    <RefreshCcw size={18} />
                    {t('شارژ مجدد جلسات', 'Reset Cycle')}
                  </button>
                </div>
            </div>
          </section>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden group">
              <h3 className="text-xl font-black text-white italic flex items-center gap-2">
                <Sparkles size={24} className="text-purple-400" />
                {t('آنالیز تغییرات بصری (Delta)', 'Visual Delta Analysis')}
              </h3>
              <div className="grid grid-cols-2 gap-8 relative z-10">
                <div className="aspect-[3/4] bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800 relative">
                    <img src={trainee.reference_images?.front || "https://picsum.photos/seed/before/400/600"} className="w-full h-full object-cover grayscale opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 flex items-end p-6">
                      <span className="text-xs font-black text-white uppercase tracking-widest">{t('روز اول', 'DAY 1')}</span>
                    </div>
                </div>
                <div className="aspect-[3/4] bg-slate-950 rounded-[2rem] overflow-hidden border-2 border-indigo-500 shadow-xl relative">
                    <img src={trainee.inspiration_image || "https://picsum.photos/seed/after/400/600"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 flex items-end p-6">
                      <span className="text-xs font-black text-white uppercase tracking-widest">{t('هدف غایی', 'FINAL VISION')}</span>
                    </div>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(true)}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3"
              >
                <Sparkles size={18} />
                {t('به‌روزرسانی چشم‌انداز AI', 'Refresh AI Vision')}
              </button>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
           <section className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 space-y-10 shadow-2xl">
              <header className="flex justify-between items-center border-b border-slate-800/50 pb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500">
                       <Soup size={28} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white italic">{t('طراحی رژیم و ماکروها', 'Nutrition & Macro Plan')}</h3>
                       <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">{t('تنظیم اهداف کالری و کلان‌مغذی‌ها', 'Set daily calorie and macro goals')}</p>
                    </div>
                 </div>
                 <button 
                  onClick={handleSaveNutrition}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 shadow-xl transition-all"
                 >
                   <Save size={18} />
                   {t('ثبت و انتشار برنامه', 'Publish Plan')}
                 </button>
              </header>

              <div className="grid md:grid-cols-4 gap-6">
                 <div className="space-y-3 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/30">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('کالری هدف', 'Target Calories')}</label>
                    <input 
                      type="number" 
                      value={localNut.calories}
                      onChange={(e) => setLocalNut({ ...localNut, calories: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border-none rounded-xl py-3 px-4 text-white font-black text-xl outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                 </div>
                 <div className="space-y-3 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/30">
                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">{t('پروتئین (گرم)', 'Protein (g)')}</label>
                    <input 
                      type="number" 
                      value={localNut.protein}
                      onChange={(e) => setLocalNut({ ...localNut, protein: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border-none rounded-xl py-3 px-4 text-white font-black text-xl outline-none focus:ring-1 focus:ring-rose-500"
                    />
                 </div>
                 <div className="space-y-3 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/30">
                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-1">{t('کربوهیدرات (گرم)', 'Carbs (g)')}</label>
                    <input 
                      type="number" 
                      value={localNut.carbs}
                      onChange={(e) => setLocalNut({ ...localNut, carbs: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border-none rounded-xl py-3 px-4 text-white font-black text-xl outline-none focus:ring-1 focus:ring-amber-500"
                    />
                 </div>
                 <div className="space-y-3 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/30">
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-1">{t('چربی (گرم)', 'Fats (g)')}</label>
                    <input 
                      type="number" 
                      value={localNut.fats}
                      onChange={(e) => setLocalNut({ ...localNut, fats: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border-none rounded-xl py-3 px-4 text-white font-black text-xl outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('دستورالعمل‌های غذایی و توصیه‌ها', 'Nutritional Guidelines & Tips')}</label>
                 <textarea 
                  value={localNut.guidelines || ''}
                  onChange={(e) => setLocalNut({ ...localNut, guidelines: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-6 text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 h-48 font-medium leading-relaxed resize-none"
                  placeholder={t('مثلاً: مصرف سبزیجات فراوان، حذف قندهای مصنوعی...', 'e.g. Plenty of greens, no artificial sugars...')}
                 />
              </div>

              <div className="bg-emerald-600/5 border border-emerald-500/20 p-8 rounded-[2.5rem] flex items-start gap-5">
                 <Target className="text-emerald-500 mt-1" size={32} />
                 <div>
                    <h4 className="text-white font-black italic">{t('چک-این هوشمند با AI', 'Smart AI Follow-up')}</h4>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                       {t('شاگرد شما می‌تواند با استفاده از oko AI در تب سوخت، میزان پایبندی خود به این برنامه را بسنجد. AI بر اساس داده‌های ثبت شده و این برنامه به ورزشکار فیدبک می‌دهد.', 'Your athlete can use oko AI in their Fuel tab to check compliance against this plan. AI provides feedback based on their logged meals and these goals.')}
                    </p>
                 </div>
              </div>
           </section>
        </div>
      )}

      {isAiModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
               <div className="flex items-center gap-3 text-white">
                  <Sparkles className="text-purple-500" size={24} />
                  <div>
                    <h3 className="text-xl font-black">{t('معمار انگیزشی هوشمند', 'AI Inspiration Architect')}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{trainee.full_name}</p>
                  </div>
               </div>
               <button onClick={() => setIsAiModalOpen(false)} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white"><X size={24} /></button>
            </header>
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              {!generatedImg ? (
                <div className="space-y-6">
                   <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl space-y-4">
                      <p className="text-sm text-indigo-300 leading-relaxed">
                        {t('هوش مصنوعی با استفاده از عکس‌های شاگرد، تصویری از "آینده ورزشکار" تولید می‌کند.', 'AI uses athlete photos to generate a "Future Vision" image.')}
                      </p>
                   </div>
                   <button 
                    disabled={isGenerating}
                    onClick={handleGenerateInspiration}
                    className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                   >
                     {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                     {t('تولید تصویر رویایی', 'Generate Dream Transformation')}
                   </button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('فعلی', 'Current')}</span>
                        <img src={trainee.avatar_data || "https://picsum.photos/200"} className="w-full aspect-[3/4] object-cover rounded-2xl border border-slate-800" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t('آینده (AI)', 'Future (AI)')}</span>
                        <img src={generatedImg} className="w-full aspect-[3/4] object-cover rounded-2xl border-2 border-indigo-500" />
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => setGeneratedImg(null)} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold">{t('تلاش مجدد', 'Try Again')}</button>
                      <button onClick={handleSaveInspiration} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black">{t('تایید و ارسال', 'Confirm & Send')}</button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraineeDetail;
