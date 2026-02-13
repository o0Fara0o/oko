
import React, { useRef, useState } from 'react';
import { Camera, User, Phone, Ruler, Scale, Ruler as MeasurementIcon, Save, Image as ImageIcon, CheckCircle2, ChevronDown, X, Info, Sparkles, GraduationCap, Briefcase, Award, Clock, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { BodyMeasurements } from '../types';
import WheelPicker from './Trainer/WheelPicker';

const ProfileSettings: React.FC = () => {
  const { language, profile, updateProfile } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeRefSlot, setActiveRefSlot] = useState<'face' | 'front' | 'angle' | null>(null);
  const [activePicker, setActivePicker] = useState<'goal' | 'gender' | 'height' | 'weight' | 'experience' | keyof BodyMeasurements | null>(null);
  
  const t = (fa: string, en: string) => language === 'fa' ? fa : en;
  const isTrainer = profile?.role === 'trainer';

  const goalOptions = [
    { value: 'muscle_gain', label_fa: 'افزایش حجم عضلانی', label_en: 'Muscle Gain' },
    { value: 'fat_loss', label_fa: 'کاهش درصد چربی', label_en: 'Fat Loss' },
    { value: 'strength', label_fa: 'افزایش قدرت بیومکانیکی', label_en: 'Strength' },
    { value: 'endurance', label_fa: 'استقامت قلبی عروقی', label_en: 'Endurance' },
    { value: 'flexibility', label_fa: 'انعطاف‌پذیری و موبیلیتی', label_en: 'Flexibility' },
  ];

  const expertiseOptions = [
    'Hypertrophy', 'Biomechanics', 'Fat Loss', 'Nutrition', 'Powerlifting', 'Yoga', 'HIIT', 'Rehab'
  ];

  const handleExpertiseToggle = (skill: string) => {
    const current = profile?.expertise || [];
    const updated = current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill];
    updateProfile({ expertise: updated });
  };

  const genderOptions = [
    { value: 'male', label_fa: 'مرد', label_en: 'Male' },
    { value: 'female', label_fa: 'زن', label_en: 'Female' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatar_data: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentCerts = profile?.certificates || [];
        updateProfile({ certificates: [...currentCerts, reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeRefSlot) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentRefs = profile?.reference_images || {};
        updateProfile({ reference_images: { ...currentRefs, [activeRefSlot]: reader.result as string } });
        setActiveRefSlot(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = (field: string, value: any) => {
    updateProfile({ [field]: value });
  };

  const handleMeasurementUpdate = (field: keyof BodyMeasurements, value: number) => {
    const measurements = { ...profile?.body_measurements, [field]: value };
    updateProfile({ body_measurements: measurements });
  };

  const currentGoalLabel = goalOptions.find(g => g.value === profile?.goal)?.[language === 'fa' ? 'label_fa' : 'label_en'] || t('انتخاب هدف', 'Select Goal');
  const currentGenderLabel = genderOptions.find(g => g.value === profile?.gender)?.[language === 'fa' ? 'label_fa' : 'label_en'] || t('انتخاب جنسیت', 'Select Gender');

  // Wheel Picker Configs
  const pickerConfigs: Record<string, { min: number, max: number, step: number, label: string }> = {
    height: { min: 140, max: 230, step: 1, label: t('قد (سانتی‌متر)', 'Height (cm)') },
    weight: { min: 40, max: 180, step: 0.5, label: t('وزن (کیلوگرم)', 'Weight (kg)') },
    experience: { min: 1, max: 40, step: 1, label: t('سابقه (سال)', 'Experience (Years)') },
    chest: { min: 60, max: 180, step: 0.5, label: t('دور سینه', 'Chest') },
    waist: { min: 50, max: 150, step: 0.5, label: t('دور کمر', 'Waist') },
    hips: { min: 60, max: 160, step: 0.5, label: t('دور باسن', 'Hips') },
    arms: { min: 15, max: 70, step: 0.5, label: t('دور بازو', 'Arms') },
    thighs: { min: 30, max: 100, step: 0.5, label: t('دور ران', 'Thighs') },
    neck: { min: 25, max: 60, step: 0.5, label: t('دور گردن', 'Neck') },
  };

  const renderPickerModal = () => {
    if (!activePicker) return null;

    if (activePicker === 'goal' || activePicker === 'gender') {
      return (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-slate-900 rounded-t-[3rem] border-t border-slate-800 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-500">
              <div className="p-8 space-y-6">
                 <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-white">{activePicker === 'goal' ? t('انتخاب هدف ورزشی', 'Select Fitness Goal') : t('انتخاب جنسیت', 'Select Gender')}</h4>
                    <button onClick={() => setActivePicker(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
                 </div>
                 <div className="space-y-2 max-h-[40vh] overflow-y-auto no-scrollbar py-4">
                    {(activePicker === 'goal' ? goalOptions : genderOptions).map((opt) => (
                      <button 
                        key={opt.value}
                        onClick={() => { handleUpdate(activePicker, opt.value); setActivePicker(null); }}
                        className={`w-full p-6 rounded-2xl text-right flex items-center justify-between transition-all ${
                          (activePicker === 'goal' ? profile?.goal : profile?.gender) === opt.value ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                         <span className="font-bold text-lg">{opt[language === 'fa' ? 'label_fa' : 'label_en']}</span>
                         {(activePicker === 'goal' ? profile?.goal : profile?.gender) === opt.value && <CheckCircle2 size={24} />}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      );
    }

    const config = pickerConfigs[activePicker as string];
    const currentValue = activePicker === 'height' || activePicker === 'weight' || activePicker === 'experience'
      ? profile?.[activePicker as 'height' | 'weight' | 'experience_years'] || config.min
      : profile?.body_measurements?.[activePicker as keyof BodyMeasurements] || config.min;

    return (
      <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
         <div className="w-full max-w-lg bg-slate-900 rounded-t-[3rem] border-t border-slate-800 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-500">
            <div className="p-8 space-y-8">
               <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-black text-white">{config.label}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-black mt-1">{t('مقدار دقیق را انتخاب کنید', 'Select precise value')}</p>
                  </div>
                  <button onClick={() => setActivePicker(null)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90"><X size={24} /></button>
               </div>
               
               <div className="flex justify-center py-10 scale-150 transform">
                 <WheelPicker 
                    min={config.min} 
                    max={config.max} 
                    step={config.step} 
                    value={currentValue} 
                    onChange={(val) => {
                      if (activePicker === 'height' || activePicker === 'weight') {
                        handleUpdate(activePicker, val);
                      } else if (activePicker === 'experience') {
                        handleUpdate('experience_years', val);
                      } else {
                        handleMeasurementUpdate(activePicker as keyof BodyMeasurements, val);
                      }
                    }} 
                 />
               </div>

               <button 
                  onClick={() => setActivePicker(null)}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
               >
                 {t('تایید و ثبت', 'Confirm & Save')}
               </button>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic">{t('پروفایل حرفه‌ای', 'Professional Portfolio')}</h1>
          <p className="text-slate-400 mt-1 font-medium">
            {isTrainer ? t('مدیریت برند مربیگری و رزومه تخصصی', 'Manage coaching brand & professional resume') : t('مدیریت هویت ورزشی و شاخص‌های آنتروپومتریک', 'Manage identity and anthropometric metrics')}
          </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden group">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2rem] border-4 border-slate-800 overflow-hidden bg-slate-800 shadow-2xl relative">
                {profile?.avatar_data ? (
                  <img src={profile.avatar_data} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
                    <User size={64} />
                  </div>
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="text-white" size={32} />
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">{profile?.full_name}</h2>
              <p className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em] mt-2">
                {t(isTrainer ? 'سرمربی ارشد' : 'ورزشکار حرفه‌ای', isTrainer ? 'Senior Head Coach' : 'Pro Athlete')}
              </p>
            </div>

            <div className="w-full h-px bg-slate-800/50" />

            <div className="w-full grid grid-cols-2 gap-4">
              <button 
                onClick={() => setActivePicker(isTrainer ? 'experience' : 'height')}
                className="text-center p-3 rounded-2xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
              >
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{isTrainer ? t('سابقه', 'Exp') : t('قد', 'Height')}</span>
                <p className="font-black text-xl text-white mt-1">{isTrainer ? profile?.experience_years : profile?.height} <small className="text-[10px] opacity-40">{isTrainer ? 'YR' : 'CM'}</small></p>
              </button>
              <button 
                onClick={() => setActivePicker('weight')}
                className="text-center p-3 rounded-2xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
              >
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{t('وزن', 'Weight')}</span>
                <p className="font-black text-xl text-white mt-1">{profile?.weight || '--'} <small className="text-[10px] opacity-40">KG</small></p>
              </button>
            </div>
          </div>

          {isTrainer ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
               <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  {t('گواهینامه‌ها و مدارک', 'Certificates')}
               </h3>
               
               <div className="grid grid-cols-2 gap-3">
                  {profile?.certificates?.map((cert, idx) => (
                    <div key={idx} className="aspect-square rounded-2xl border border-slate-800 overflow-hidden relative group">
                       <img src={cert} className="w-full h-full object-cover" />
                       <button 
                        onClick={() => {
                          const updated = profile.certificates?.filter((_, i) => i !== idx);
                          updateProfile({ certificates: updated });
                        }}
                        className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X size={12} />
                       </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => certFileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 hover:border-amber-500 hover:bg-amber-500/5 transition-all text-slate-600 hover:text-amber-500"
                  >
                    <Plus size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('افزودن مدرک', 'Add Cert')}</span>
                  </button>
                  <input type="file" ref={certFileInputRef} className="hidden" accept="image/*" onChange={handleCertUpload} />
               </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
               <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={18} className="text-indigo-400" />
                  {t('کتابخانه مرجع نسترن', 'Nastaran Ref Library')}
               </h3>
               
               <div className="bg-indigo-600/5 border border-indigo-500/20 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Info size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('راهنمای عکاسی مرجع', 'Photo Guide')}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {t('برای شبیه‌سازی دقیق، عکس‌ها را در محیطی با نور کافی و پس‌زمینه ساده بگیرید.', 'For accurate AI simulation, take photos in a well-lit area.')}
                  </p>
               </div>

               <div className="grid grid-cols-3 gap-3">
                  {(['face', 'front', 'angle'] as const).map((slot) => (
                    <button 
                      key={slot}
                      onClick={() => { setActiveRefSlot(slot); refFileInputRef.current?.click(); }}
                      className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group ${
                        profile?.reference_images?.[slot] ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-600 bg-slate-950/50'
                      }`}
                    >
                      {profile?.reference_images?.[slot] ? (
                        <>
                          <img src={profile.reference_images[slot]} className="absolute inset-0 w-full h-full object-cover" />
                        </>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500"><ImageIcon size={16} /></div>
                      )}
                    </button>
                  ))}
               </div>
               <input type="file" ref={refFileInputRef} hidden accept="image/*" onChange={handleRefImageUpload} />
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-10">
          <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 lg:p-10 space-y-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3 italic">
              <User size={24} className="text-indigo-400" />
              {t('اطلاعات پایه و هویت', 'Coach Identity')}
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className={`space-y-3 ${isTrainer ? 'md:col-span-2' : ''}`}>
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">{t('نام کامل', 'Full Name')}</label>
                <input type="text" value={profile?.full_name} onChange={(e) => handleUpdate('full_name', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold" />
              </div>
              {!isTrainer && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">{t('هدف اصلی ورزشی', 'Primary Goal')}</label>
                  <button onClick={() => setActivePicker('goal')} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white flex justify-between items-center font-bold">
                    {currentGoalLabel}
                    <ChevronDown size={18} className="text-slate-600" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {isTrainer ? (
            <>
              <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 lg:p-10 space-y-8 shadow-2xl">
                <h3 className="text-xl font-black text-white flex items-center gap-3 italic">
                  <GraduationCap size={24} className="text-amber-500" />
                  {t('تخصص و مهارت‌ها', 'Expertise & Skills')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expertiseOptions.map(skill => (
                    <button 
                      key={skill}
                      onClick={() => handleExpertiseToggle(skill)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${
                        profile?.expertise?.includes(skill) ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 lg:p-10 space-y-8">
                <h3 className="text-xl font-black text-white flex items-center gap-3 italic">
                  <Briefcase size={24} className="text-indigo-400" />
                  {t('خلاصه رزومه حرفه‌ای', 'Professional Resume')}
                </h3>
                <textarea 
                  value={profile?.resume_summary || ''}
                  onChange={(e) => handleUpdate('resume_summary', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-[2.5rem] px-8 py-6 text-slate-300 focus:ring-2 focus:ring-indigo-600 outline-none h-40 font-medium resize-none leading-relaxed"
                  placeholder={t('درباره تجربیات و دستاوردهای خود بنویسید...', 'Tell us about your coaching journey...')}
                />
              </section>
            </>
          ) : (
            <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 lg:p-10 space-y-8 shadow-2xl">
              <h3 className="text-xl font-black text-white flex items-center gap-3 italic">
                <MeasurementIcon size={24} className="text-amber-500" />
                {t('آنتروپومتری (ابعاد بدنی)', 'Anthropometric Metrics')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { id: 'chest', label: t('سینه', 'Chest') },
                  { id: 'waist', label: t('کمر', 'Waist') },
                  { id: 'hips', label: t('باسن', 'Hips') },
                  { id: 'arms', label: t('بازو', 'Arms') },
                  { id: 'thighs', label: t('ران', 'Thighs') },
                  { id: 'neck', label: t('گردن', 'Neck') }
                ].map((m) => (
                  <div key={m.id} className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">{m.label}</label>
                    <button 
                      onClick={() => setActivePicker(m.id as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white flex justify-between items-center group hover:border-amber-500 transition-all shadow-inner"
                    >
                      <span className="font-black text-xl">{profile?.body_measurements?.[m.id as keyof BodyMeasurements] || '--'}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-black">CM</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <button className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.98]">
            <Save size={24} />
            {t('ثبت نهایی و بروزرسانی پرونده', 'Finalize & Update Portfolio')}
          </button>
        </div>
      </div>

      {renderPickerModal()}
    </div>
  );
};

export default ProfileSettings;
