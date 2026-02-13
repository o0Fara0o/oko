
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Save, Dumbbell, Calendar, Users, Copy, CheckCircle2, Search, ChevronDown, Edit3, ArrowRight, Layout, BookOpen, UserPlus, X, Info } from 'lucide-react';
import { useStore } from '../../store';
import { Program, WorkoutDay, WorkoutExercise, Exercise, Difficulty, Category } from '../../types';
import WheelPicker from './WheelPicker';

const ProgramArchitect: React.FC = () => {
  const { language, addProgram, addTemplate, templates, managedTrainees, assignProgram, exercises, addExercise } = useStore();
  const [activeTab, setActiveTab] = useState<'build' | 'templates' | 'assign'>('build');
  
  // Builder State
  const [programName, setProgramName] = useState('');
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Assigner State
  const [assignTargetProgramId, setAssignTargetProgramId] = useState<string | null>(null);
  const [assignTraineeIds, setAssignTraineeIds] = useState<string[]>([]);
  
  // Exercise Selector State
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState<{ dayId: string; exId: string } | null>(null);
  const [exSearch, setExSearch] = useState('');

  // Custom Exercise Creator State
  const [isExerciseCreatorOpen, setIsExerciseCreatorOpen] = useState(false);
  const [newExForm, setNewExForm] = useState<Partial<Exercise>>({
    name_fa: '',
    name_en: '',
    muscle_group: 'chest',
    difficulty: 'beginner',
    category: 'compound',
    equipment: ''
  });

  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  const addDay = () => {
    const newDay: WorkoutDay = {
      id: Math.random().toString(),
      day_number: days.length + 1,
      name_fa: `روز ${days.length + 1}`,
      rest_day: false,
      exercises: []
    };
    setDays([...days, newDay]);
  };

  const addExerciseToDay = (dayId: string) => {
    setDays(days.map(d => {
      if (d.id !== dayId) return d;
      const defaultEx = exercises[0];
      const newEx: WorkoutExercise = {
        id: Math.random().toString(),
        exercise_id: defaultEx.id,
        exercise: defaultEx,
        sets: 3,
        reps: '10',
        rest_seconds: 60
      };
      return { ...d, exercises: [...(d.exercises || []), newEx] };
    }));
  };

  const updateExVal = (dayId: string, exId: string, field: keyof WorkoutExercise, value: any) => {
    setDays(days.map(d => d.id === dayId ? {
      ...d, 
      exercises: d.exercises?.map(item => item.id === exId ? { ...item, [field]: value } : item)
    } : d));
  };

  const handleSave = (isTemplate: boolean = false) => {
    if (!programName) return alert(t('نام برنامه الزامی است', 'Program name is required'));
    const program: Program = {
      id: editingTemplateId || Math.random().toString(),
      name_fa: programName,
      duration_weeks: 4,
      days_per_week: days.length,
      is_active: false,
      is_template: isTemplate,
      workout_days: days
    };
    
    if (isTemplate) {
      addTemplate(program);
      alert(t('قالب با موفقیت ذخیره شد', 'Template saved successfully'));
      setEditingTemplateId(null);
    } else {
      addProgram(program);
      alert(t('برنامه در لیست برنامه‌ها ذخیره شد', 'Program saved to list'));
    }
  };

  const loadTemplateForEdit = (tpl: Program) => {
    setProgramName(tpl.name_fa || tpl.name_en || '');
    setDays(tpl.workout_days || []);
    setEditingTemplateId(tpl.id);
    setActiveTab('build');
  };

  const resetBuilder = () => {
    setProgramName('');
    setDays([]);
    setEditingTemplateId(null);
  };

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => 
      (language === 'fa' ? ex.name_fa : ex.name_en).toLowerCase().includes(exSearch.toLowerCase()) ||
      ex.muscle_group.toLowerCase().includes(exSearch.toLowerCase())
    );
  }, [exSearch, language, exercises]);

  const selectExercise = (exercise: Exercise) => {
    if (!isExerciseSelectorOpen) return;
    updateExVal(isExerciseSelectorOpen.dayId, isExerciseSelectorOpen.exId, 'exercise', exercise);
    updateExVal(isExerciseSelectorOpen.dayId, isExerciseSelectorOpen.exId, 'exercise_id', exercise.id);
    setIsExerciseSelectorOpen(null);
    setExSearch('');
  };

  const handleCreateExercise = () => {
    if (!newExForm.name_fa || !newExForm.name_en) {
      alert(t('نام فارسی و انگلیسی حرکت الزامی است', 'Both Persian and English names are required'));
      return;
    }
    const newEx: Exercise = {
      id: `custom-${Date.now()}`,
      name_fa: newExForm.name_fa!,
      name_en: newExForm.name_en!,
      muscle_group: newExForm.muscle_group!,
      difficulty: newExForm.difficulty as Difficulty,
      category: newExForm.category as Category,
      equipment: newExForm.equipment || 'No Equipment'
    };
    addExercise(newEx);
    setIsExerciseCreatorOpen(false);
    setNewExForm({
      name_fa: '',
      name_en: '',
      muscle_group: 'chest',
      difficulty: 'beginner',
      category: 'compound',
      equipment: ''
    });
  };

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Layout className="text-amber-500" size={32} />
            {t('مدیریت پروتکل‌های تمرینی', 'Protocol Management')}
          </h1>
          <div className="flex bg-slate-800/80 p-1.5 rounded-2xl mt-4 w-fit border border-slate-700/50 shadow-lg">
            {[
              { id: 'build', icon: Edit3, label: t('طراحی جدید', 'Builder') },
              { id: 'templates', icon: BookOpen, label: t('کتابخانه قالب‌ها', 'Templates') },
              { id: 'assign', icon: UserPlus, label: t('تخصیص برنامه', 'Assign') },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id ? 'bg-amber-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'build' && (
          <div className="flex items-center gap-3">
            <button 
              onClick={resetBuilder}
              className="text-slate-500 hover:text-white px-4 py-2 text-sm font-bold"
            >
              {t('پاکسازی', 'Clear')}
            </button>
            <button 
              onClick={() => handleSave(true)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-500 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-slate-700 shadow-xl"
            >
              <Copy size={18} />
              {editingTemplateId ? t('بروزرسانی قالب', 'Update Template') : t('ذخیره به عنوان قالب', 'Save Template')}
            </button>
          </div>
        )}
      </header>

      {activeTab === 'templates' && (
        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {templates.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-800">
               <BookOpen className="mx-auto text-slate-800 mb-6" size={64} />
               <p className="text-slate-500 font-bold text-lg">{t('هنوز قالبی طراحی نکرده‌اید', 'No templates in your library yet')}</p>
               <button onClick={() => setActiveTab('build')} className="mt-4 text-amber-500 hover:underline font-bold">{t('همین حالا یکی بسازید', 'Create one now')}</button>
            </div>
          ) : (
            templates.map(tpl => (
              <div 
                key={tpl.id} 
                className="bg-slate-900/80 p-8 rounded-[2rem] border border-slate-800 flex flex-col justify-between group hover:border-amber-500/50 transition-all shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">{tpl.name_fa}</h3>
                    <div className="bg-amber-600/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                      Starter Template
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">{tpl.days_per_week} {t('روز تمرینی در هفته', 'Training days per week')}</p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => loadTemplateForEdit(tpl)}
                    className="flex-1 bg-slate-800 hover:bg-amber-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Edit3 size={16} />
                    {t('ویرایش و اصلاح', 'Edit & Refine')}
                  </button>
                  <button 
                    onClick={() => {
                      setAssignTargetProgramId(tpl.id);
                      setActiveTab('assign');
                    }}
                    className="bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 p-3 rounded-xl border border-amber-500/20 transition-all"
                  >
                    <UserPlus size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'assign' && (
        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
               <h2 className="text-2xl font-black text-white">{t('تخصیص برنامه به شاگردان', 'Assign Program to Athletes')}</h2>
               <p className="text-slate-500 text-sm">{t('یک پروتکل انتخاب کنید و آن را برای تمام یا بخشی از شاگردان منتشر کنید', 'Select a protocol and publish it to one or more athletes')}</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2">{t('۱. انتخاب پروتکل (قالب)', '1. Select Protocol')}</label>
              <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto no-scrollbar">
                {templates.map(tpl => (
                  <button 
                    key={tpl.id}
                    onClick={() => setAssignTargetProgramId(tpl.id)}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      assignTargetProgramId === tpl.id ? 'bg-amber-600 border-amber-400 text-white shadow-lg scale-[1.02]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={16} />
                      <span className="font-bold">{tpl.name_fa}</span>
                    </div>
                    {assignTargetProgramId === tpl.id && <CheckCircle2 size={18} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end px-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{t('۲. انتخاب شاگردان مقصد', '2. Target Athletes')}</label>
                <button 
                  onClick={() => setAssignTraineeIds(assignTraineeIds.length === managedTrainees.length ? [] : managedTrainees.map(t => t.id))}
                  className="text-[10px] font-black text-amber-500 hover:underline uppercase tracking-widest"
                >
                  {assignTraineeIds.length === managedTrainees.length ? t('لغو انتخاب همه', 'Deselect All') : t('انتخاب تمام شاگردان', 'Select All')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {managedTrainees.map(trainee => (
                  <button 
                    key={trainee.id}
                    onClick={() => setAssignTraineeIds(prev => prev.includes(trainee.id) ? prev.filter(id => id !== trainee.id) : [...prev, trainee.id])}
                    className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                      assignTraineeIds.includes(trainee.id) ? 'bg-indigo-600/10 border-indigo-500 shadow-lg' : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${assignTraineeIds.includes(trainee.id) ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                      {trainee.full_name[0]}
                    </div>
                    <span className={`text-sm font-bold ${assignTraineeIds.includes(trainee.id) ? 'text-white' : 'text-slate-400'}`}>{trainee.full_name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={!assignTargetProgramId || assignTraineeIds.length === 0}
              onClick={() => {
                const program = templates.find(t => t.id === assignTargetProgramId);
                if (program) {
                  assignProgram(program, assignTraineeIds);
                  alert(t('برنامه با موفقیت اختصاص یافت و برای شاگردان ارسال شد', 'Program successfully assigned and sent to athletes'));
                  setAssignTraineeIds([]);
                  setAssignTargetProgramId(null);
                }
              }}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-3 mt-4"
            >
              <CheckCircle2 size={24} />
              {t('تایید و انتشار برنامه برای شاگردان', 'Confirm & Publish Protocol')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'build' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">{t('نام پروتکل تمرینی', 'Protocol Identity')}</label>
              <input 
                type="text" 
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder={t('مثال: پکیج کاهش وزن نسترن ۱', 'e.g. Weight Loss Package 1')}
                className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl px-8 py-5 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all font-black text-xl placeholder:text-slate-700"
              />
            </div>
          </section>

          <div className="space-y-10">
            {days.map((day) => (
              <div key={day.id} className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 lg:p-12 space-y-10 shadow-2xl">
                <div className="flex justify-between items-center pb-8 border-b border-slate-800/50">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-amber-600/20">
                      <Calendar size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white">{t(`روز ${day.day_number}`, `Day ${day.day_number}`)}</h3>
                      <input 
                        type="text"
                        value={day.name_fa}
                        onChange={(e) => setDays(days.map(d => d.id === day.id ? { ...d, name_fa: e.target.value } : d))}
                        placeholder={t('نام روز (مثلاً عضلات سینه)', 'Day Name (e.g. Chest)')}
                        className="bg-transparent border-none outline-none text-amber-500 font-bold text-sm w-full placeholder:text-slate-800"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setDays(days.filter(d => d.id !== day.id))}
                    className="p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  {day.exercises?.map((ex) => (
                    <div key={ex.id} className="bg-slate-800/30 p-8 rounded-[2rem] border border-slate-700/30 flex flex-col xl:flex-row items-center gap-10 relative group hover:bg-slate-800/50 transition-all">
                      <div className="flex-1 w-full space-y-4">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">{t('انتخاب حرکت تمرینی', 'Exercise Selection')}</label>
                        <button 
                          onClick={() => setIsExerciseSelectorOpen({ dayId: day.id, exId: ex.id })}
                          className="w-full bg-slate-900 text-white rounded-2xl px-6 py-5 border border-slate-700 flex justify-between items-center group-hover:border-amber-500/50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-amber-500">
                               <Dumbbell size={24} />
                            </div>
                            <span className="font-black text-lg">{language === 'fa' ? ex.exercise?.name_fa : ex.exercise?.name_en}</span>
                          </div>
                          <ChevronDown size={24} className="text-slate-600" />
                        </button>
                      </div>

                      <div className="flex items-center gap-8 shrink-0 bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50">
                        <WheelPicker 
                          label={t('ست', 'Sets')} 
                          min={1} max={12} 
                          value={ex.sets} 
                          onChange={(v) => updateExVal(day.id, ex.id, 'sets', v)} 
                        />
                        <WheelPicker 
                          label={t('تکرار', 'Reps')} 
                          min={1} max={120} 
                          value={parseInt(ex.reps as string) || 10} 
                          onChange={(v) => updateExVal(day.id, ex.id, 'reps', v.toString())} 
                        />
                        <WheelPicker 
                          label={t('استراحت', 'Rest')} 
                          min={0} max={600} step={15}
                          value={ex.rest_seconds} 
                          onChange={(v) => updateExVal(day.id, ex.id, 'rest_seconds', v)} 
                        />
                      </div>
                      
                      <button 
                        onClick={() => {
                           const newDayExercises = day.exercises?.filter(item => item.id !== ex.id);
                           setDays(days.map(d => d.id === day.id ? { ...d, exercises: newDayExercises } : d));
                        }}
                        className="xl:relative absolute top-6 left-6 xl:top-auto xl:left-auto p-3 text-slate-700 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => addExerciseToDay(day.id)}
                    className="w-full py-12 border-2 border-dashed border-slate-800/50 rounded-[2rem] text-slate-500 hover:text-amber-500 hover:border-amber-500/50 transition-all flex flex-col items-center justify-center gap-4 group hover:bg-slate-800/20"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-2xl">
                      <Plus size={32} />
                    </div>
                    <span className="font-black text-xl">{t('افزودن حرکت جدید به این روز', 'Add New Movement')}</span>
                  </button>
                </div>
              </div>
            ))}

            <button 
              onClick={addDay}
              className="w-full py-20 bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center gap-6 hover:bg-slate-900 transition-all group active:scale-[0.98] shadow-inner"
            >
              <div className="w-24 h-24 bg-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-400 group-hover:bg-amber-600 group-hover:text-white group-hover:rotate-90 transition-all duration-500 shadow-2xl">
                <Plus size={48} />
              </div>
              <div className="text-center">
                <span className="block font-black text-2xl text-slate-500 group-hover:text-slate-300">{t('افزودن روز تمرینی جدید به پروتکل', 'Add New Training Day')}</span>
                <span className="text-sm text-slate-600 uppercase tracking-[0.3em] mt-2 block">{t('پلان اختصاصی برای روزهای هفته', 'Build Specific Routine')}</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Exercise Selector Modal */}
      {isExerciseSelectorOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-xl rounded-[3rem] overflow-hidden flex flex-col border border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-400">
            <header className="p-8 border-b border-slate-800 flex justify-between items-center">
               <div>
                  <h3 className="text-2xl font-black text-white">{t('بانک حرکات بدنسازی', 'Exercise Database')}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">{exercises.length} {t('حرکت بارگذاری شده', 'Available movements')}</p>
               </div>
               <button 
                onClick={() => { setIsExerciseSelectorOpen(null); setExSearch(''); }}
                className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90"
               >
                 <X size={24} />
               </button>
            </header>
            
            <div className="p-6 border-b border-slate-800 flex gap-2">
               <div className="relative flex-1">
                 <Search className="absolute left-6 top-5 text-slate-500" size={20} />
                 <input 
                  type="text" 
                  autoFocus
                  placeholder={t('جستجوی نام حرکت...', 'Search by movement name...')}
                  className="w-full bg-slate-800 border-none rounded-2xl py-5 px-14 text-white outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-lg"
                  value={exSearch}
                  onChange={(e) => setExSearch(e.target.value)}
                 />
               </div>
               <button 
                onClick={() => setIsExerciseCreatorOpen(true)}
                className="bg-amber-600 text-white px-6 rounded-2xl font-black hover:bg-amber-500 transition-all shadow-xl"
               >
                 <Plus size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[55vh] p-6 space-y-3 no-scrollbar">
              {filteredExercises.map(ex => (
                <button 
                  key={ex.id}
                  onClick={() => selectExercise(ex)}
                  className="w-full text-right bg-slate-800/40 hover:bg-slate-800 p-5 rounded-3xl border border-slate-700/30 transition-all flex items-center justify-between group hover:scale-[1.01] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600 group-hover:text-amber-500 transition-colors shadow-lg">
                      <Dumbbell size={28} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-white text-lg">{language === 'fa' ? ex.name_fa : ex.name_en}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-900 px-2 py-0.5 rounded-md">{ex.muscle_group}</span>
                        <span className="text-[10px] text-amber-500/70 uppercase font-bold tracking-widest">{ex.equipment}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-700 group-hover:text-amber-500 transition-all" size={20} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Exercise Creator Modal */}
      {isExerciseCreatorOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
              <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                 <h3 className="text-2xl font-black text-white italic">{t('افزودن حرکت به کتابخانه', 'Add New Movement')}</h3>
                 <button onClick={() => setIsExerciseCreatorOpen(false)} className="p-2 text-slate-500 hover:text-white"><X size={24} /></button>
              </header>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('نام فارسی', 'Persian Name')}</label>
                          <input type="text" value={newExForm.name_fa} onChange={(e) => setNewExForm({...newExForm, name_fa: e.target.value})} className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-1 focus:ring-amber-500" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('نام انگلیسی', 'English Name')}</label>
                          <input type="text" value={newExForm.name_en} onChange={(e) => setNewExForm({...newExForm, name_en: e.target.value})} className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-1 focus:ring-amber-500" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('عضله هدف', 'Target Muscle')}</label>
                       <select value={newExForm.muscle_group} onChange={(e) => setNewExForm({...newExForm, muscle_group: e.target.value})} className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-1 focus:ring-amber-500 appearance-none">
                          <option value="chest">{t('سینه', 'Chest')}</option>
                          <option value="back">{t('پشت', 'Back')}</option>
                          <option value="legs">{t('پا', 'Legs')}</option>
                          <option value="shoulders">{t('سرشانه', 'Shoulders')}</option>
                          <option value="arms">{t('بازو', 'Arms')}</option>
                          <option value="core">{t('شکم', 'Core')}</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('تجهیزات لازم', 'Equipment')}</label>
                       <input type="text" value={newExForm.equipment} onChange={(e) => setNewExForm({...newExForm, equipment: e.target.value})} placeholder={t('مثال: دمبل، هالتر...', 'e.g. Dumbbell, Barbell...')} className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-1 focus:ring-amber-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('سطح سختی', 'Difficulty')}</label>
                          <select value={newExForm.difficulty} onChange={(e) => setNewExForm({...newExForm, difficulty: e.target.value as any})} className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-1 focus:ring-amber-500 appearance-none">
                            <option value="beginner">{t('مبتدی', 'Beginner')}</option>
                            <option value="intermediate">{t('متوسط', 'Intermediate')}</option>
                            <option value="advanced">{t('حرفه‌ای', 'Advanced')}</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{t('دسته‌بندی', 'Category')}</label>
                          <select value={newExForm.category} onChange={(e) => setNewExForm({...newExForm, category: e.target.value as any})} className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-1 focus:ring-amber-500 appearance-none">
                            <option value="compound">{t('ترکیبی', 'Compound')}</option>
                            <option value="isolation">{t('تک‌مفصلی', 'Isolation')}</option>
                            <option value="cardio">{t('هوازی', 'Cardio')}</option>
                          </select>
                       </div>
                    </div>
                 </div>
                 <button 
                  onClick={handleCreateExercise}
                  className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95"
                 >
                   {t('ثبت در کتابخانه حرکات', 'Save to Library')}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProgramArchitect;
