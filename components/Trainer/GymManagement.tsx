
import React, { useState } from 'react';
import { Plus, Trash2, Printer, QrCode, MapPin, Users, Activity, X, ChevronRight, Clock, User, LogIn, LogOut, Download } from 'lucide-react';
import { useStore } from '../../store';
import { Gym } from '../../types';

const GymManagement: React.FC = () => {
  const { language, gyms, addGym, removeGym, attendance, managedTrainees } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGym, setNewGym] = useState({ name: '', address: '' });
  const [selectedGymForQR, setSelectedGymForQR] = useState<Gym | null>(null);

  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  const handleAddGym = () => {
    if (!newGym.name) return;
    addGym({
      id: Math.random().toString(36).substr(2, 9),
      name_fa: newGym.name,
      name_en: newGym.name,
      address: newGym.address,
      trainer_id: 't1'
    });
    setNewGym({ name: '', address: '' });
    setIsAddModalOpen(false);
  };

  const generateQRUrl = (gymId: string, type: 'enter' | 'exit') => {
    const data = JSON.stringify({ gymId, type });
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}&color=4f46e5&bgcolor=ffffff`;
  };

  const getTraineeName = (id: string) => managedTrainees.find(t => t.id === id)?.full_name || id;

  const activeAttendance = attendance.filter(a => a.status === 'present');
  const historyAttendance = attendance.filter(a => a.status === 'exited').slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">{t('مدیریت مراکز و کنترل تردد', 'Gym Gatekeeping Control')}</h1>
          <p className="text-slate-400 font-medium mt-1">{t('مدیریت شعب باشگاه و کدهای QR ورود و خروج', 'Manage gym branches and entry/exit QR codes')}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-amber-600/20"
        >
          <Plus size={20} />
          {t('افزودن شعبه جدید', 'Add New Branch')}
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {gyms.map(gym => (
              <div key={gym.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-4 hover:border-amber-500/30 transition-all shadow-xl group">
                <div className="flex justify-between items-start">
                  <div className="bg-amber-600/10 p-3 rounded-2xl text-amber-500 group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <button onClick={() => removeGym(gym.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{gym.name_fa}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{gym.address}</p>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-slate-800/50 mt-2">
                   <div className="flex items-center gap-2">
                      <Users size={16} className="text-slate-500" />
                      <span className="text-sm font-bold text-white">{activeAttendance.filter(a => a.gym_id === gym.id).length} {t('نفر حاضر', 'Present')}</span>
                   </div>
                   <button 
                    onClick={() => setSelectedGymForQR(gym)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                   >
                     <QrCode size={16} />
                     {t('تولید QR', 'Generate QR')}
                   </button>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Presence List */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                   <Activity size={24} className="text-emerald-400" />
                   {t('لیست افراد حاضر در شعب', 'Active Presence List')}
                </h3>
                <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Live</span>
             </div>

             <div className="space-y-3">
                {activeAttendance.length === 0 ? (
                  <div className="py-10 text-center text-slate-600 italic font-medium">
                    {t('هیچ ورزشکاری در حال حاضر در شعب حضور ندارد.', 'No athletes are currently present at any branch.')}
                  </div>
                ) : (
                  activeAttendance.map(record => (
                    <div key={record.id} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex items-center justify-between animate-in fade-in slide-in-from-right-2">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold">
                             {getTraineeName(record.trainee_id)[0]}
                          </div>
                          <div>
                             <p className="font-black text-white text-sm">{getTraineeName(record.trainee_id)}</p>
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest">{gyms.find(g => g.id === record.gym_id)?.name_fa}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="flex items-center gap-2 text-emerald-500">
                             <LogIn size={14} />
                             <span className="text-xs font-bold">{new Date(record.check_in).toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[9px] text-slate-600 font-medium uppercase mt-1">{t('ورود ثبت شده', 'Checked In')}</p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </section>
        </div>

        {/* Attendance History Sidebar */}
        <aside className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
             <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                {t('تاریخچه تردد اخیر', 'Recent Logs')}
             </h3>
             <div className="space-y-4">
                {historyAttendance.map(record => (
                  <div key={record.id} className="flex gap-4 items-start border-r-2 border-slate-800 pr-4">
                     <div className="mt-1">
                        <LogOut size={14} className="text-rose-500" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-white">{getTraineeName(record.trainee_id)}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {t('خروج از ', 'Left ')} {gyms.find(g => g.id === record.gym_id)?.name_fa}
                        </p>
                        <p className="text-[9px] text-slate-600 font-mono">
                          {new Date(record.check_out!).toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US')}
                        </p>
                     </div>
                  </div>
                ))}
                {historyAttendance.length === 0 && (
                  <p className="text-xs text-slate-600 italic text-center py-4">{t('هنوز فعالیتی ثبت نشده', 'No history yet')}</p>
                )}
             </div>
          </div>
        </aside>
      </div>

      {/* Add Gym Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
             <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h3 className="text-2xl font-black text-white">{t('افزودن مرکز تمرین', 'Add New Gym')}</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-500 hover:text-white"><X size={24} /></button>
             </header>
             <div className="p-8 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('نام شعبه / مجموعه', 'Gym Name')}</label>
                   <input 
                    type="text" 
                    value={newGym.name}
                    onChange={(e) => setNewGym({ ...newGym, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder={t('مثال: باشگاه نسترن (مرکزی)', 'e.g. Nastaran Gym (Central)')}
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{t('آدرس (اختیاری)', 'Address (Optional)')}</label>
                   <textarea 
                    value={newGym.address}
                    onChange={(e) => setNewGym({ ...newGym, address: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-amber-500 outline-none h-24"
                    placeholder={t('نشانی دقیق شعبه...', 'Branch address...')}
                   />
                </div>
                <button 
                  onClick={handleAddGym}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-amber-600/20 active:scale-95"
                >
                  {t('تایید و ثبت مرکز', 'Confirm & Add')}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* QR Generation Modal */}
      {selectedGymForQR && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95">
             <header className="p-8 bg-slate-950 text-white flex justify-between items-center">
                <div>
                   <h3 className="text-2xl font-black">{t('کدهای QR تردد', 'Gatekeeping QR Codes')}</h3>
                   <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-bold">{selectedGymForQR.name_fa}</p>
                </div>
                <button onClick={() => setSelectedGymForQR(null)} className="p-2 text-slate-500 hover:text-white"><X size={24} /></button>
             </header>
             
             <div className="p-10 grid md:grid-cols-2 gap-10">
                {/* Entry QR */}
                <div className="flex flex-col items-center gap-6 p-6 border-2 border-emerald-100 rounded-[2rem] bg-emerald-50/50">
                   <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                      <img src={generateQRUrl(selectedGymForQR.id, 'enter')} className="w-48 h-48" alt="Entry QR" />
                   </div>
                   <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1">
                         <LogIn size={20} />
                         <span className="text-xl font-black">{t('کد ورود', 'ENTRY CODE')}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{t('نصب در درب ورودی', 'Install at entrance')}</p>
                   </div>
                   <button className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-500 transition-all">
                      <Printer size={16} />
                      {t('چاپ کد', 'Print')}
                   </button>
                </div>

                {/* Exit QR */}
                <div className="flex flex-col items-center gap-6 p-6 border-2 border-rose-100 rounded-[2rem] bg-rose-50/50">
                   <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                      <img src={generateQRUrl(selectedGymForQR.id, 'exit')} className="w-48 h-48" alt="Exit QR" />
                   </div>
                   <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-rose-600 mb-1">
                         <LogOut size={20} />
                         <span className="text-xl font-black">{t('کد خروج', 'EXIT CODE')}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{t('نصب در درب خروجی', 'Install at exit')}</p>
                   </div>
                   <button className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-rose-500 transition-all">
                      <Printer size={16} />
                      {t('چاپ کد', 'Print')}
                   </button>
                </div>
             </div>

             <footer className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
                <button 
                  onClick={() => setSelectedGymForQR(null)}
                  className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  {t('بستن پنجره', 'Close')}
                </button>
             </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymManagement;
