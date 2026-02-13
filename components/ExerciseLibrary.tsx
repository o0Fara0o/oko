
import React, { useState } from 'react';
import { Search, Info, PlayCircle, X, ClipboardList, BookOpen, ChevronRight, Dumbbell, Sparkles, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { Exercise } from '../types';
import { generateExerciseTutorialVideo } from '../services/gemini';

const ExerciseLibrary: React.FC = () => {
  const { language, activeProgram, exercises } = useStore();
  const [viewMode, setViewMode] = useState<'assigned' | 'tutorials'>(activeProgram ? 'assigned' : 'tutorials');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  const filters = [
    { id: 'all', label: t('همه', 'All') },
    { id: 'chest', label: t('سینه', 'Chest') },
    { id: 'legs', label: t('پا', 'Legs') },
    { id: 'back', label: t('پشت', 'Back') },
    { id: 'shoulders', label: t('سرشانه', 'Shoulders') },
  ];

  const filteredTutorials = exercises.filter(ex => {
    const matchesSearch = (language === 'fa' ? ex.name_fa : ex.name_en).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || ex.muscle_group === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleGenerateVideo = async () => {
    if (!selectedExercise) return;
    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);
    const url = await generateExerciseTutorialVideo(selectedExercise.name_en);
    if (url) {
      setGeneratedVideoUrl(url);
    } else {
      alert(t('خطا در تولید ویدیو. لطفاً دوباره تلاش کنید.', 'Error generating video. Please try again.'));
    }
    setIsGeneratingVideo(false);
  };

  const handleCloseModal = () => {
    setSelectedExercise(null);
    setGeneratedVideoUrl(null);
    setIsGeneratingVideo(false);
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">{t('برنامه و آموزش', 'Routine & Tutorials')}</h1>
          <p className="text-slate-400 mt-1">{t('مدیریت تمرینات اختصاصی و بانک حرکات', 'Manage your protocol and movement database')}</p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button 
            onClick={() => setViewMode('assigned')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              viewMode === 'assigned' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ClipboardList size={14} />
            {t('برنامه من', 'My Program')}
          </button>
          <button 
            onClick={() => setViewMode('tutorials')}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              viewMode === 'tutorials' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <BookOpen size={14} />
            {t('کتابخانه آموزشی', 'Tutorials')}
          </button>
        </div>
      </header>

      {viewMode === 'assigned' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!activeProgram ? (
            <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 p-16 rounded-[3rem] flex flex-col items-center justify-center text-center gap-6">
              <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600">
                <Dumbbell size={40} />
              </div>
              <div className="max-w-sm space-y-2">
                <h3 className="text-xl font-black text-white">{t('برنامه‌ای یافت نشد', 'No Assigned Program')}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {t('هنوز برنامه‌ای توسط مربی برای شما ثبت نشده است. می‌توانید از بخش آموزش، حرکات را مرور کنید.', 'No protocol has been registered for you yet. You can browse movements in the Tutorials section.')}
                </p>
                <button 
                  onClick={() => setViewMode('tutorials')}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm"
                >
                  {t('مشاهده کتابخانه آموزش', 'View Tutorials')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem]">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">{t('برنامه فعال شما', 'Active Protocol')}</span>
                 <h2 className="text-3xl font-black text-white mt-1 italic">{activeProgram.name_fa}</h2>
                 <p className="text-slate-400 mt-2 text-sm">{activeProgram.days_per_week} {t('روز تمرینی در هفته', 'Training days per week')}</p>
              </div>

              <div className="grid gap-6">
                {activeProgram.workout_days?.map((day) => (
                  <div key={day.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                       <div>
                          <h3 className="text-xl font-black text-white">{day.name_fa}</h3>
                          <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">{day.focus || t('فول بادی', 'Full Body')}</p>
                       </div>
                       {day.rest_day && <span className="bg-slate-800 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black">{t('روز استراحت', 'REST DAY')}</span>}
                    </div>

                    {!day.rest_day && (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {day.exercises?.map((ex) => (
                          <div 
                            key={ex.id}
                            onClick={() => ex.exercise && setSelectedExercise(ex.exercise)}
                            className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex items-center gap-4 cursor-pointer hover:border-indigo-500/50 transition-all group"
                          >
                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-500">
                               <PlayCircle size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="font-bold text-white text-sm truncate group-hover:text-indigo-400 transition-colors">
                                 {language === 'fa' ? ex.exercise?.name_fa : ex.exercise?.name_en}
                               </p>
                               <p className="text-[10px] text-slate-500">{ex.sets} {t('ست', 'Sets')} × {ex.reps} {t('تکرار', 'Reps')}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-600" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 lg:right-auto lg:left-3 text-slate-500" size={20} />
              <input
                type="text"
                placeholder={t('جستجو در تمام حرکات...', 'Search all exercises...')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-auto pb-2 lg:pb-0 no-scrollbar">
              {filters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-4 py-3 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                    activeFilter === f.id ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTutorials.map(ex => (
              <div 
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex gap-4 cursor-pointer hover:border-amber-500/50 transition-all group"
              >
                <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-slate-700 relative overflow-hidden shrink-0">
                  <PlayCircle size={24} className="z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={`https://picsum.photos/seed/${ex.id}/200`} className="absolute inset-0 object-cover opacity-50" alt="" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors text-sm">
                    {language === 'fa' ? ex.name_fa : ex.name_en}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide font-medium">{ex.muscle_group}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-slate-900 text-[9px] px-2 py-0.5 rounded text-slate-400 border border-slate-700">
                      {ex.equipment}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 z-50 p-2 bg-slate-800/80 rounded-full text-white hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            
            <div className="aspect-video bg-black flex flex-col items-center justify-center relative">
              {generatedVideoUrl ? (
                <video src={generatedVideoUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : isGeneratingVideo ? (
                <div className="flex flex-col items-center gap-4 text-emerald-500 animate-pulse">
                   <Loader2 size={64} className="animate-spin" />
                   <p className="text-sm font-black uppercase tracking-widest">{t('درحال تولید ویدیو توسط Veo...', 'Veo AI Generating Video...')}</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-4 text-slate-600">
                    <button 
                      onClick={handleGenerateVideo}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white p-6 rounded-full shadow-2xl transition-all active:scale-90 group"
                    >
                       <Sparkles size={48} className="group-hover:rotate-12 transition-transform" />
                    </button>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('مشاهده آموزش ویدئویی (تولید با AI)', 'Generate AI Video Tutorial')}</p>
                  </div>
                  <img 
                    src={`https://picsum.photos/seed/${selectedExercise.id}/800/450`} 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" 
                    alt="" 
                  />
                </>
              )}
            </div>

            <div className="p-8 space-y-6 max-h-[50vh] overflow-auto no-scrollbar">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-black italic">{language === 'fa' ? selectedExercise.name_fa : selectedExercise.name_en}</h2>
                  <div className="flex gap-3 mt-3">
                    <span className="bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">{selectedExercise.muscle_group}</span>
                    <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-700">{selectedExercise.difficulty}</span>
                  </div>
                </div>
                {!generatedVideoUrl && !isGeneratingVideo && (
                  <button 
                    onClick={handleGenerateVideo}
                    className="flex items-center gap-2 bg-emerald-600/10 text-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    <Sparkles size={14} />
                    {t('ویدیو Veo', 'Veo Video')}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-black flex items-center gap-2 text-white">
                  <Info size={18} className="text-amber-500" />
                  {t('آموزش اجرای صحیح حرکت', 'Proper Execution Guide')}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t('برای اجرای صحیح این حرکت، ابتدا بدن را در وضعیت خنثی قرار داده و با کنترل کامل روی وزنه، فاز مثبت و منفی حرکت را انجام دهید. تمرکز روی عضله هدف در طول کل دامنه حرکتی الزامی است.', 
                     'To perform this movement correctly, keep your body in a neutral position and execute the positive and negative phases with full control. Focus on the target muscle throughout the entire range of motion.')}
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-800/20">
               <button 
                onClick={handleCloseModal}
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
               >
                 {t('متوجه شدم', 'Understood')}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;
