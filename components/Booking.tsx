
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Star, MapPin, ChevronRight, Layout, Info, AlertCircle } from 'lucide-react';
import { useStore } from '../store';

const Booking: React.FC = () => {
  const { language, profile, managedTrainees, gyms, bookSession } = useStore();
  const [activeDay, setActiveDay] = useState('Saturday');
  
  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  // Assuming the trainee has one primary trainer (Nastaran)
  // In this mock, the trainer's availability is stored on the trainer's profile.
  // We'll access it through a mock reference or assume it's globally available for this demo.
  const trainerAvailability = profile?.role === 'trainer' ? profile.availability : (managedTrainees.find(t => t.id === 't1')?.availability || []);

  const days = [
    { id: 'Saturday', fa: 'شنبه' },
    { id: 'Sunday', fa: 'یکشنبه' },
    { id: 'Monday', fa: 'دوشنبه' },
    { id: 'Tuesday', fa: 'سه‌شنبه' },
    { id: 'Wednesday', fa: 'چهارشنبه' },
    { id: 'Thursday', fa: 'پنج‌شنبه' },
    { id: 'Friday', fa: 'جمعه' },
  ];

  const currentDaySlots = trainerAvailability?.find(a => a.day === activeDay)?.slots || [];

  const handleBook = (slotId: string) => {
    if (!profile) return;
    bookSession(profile.id, activeDay, slotId);
    alert(t('جلسه با موفقیت رزرو شد!', 'Session booked successfully!'));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <header>
        <h1 className="text-3xl font-black text-white italic">{t('رزرو سانس تمرینی', 'Book Training Session')}</h1>
        <p className="text-slate-400 mt-1 font-medium">{t('زمان مناسب خود را از تقویم مربی نسترن انتخاب کنید', 'Select a convenient time from Coach Nastaran\'s calendar')}</p>
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

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 lg:p-12 space-y-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-black text-white italic">{t(`سانس‌های ${days.find(d => d.id === activeDay)?.[language === 'fa' ? 'fa' : 'id']}`, `${activeDay} Availability`)}</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {currentDaySlots.length === 0 ? (
                <div className="md:col-span-2 py-20 flex flex-col items-center justify-center gap-4 text-slate-700">
                  <Calendar size={48} className="opacity-20" />
                  <p className="font-black text-lg italic">{t('ساعتی برای این روز تعریف نشده است.', 'No slots available for this day.')}</p>
                </div>
              ) : (
                currentDaySlots.map((slot) => {
                  const gym = gyms.find(g => g.id === slot.gym_id);
                  const isBooked = !!slot.booked_trainee_id;
                  const isMine = slot.booked_trainee_id === profile?.id;
                  const isVip = slot.type === 'vip';
                  const canBook = !isBooked && (!isVip || profile?.is_vip);

                  return (
                    <div key={slot.id} className={`p-6 rounded-[2.2rem] border transition-all flex flex-col gap-4 relative overflow-hidden ${
                      isMine ? 'bg-indigo-600 border-indigo-400 text-white' :
                      isBooked ? 'bg-slate-950 border-slate-900 opacity-40 cursor-not-allowed' :
                      'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 group'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMine ? 'bg-white/20' : isVip ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                            {isVip ? <Star size={20} fill={isVip ? "currentColor" : "none"} /> : <Clock size={20} />}
                          </div>
                          <div>
                            <p className="text-xl font-black tabular-nums">{slot.time}</p>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${isMine ? 'text-white/70' : 'text-slate-500'}`}>{gym?.name_fa || 'Academy'}</p>
                          </div>
                        </div>
                        {isVip && !isMine && (
                          <div className="bg-amber-600/20 text-amber-500 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border border-amber-500/20">VIP Only</div>
                        )}
                      </div>

                      {isMine ? (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/80 mt-2">
                          <CheckCircle2 size={14} />
                          {t('تایید شده و رزرو شما', 'CONFIRMED & BOOKED')}
                        </div>
                      ) : isBooked ? (
                        <div className="text-[10px] font-black uppercase text-slate-700 mt-2">{t('تکمیل شده', 'FULLY BOOKED')}</div>
                      ) : (
                        <button 
                          disabled={!canBook}
                          onClick={() => handleBook(slot.id)}
                          className={`mt-2 w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                            canBook ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          {t('رزرو این سانس', 'Book This Slot')}
                          <ChevronRight size={14} className={language === 'fa' ? 'rotate-180' : ''} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem] space-y-4">
             <Info className="text-indigo-500" size={24} />
             <h3 className="text-white font-black italic">{t('شرایط رزرو جلسه', 'Booking Guidelines')}</h3>
             <ul className="space-y-3 text-xs text-slate-400 font-medium leading-relaxed">
                <li className="flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                   {t('لغو رزرو تا ۶ ساعت قبل از جلسه امکان‌پذیر است.', 'Cancellations must be made 6 hours prior.')}
                </li>
                <li className="flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                   {t('سانس‌های VIP مختص ورزشکاران دارای اشتراک ویژه می‌باشد.', 'VIP slots are for premium members only.')}
                </li>
                <li className="flex gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                   {t('هر ورزشکار مجاز به رزرو حداکثر ۳ جلسه فعال در هفته است.', 'Max 3 active bookings per week.')}
                </li>
             </ul>
          </div>

          {!profile?.is_vip && (
            <div className="bg-amber-600/10 border border-amber-500/20 p-8 rounded-[2.5rem] space-y-4 relative overflow-hidden group">
               <Star className="text-amber-500 absolute -bottom-4 -right-4 w-24 h-24 opacity-10 rotate-12" />
               <h3 className="text-white font-black italic flex items-center gap-2">
                  <Star size={20} className="text-amber-500 fill-amber-500" />
                  {t('ارتقا به عضویت ویژه', 'Go VIP')}
               </h3>
               <p className="text-xs text-amber-500/70 leading-relaxed font-bold">
                 {t('با ارتقای عضویت، به سانس‌های اختصاصی مربی نسترن و تحلیل‌های پیشرفته AI دسترسی پیدا کنید.', 'Unlock exclusive slots and advanced AI insights with VIP.')}
               </p>
               <button className="w-full bg-amber-600 text-white py-3 rounded-xl font-black text-xs shadow-xl shadow-amber-600/20 active:scale-95 transition-all">
                 {t('مشاهده پلن‌ها', 'See VIP Plans')}
               </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Booking;
