
import React, { useState, useMemo, useRef } from 'react';
import { 
  Soup, Zap, Sparkles, Plus, Loader2, 
  Trash2, Flame, Beef, Wheat, Droplets,
  Mic, Search, CheckCircle2, AlertCircle,
  Clock, Calendar, ChevronRight, ClipboardList, 
  Target, Camera, Image as ImageIcon, Info, X, Lightbulb
} from 'lucide-react';
import { useStore } from '../store';
import { GoogleGenAI, Type } from "@google/genai";

const Fuel: React.FC = () => {
  const { language, meals, profile, managedTrainees, addMeal, removeMeal } = useStore();
  const [input, setInput] = useState('');
  const [mealImage, setMealImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  // Find the specific nutrition program for this user (if trainee)
  const traineeData = managedTrainees.find(t => t.id === profile?.id);
  const nutritionProgram = traineeData?.nutrition_program || { calories: 2300, protein: 160, carbs: 250, fats: 70, guidelines: 'Stay hydrated!' };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMealImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Multimodal AI Analysis Logic
  const analyzeMeal = async () => {
    if ((!input.trim() && !mealImage) || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contentsParts: any[] = [];
      
      if (mealImage) {
        contentsParts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: mealImage.split(',')[1]
          }
        });
      }

      const promptText = `Analyze this meal ${mealImage ? "image and " : ""}description: "${input}". 
      Return ONLY a JSON object with this structure: { "name": string, "protein": number, "carbs": number, "fats": number, "calories": number }. 
      Ensure all values are numbers. 
      If only an image is provided, estimate macros based on visible portion sizes.
      If both description and image are provided, use both to be as accurate as possible.`;

      contentsParts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: contentsParts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fats: { type: Type.NUMBER },
              calories: { type: Type.NUMBER }
            },
            required: ["name", "protein", "carbs", "fats", "calories"]
          }
        }
      });

      let text = response.text || "{}";
      text = text.replace(/```json\n?|```/g, "").trim();
      
      const data = JSON.parse(text);
      
      addMeal({
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        name: data.name || input.substring(0, 20) || t('وعده غذایی', 'Meal'),
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fats: Number(data.fats) || 0,
        calories: Number(data.calories) || 0
      });
      
      setInput('');
      setMealImage(null);
    } catch (err) {
      console.error("Fuel Analysis Error:", err);
      setError(t('متأسفانه مشکلی در تحلیل پیش آمد.', 'AI analysis failed. Please try again.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI Compliance Check
  const checkCompliance = async () => {
    if (meals.length === 0 || isCheckingCompliance) return;
    setIsCheckingCompliance(true);
    setAiFeedback(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const totalStats = meals.reduce((acc, curr) => ({
        p: acc.p + curr.protein,
        c: acc.c + curr.carbs,
        f: acc.f + curr.fats,
        cal: acc.cal + curr.calories
      }), { p: 0, c: 0, f: 0, cal: 0 });

      const prompt = `As a high-performance fitness coach, analyze my nutrition for today:
      Daily Goals: ${JSON.stringify(nutritionProgram)}
      My Consumed Meals Today: ${JSON.stringify(meals)}
      Total Consumed: ${totalStats.cal} kcal, ${totalStats.p}g Protein, ${totalStats.c}g Carbs, ${totalStats.f}g Fats.
      Provide a concise, motivating, and professional feedback in ${language === 'fa' ? 'Persian' : 'English'}. 
      Tell me if I am following the plan and what I should adjust for my next meal.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setAiFeedback(response.text);
    } catch (err) {
      console.error(err);
      setError("AI Check failed.");
    } finally {
      setIsCheckingCompliance(false);
    }
  };

  const totals = useMemo(() => {
    return (meals || []).reduce((acc, curr) => ({
      protein: acc.protein + (curr.protein || 0),
      carbs: acc.carbs + (curr.carbs || 0),
      fats: acc.fats + (curr.fats || 0),
      calories: acc.calories + (curr.calories || 0)
    }), { protein: 0, carbs: 0, fats: 0, calories: 0 });
  }, [meals]);

  const percentages = {
    protein: Math.min(100, (totals.protein / (nutritionProgram.protein || 1)) * 100),
    carbs: Math.min(100, (totals.carbs / (nutritionProgram.carbs || 1)) * 100),
    fats: Math.min(100, (totals.fats / (nutritionProgram.fats || 1)) * 100),
    calories: Math.min(100, (totals.calories / (nutritionProgram.calories || 1)) * 100)
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-white italic flex items-center gap-3">
             <Soup className="text-emerald-500" size={32} />
             {t('سوخت‌رسانی oko', 'oko Fuel')}
          </h1>
          <p className="text-slate-400 font-medium mt-1">{t('مدیریت تغذیه با هوش مصنوعی و آنالیز در لحظه', 'AI-powered nutrition tracking & live analysis')}</p>
        </div>
        <div className="bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-4 px-6 py-3">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('روزانه', 'DAILY')}</span>
              <span className="font-black text-emerald-400">{totals.calories.toLocaleString()} <small className="text-[10px]">kcal</small></span>
           </div>
           <div className="h-8 w-px bg-slate-800" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('هدف مربی', 'COACH GOAL')}</span>
              <span className="font-black text-white">{nutritionProgram.calories.toLocaleString()} <small className="text-[10px]">kcal</small></span>
           </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Enhanced AI Input Section */}
          <section className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={120} className="text-emerald-500" />
             </div>
             
             <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">{t('چه چیزی میل کردید؟', 'What did you eat?')}</h2>
                    <p className="text-slate-500 text-sm font-medium">{t('عکس بگیرید یا توصیف کنید تا AI ماکروها را استخراج کند.', 'Snap a photo or describe for AI extraction.')}</p>
                  </div>
                  <button 
                    onClick={() => setShowGuide(true)}
                    className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-2xl text-emerald-500 transition-all border border-slate-700/50 flex items-center gap-2 group/btn"
                  >
                    <Info size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover/btn:inline-block">{t('راهنما', 'GUIDE')}</span>
                  </button>
                </div>

                <div className="relative flex flex-col gap-4">
                   <div className="relative">
                      <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isAnalyzing}
                        placeholder={t('مثلاً: ۲۵۰ گرم سینه مرغ گریل شده، یک پیمانه برنج و سالاد...', 'e.g. 250g grilled chicken, 1 cup rice and salad...')}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2.5rem] p-8 pt-10 text-xl font-medium text-white min-h-[180px] focus:border-emerald-500 outline-none transition-all placeholder:text-slate-800"
                      />
                      
                      <div className="absolute top-4 left-6 flex gap-2">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-3 rounded-2xl transition-all shadow-xl ${mealImage ? 'bg-emerald-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
                        >
                           {mealImage ? <CheckCircle2 size={20} /> : <Camera size={20} />}
                        </button>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />
                        <div className="bg-indigo-600/10 text-indigo-500 p-3 rounded-2xl"><Mic size={20} /></div>
                      </div>

                      {mealImage && (
                        <div className="absolute bottom-6 left-6 animate-in slide-in-from-left-4">
                          <div className="relative group/thumb">
                            <img src={mealImage} className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xl" alt="Preview" />
                            <button 
                              onClick={() => setMealImage(null)}
                              className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-lg"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <button 
                        onClick={analyzeMeal}
                        disabled={isAnalyzing || (!input.trim() && !mealImage)}
                        className="absolute bottom-6 right-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {t('تحلیل و ثبت هوشمند', 'Analyze & Log')}
                      </button>
                   </div>
                </div>
                
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-rose-600/10 border border-rose-500/20 rounded-2xl text-rose-500 animate-in slide-in-from-top-4">
                     <AlertCircle size={18} />
                     <p className="text-xs font-bold">{error}</p>
                  </div>
                )}
             </div>
          </section>

          {/* AI Compliance Section */}
          <section className="bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-800 p-10 rounded-[3rem] shadow-2xl space-y-6">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500">
                      <Sparkles size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-white italic">{t('آنالیز پایبندی به برنامه', 'Plan Compliance Check')}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">{t('بررسی عملکرد امروز توسط oko AI', 'Today\'s performance review by oko AI')}</p>
                   </div>
                </div>
                <button 
                  disabled={isCheckingCompliance || meals.length === 0}
                  onClick={checkCompliance}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-xl disabled:opacity-20"
                >
                  {isCheckingCompliance ? <Loader2 className="animate-spin" size={16} /> : <Target size={16} />}
                  {t('چک-این هوشمند', 'Smart Check-in')}
                </button>
             </div>

             {aiFeedback ? (
               <div className="bg-slate-950/50 p-6 rounded-3xl border border-indigo-500/20 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm text-indigo-100 leading-relaxed font-medium">{aiFeedback}</p>
               </div>
             ) : (
               <div className="py-6 text-center text-slate-600 italic text-xs font-medium border-t border-slate-800/50 mt-4">
                  {meals.length === 0 ? t('برای دریافت فیدبک، ابتدا وعده‌های خود را ثبت کنید.', 'Log your meals first to get AI feedback.') : t('روی دکمه چک-این هوشمند کلیک کنید تا AI عملکرد شما را بسنجد.', 'Click Smart Check-in to let AI evaluate your performance.')}
               </div>
             )}
          </section>

          <section className="space-y-4">
             <div className="flex justify-between items-center px-2">
                <h3 className="font-black text-white flex items-center gap-3 italic">
                   <Clock size={20} className="text-emerald-400" />
                   {t('تاریخچه وعده‌های امروز', 'Today\'s Meals')}
                </h3>
             </div>
             
             <div className="grid gap-3">
                {(!meals || meals.length === 0) ? (
                  <div className="py-12 bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-800 text-center space-y-4">
                     <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-700 mx-auto">
                        <Soup size={32} />
                     </div>
                     <p className="text-slate-600 font-bold">{t('هنوز وعده‌ای ثبت نشده است.', 'No meals logged yet.')}</p>
                  </div>
                ) : meals.map((meal) => (
                  <div key={meal.id} className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500 font-black relative overflow-hidden">
                           <img src={`https://picsum.photos/seed/${meal.id}/100`} className="absolute inset-0 object-cover opacity-20" alt="" />
                           <span className="relative z-10">{meal.calories}</span>
                        </div>
                        <div>
                           <h4 className="font-black text-white text-lg">{meal.name}</h4>
                           <div className="flex gap-4 mt-1">
                              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{meal.protein}g P</span>
                              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{meal.carbs}g C</span>
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{meal.fats}g F</span>
                           </div>
                        </div>
                     </div>
                     <button 
                      onClick={() => removeMeal(meal.id)}
                      className="p-3 bg-slate-800/50 hover:bg-rose-600/10 text-slate-600 hover:text-rose-500 rounded-xl transition-all"
                     >
                        <Trash2 size={18} />
                     </button>
                  </div>
                ))}
             </div>
          </section>
        </div>

        <aside className="space-y-8">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
              <h3 className="text-xl font-black text-white italic flex items-center gap-3">
                 <Zap size={24} className="text-amber-500" />
                 {t('اهداف مربی نسترن', 'Coach Nastaran\'s Plan')}
              </h3>

              <div className="space-y-6">
                 <div className="relative flex items-center justify-center py-6">
                    <svg className="w-48 h-48 transform -rotate-90">
                       <circle cx="96" cy="96" r="88" className="stroke-slate-800" strokeWidth="12" fill="none" />
                       <circle 
                        cx="96" cy="96" r="88" 
                        className="stroke-emerald-500 transition-all duration-1000" 
                        strokeWidth="12" 
                        fill="none" 
                        strokeDasharray={552.92}
                        strokeDashoffset={552.92 - (552.92 * percentages.calories) / 100}
                        strokeLinecap="round"
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
                       <span className="text-4xl font-black text-white tracking-tighter">{totals.calories}</span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('کالری مصرفی', 'KCAL CONSUMED')}</span>
                    </div>
                 </div>

                 <div className="space-y-5 pt-4">
                    <div className="space-y-2">
                       <div className="flex justify-between items-end px-1">
                          <div className="flex items-center gap-2">
                             <Beef size={14} className="text-rose-500" />
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('پروتئین', 'Protein')}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-500">{totals.protein} / {nutritionProgram.protein}g</span>
                       </div>
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${percentages.protein}%` }} />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between items-end px-1">
                          <div className="flex items-center gap-2">
                             <Wheat size={14} className="text-amber-500" />
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('کربوهیدرات', 'Carbs')}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-500">{totals.carbs} / {nutritionProgram.carbs}g</span>
                       </div>
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${percentages.carbs}%` }} />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between items-end px-1">
                          <div className="flex items-center gap-2">
                             <Droplets size={14} className="text-indigo-500" />
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('چربی', 'Fats')}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-500">{totals.fats} / {nutritionProgram.fats}g</span>
                       </div>
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${percentages.fats}%` }} />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-emerald-600/10 border border-emerald-500/20 p-8 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-3 text-emerald-500">
                 <ClipboardList size={20} />
                 <h4 className="font-black italic">{t('دستورالعمل مربی نسترن', 'Coach Instructions')}</h4>
              </div>
              <p className="text-xs text-emerald-100/70 leading-relaxed font-medium">
                {nutritionProgram.guidelines || t('فعلاً دستورالعملی ثبت نشده است.', 'No specific guidelines yet.')}
              </p>
           </div>
        </aside>
      </div>

      {/* Photo Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
             <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-emerald-600/10">
                <div className="flex items-center gap-3">
                  <Lightbulb className="text-emerald-500" />
                  <h3 className="text-xl font-black text-white italic">{t('راهنمای عکاسی از غذا', 'Meal Photo Guide')}</h3>
                </div>
                <button onClick={() => setShowGuide(false)} className="p-2 text-slate-500 hover:text-white"><X size={24} /></button>
             </header>
             <div className="p-8 space-y-6">
                <div className="grid gap-4">
                   {[
                     { icon: <Zap size={18} />, title_fa: 'نور کافی', title_en: 'Good Lighting', desc_fa: 'در محیطی با نور طبیعی یا روشن عکس بگیرید تا جزئیات غذا مشخص باشد.', desc_en: 'Shoot in natural or bright light so food details are visible.' },
                     { icon: <Target size={18} />, title_fa: 'زاویه از بالا', title_en: 'Bird\'s Eye View', desc_fa: 'گوشی را مستقیماً بالای بشقاب نگه دارید تا تمام محتویات دیده شود.', desc_en: 'Hold phone directly over the plate to see all ingredients.' },
                     { icon: <Plus size={18} />, title_fa: 'مقیاس مرجع', title_en: 'Reference Object', desc_fa: 'قرار دادن یک قاشق یا چنگال کنار بشقاب به هوش مصنوعی در تشخیص حجم کمک می‌کند.', desc_en: 'A fork or spoon near the plate helps AI judge portion sizes.' },
                   ].map((tip, i) => (
                     <div key={i} className="flex gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">{tip.icon}</div>
                        <div>
                           <h4 className="font-black text-white text-sm">{t(tip.title_fa, tip.title_en)}</h4>
                           <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t(tip.desc_fa, tip.desc_en)}</p>
                        </div>
                     </div>
                   ))}
                </div>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm"
                >
                  {t('متوجه شدم', 'Got it!')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fuel;
