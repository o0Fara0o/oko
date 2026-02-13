
import React, { useState } from 'react';
import { 
  Calendar, Clock, Plus, Trash2, UserPlus, X, CheckCircle2, 
  Star, Sparkles, MessageSquare, User, ChevronRight, 
  MapPin, Filter, MoreVertical, Layout, Zap, ChevronLeft
} from 'lucide-react';
import { useStore } from '../../store';
import { SlotType } from '../../types';

const ScheduleManager: React.FC = () => {
  const { 
    language, profile, managedTrainees, gyms,
    bookSession, cancelSession, addAvailabilitySlot, removeAvailabilitySlot 
  } = useStore();
  
  const [activeDay, setActiveDay] = useState('Saturday');
  const [selectedGymId, setSelectedGymId] = useState<string>('all');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<{ day: string; slotId: string } | null>(null);
  const [isSlotCreatorOpen, setIsSlotCreatorOpen] = useState(false);
  
  // New Slot Form State
  const [newSlotTime, setNewSlotTime] = useState('09:00');
  const [newSlotGymId, setNewSlotGymId] = useState(gyms[0]?.id || '');
  const [newSlotType, setNewSlotType] = useState<SlotType>('normal');

  const t = (fa: string, en: string) => language === 'fa' ? fa : en;
  const isTrainer = profile?.role === 'trainer';

  const days = [
    { id: 'Saturday', fa: 'شنبه' },
    { id: 'Sunday', fa: 'یکشنبه' },
    { id: 'Monday', fa: 'دوشنبه' },
    { id: 'Tuesday', fa: 'سه‌شنبه' },
    { id: 'Wednesday', fa: 'چهارشنبه' },
    { id: 'Thursday', fa: 'پنج‌شنبه' },
    { id: 'Friday', fa: 'جمعه' },
  ];

  const currentDayAvailability = profile?.availability?.find(a => a.day === activeDay);
  
  const filteredSlots = currentDayAvailability?.slots.filter(slot => 
    selectedGymId === 'all' || slot.gym_id === selectedGymId
  ).sort((a, b) => a.time.localeCompare(b.time)) || [];

  const handleAddSlot = () => {
    addAvailabilitySlot(activeDay, {
      time: newSlotTime,
      gym_id: newSlotGymId,
      type: newSlotType
    });
    setIsSlotCreatorOpen(false);
  };

  const handleBook = (traineeId: string) => {
    if (isBookingModalOpen) {
      bookSession(traineeId, isBookingModalOpen.day, isBookingModalOpen.slotId);
      setIsBookingModalOpen(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tight uppercase flex items-center gap-3">
             <Layout className="text-indigo-500" size={32} />
             {t('پلتفرم زمان‌بندی هوشمند', 'Smart Scheduling Engine')}
          </h1>
          <p className="text-slate-400 font-medium mt-1">{t('مدیریت ظرفیت شعب و تخصیص سانس‌های عادی و VIP', 'Manage branch capacity and allocate normal/VIP slots')}</p>
        </div>
        <button 
          onClick={() => setIsSlotCreatorOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-[1.8rem] font-black flex items-center gap-3 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={24} />
          {t('تعریف سانس جدید', 'Create New Slot')}
        </button>
      </header>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
        {days.map((day) => (
          <button 
            key={day.id}
            onClick={() => setActiveDay(day.id)}
            className={`px-8 py-4 rounded-2xl text-xs font-black transition-all border whitespace-nowrap uppercase tracking-widest ${
              activeDay === day.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl scale-105' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
            }`}
          >
            {language === 'fa' ? day.fa : day.id}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Gym Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Filter size={14} />
                 {t('فیلتر بر اساس شعبه', 'Filter by Gym')}
              </h3>
              <div className="space-y-2">
                 <button 
                  onClick={() => setSelectedGymId('all')}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border ${
                    selectedGymId === 'all' ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}
                 >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Layout size={18} /></div>
                    <span className="font-black text-xs uppercase tracking-widest">{t('تمام شعب', 'All Locations')}</span>
                 </button>
                 {gyms.map(gym => (
                   <button 
                    key={gym.id}
                    onClick={() => setSelectedGymId(gym.id)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all border ${
                      selectedGymId === gym.id ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                   >
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><MapPin size={18} /></div>
                      <div className="text-left overflow-hidden">
                         <p className="font-black text-[10px] uppercase truncate">{language === 'fa' ? gym.name_fa : gym.name_en}</p>
                      </div>
                   </button>
                 ))}
              </div>
           </div>

           <div className="bg-amber-600/10 border border-amber-500/20 p-8 rounded-[2.5rem] space-y-4">
              <Sparkles className="text-amber-500" size={24} />
              <h4 className="text-white font-black italic">{t('سیستم مدیریت VIP', 'VIP Management')}</h4>
              <p className="text-xs text-amber-500/80 leading-relaxed font-bold">
                {t('سانس‌های VIP فقط برای ورزشکاران با اشتراک ویژه قابل رزرو هستند و با رنگ طلایی متمایز شده‌اند.', 'VIP slots are exclusive to premium athletes and marked in gold.')}
              </p>
           </div>
        </aside>

        {/* Schedule Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 lg:p-12 space-y-10 shadow-2xl relative overflow-hidden">
            <header className="flex justify-between items-center border-b border-slate-800/50 pb-8">
               <h2 className="text-2xl font-black text-white italic">{t('سانس‌های زمان‌بندی شده', 'Active Slots')}</h2>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase">{t('عادی', 'Normal')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase">{t('ویژه', 'VIP')}</span>
                  </div>
               </div>
            </header>

            <div className="grid md:grid-cols-2 gap-4">
               {filteredSlots.length === 0 ? (
                 <div className="md:col-span-2 py-20 flex flex-col items-center justify-center gap-4 text-slate-600">
                    <Clock size={48} className="opacity-20" />
                    <p className="font-black text-lg italic">{t('سانسی برای این روز و شعبه تعریف نشده است.', 'No slots defined for this day and location.')}</p>
                 </div>
               ) : (
                 filteredSlots.map((slot) => {
                   const trainee = managedTrainees.find(t => t.id === slot.booked_trainee_id);
                   const gym = gyms.find(g => g.id === slot.gym_id);
                   const isVip = slot.type === 'vip';
                   
                   return (
                     <div key={slot.id} className={`p-6 rounded-[2.2rem] border transition-all flex flex-col gap-5 relative group overflow-hidden ${
                       slot.booked_trainee_id 
                         ? isVip ? 'bg-amber-600 border-amber-400 text-white shadow-amber-600/20' : 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-600/20'
                         : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                     }`}>
                        <div className="flex justify-between items-start relative z-10">
                           <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                slot.booked_trainee_id ? 'bg-white/20' : isVip ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                              }`}>
                                 {isVip ? <Star size={24} fill={slot.booked_trainee_id ? "white" : "none"} /> : <Clock size={24} />}
                              </div>
                              <div>
                                 <p className="text-2xl font-black italic tracking-tighter tabular-nums">{slot.time}</p>
                                 <p className={`text-[9px] font-black uppercase tracking-widest ${slot.booked_trainee_id ? 'text-white/70' : 'text-slate-600'}`}>
                                    {gym?.name_fa || t('شعبه نامشخص', 'Unknown Gym')}
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              {slot.booked_trainee_id ? (
                                <button 
                                  onClick={() => cancelSession(activeDay, slot.id)}
                                  className="p-3 bg-white/10 hover:bg-rose-600 rounded-2xl transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => removeAvailabilitySlot(activeDay, slot.id)}
                                    className="p-3 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                  <button 
                                    onClick={() => setIsBookingModalOpen({ day: activeDay, slotId: slot.id })}
                                    className={`p-3 rounded-2xl transition-all shadow-xl active:scale-90 ${
                                      isVip ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                                    }`}
                                  >
                                    <UserPlus size={18} />
                                  </button>
                                </>
                              )}
                           </div>
                        </div>

                        {slot.booked_trainee_id && trainee && (
                          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl relative z-10 border border-white/5">
                             <div className="w-10 h-10 bg-slate-900/50 rounded-xl overflow-hidden border border-white/10">
                                {trainee.avatar_data ? <img src={trainee.avatar_data} className="w-full h-full object-cover" /> : <User className="p-2 w-full h-full" />}
                             </div>
                             <div className="flex-1 overflow-hidden">
                                <p className="font-black text-sm truncate uppercase">{trainee.full_name}</p>
                                <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">{trainee.active_program_name || 'Protocol Active'}</p>
                             </div>
                             <CheckCircle2 size={16} className="text-white/50" />
                          </div>
                        )}
                     </div>
                   );
                 })
               )}
            </div>
          </div>
        </div>
      </div>

      {/* New Slot Creator Modal */}
      {isSlotCreatorOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95">
              <header className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                 <div>
                    <h3 className="text-3xl font-black text-white italic">{t('تعریف سانس جدید', 'New Slot Definition')}</h3>
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">{activeDay} - {t('ثبت در تقویم', 'Calendar Sync')}</p>
                 </div>
                 <button onClick={() => setIsSlotCreatorOpen(false)} className="p-3 bg-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </header>
              <div className="p-10 space-y-10">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">{t('زمان شروع', 'Start Time')}</label>
                       <input 
                        type="time" 
                        value={newSlotTime}
                        onChange={(e) => setNewSlotTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white font-black text-xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">{t('نوع سانس', 'Slot Type')}</label>
                       <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                          <button 
                            onClick={() => setNewSlotType('normal')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${newSlotType === 'normal' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600'}`}
                          >
                            Normal
                          </button>
                          <button 
                            onClick={() => setNewSlotType('vip')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${newSlotType === 'vip' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-600'}`}
                          >
                            VIP
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">{t('انتخاب شعبه (باشگاه)', 'Select Gym Branch')}</label>
                    <div className="grid grid-cols-1 gap-2">
                       {gyms.map(gym => (
                         <button 
                           key={gym.id}
                           onClick={() => setNewSlotGymId(gym.id)}
                           className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                             newSlotGymId === gym.id ? 'bg-slate-800 border-indigo-500 shadow-xl' : 'bg-slate-950/50 border-slate-800 text-slate-600'
                           }`}
                         >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${newSlotGymId === gym.id ? 'bg-indigo-600 text-white' : 'bg-slate-900'}`}><MapPin size={18} /></div>
                            <div className="text-left">
                               <p className={`font-black text-xs uppercase ${newSlotGymId === gym.id ? 'text-white' : ''}`}>{language === 'fa' ? gym.name_fa : gym.name_en}</p>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>

                 <button 
                    onClick={handleAddSlot}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black text-xl shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-4"
                 >
                    <CheckCircle2 size={24} />
                    {t('تایید و ثبت در برنامه', 'Finalize & Record Slot')}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-slate-900 w-full max-w-md rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
              <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                 <h3 className="text-2xl font-black text-white italic">{t('تخصیص سانس به ورزشکار', 'Assign Athlete')}</h3>
                 <button onClick={() => setIsBookingModalOpen(null)} className="p-2 text-slate-500 hover:text-white transition-all"><X size={24} /></button>
              </header>
              <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] no-scrollbar">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">{t('ورزشکاران دارای شرایط', 'Eligible Athletes')}</label>
                    <div className="space-y-3">
                       {managedTrainees.map(trainee => {
                         const slot = currentDayAvailability?.slots.find(s => s.id === isBookingModalOpen.slotId);
                         const isVipSlot = slot?.type === 'vip';
                         const canBook = !isVipSlot || trainee.is_vip;

                         return (
                           <button 
                             key={trainee.id}
                             disabled={!canBook}
                             onClick={() => handleBook(trainee.id)}
                             className={`w-full p-5 rounded-3xl border flex items-center gap-5 transition-all group relative ${
                               canBook ? 'bg-slate-800/50 hover:bg-indigo-600 hover:border-indigo-400 text-slate-300 hover:text-white border-slate-700/50 active:scale-[0.98]' : 'bg-slate-950 border-slate-900 opacity-40 cursor-not-allowed'
                             }`}
                           >
                              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black group-hover:bg-white/20 transition-all overflow-hidden">
                                 {trainee.avatar_data ? <img src={trainee.avatar_data} className="w-full h-full object-cover" /> : trainee.full_name[0]}
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                 <div className="flex items-center gap-2">
                                    <p className="font-black text-sm uppercase truncate">{trainee.full_name}</p>
                                    {trainee.is_vip && <Star size={10} className="text-amber-500" fill="currentColor" />}
                                 </div>
                                 <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mt-0.5">{trainee.active_program_name || 'Individual Session'}</p>
                              </div>
                              {canBook ? <ChevronRight size={18} className="text-slate-700 group-hover:text-white transition-all" /> : <X size={14} className="text-slate-800" />}
                           </button>
                         );
                       })}
                    </div>
                 </div>
              </div>
              <footer className="p-8 border-t border-slate-800 bg-slate-800/20 text-center">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                    {t('نمایش تمام شاگردان مدیریت شده', 'Showing all managed athletes')}
                 </p>
              </footer>
           </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;
