
import React from 'react';
import { Home, Dumbbell, TrendingUp, MessageSquare, User, Users, ClipboardList, BarChart3, Languages, QrCode, Calendar, LayoutGrid, Soup, BookOpenCheck } from 'lucide-react';
import { useStore } from '../store';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { language, setLanguage, profile } = useStore();
  const isTrainer = profile?.role === 'trainer';
  
  const traineeMenu = [
    { id: 'dashboard', icon: Home, label: language === 'fa' ? 'داشبورد' : 'Dashboard' },
    { id: 'training-hub', icon: LayoutGrid, label: language === 'fa' ? 'هاب تمرین' : 'Training Hub' },
    { id: 'booking', icon: BookOpenCheck, label: language === 'fa' ? 'رزرو جلسه' : 'Booking' },
    { id: 'fuel', icon: Soup, label: language === 'fa' ? 'سوخت' : 'Fuel' },
    { id: 'progress', icon: TrendingUp, label: language === 'fa' ? 'پیشرفت' : 'Progress' },
    { id: 'messages', icon: MessageSquare, label: language === 'fa' ? 'پیام‌ها' : 'Messages' },
    { id: 'profile', icon: User, label: language === 'fa' ? 'پروفایل' : 'Profile' },
  ];

  const trainerMenu = [
    { id: 'trainer-dashboard', icon: Home, label: language === 'fa' ? 'نمای کلی' : 'Overview' },
    { id: 'schedule-manager', icon: Calendar, label: language === 'fa' ? 'زمان‌بندی' : 'Schedule' },
    { id: 'gym-management', icon: QrCode, label: language === 'fa' ? 'کنترل تردد' : 'Gatekeeping' },
    { id: 'managed-trainees', icon: Users, label: language === 'fa' ? 'شاگردان' : 'Trainees' },
    { id: 'program-architect', icon: ClipboardList, label: language === 'fa' ? 'طراحی برنامه' : 'Programs' },
    { id: 'trainer-analytics', icon: BarChart3, label: language === 'fa' ? 'تحلیل داده' : 'Analytics' },
    { id: 'messages', icon: MessageSquare, label: language === 'fa' ? 'پیام‌ها' : 'Messages' },
    { id: 'profile', icon: User, label: language === 'fa' ? 'پروفایل' : 'Profile' },
  ];

  const menuItems = isTrainer ? trainerMenu : traineeMenu;

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:relative lg:w-64 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 z-50 flex lg:flex-col justify-around lg:justify-start gap-4">
      <div className="hidden lg:flex items-center gap-2 mb-8 px-2">
        <div className={`w-8 h-8 ${isTrainer ? 'bg-amber-600' : 'bg-indigo-600'} rounded-lg flex items-center justify-center transition-colors`}>
          <Dumbbell className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight">oko <span className="text-[10px] opacity-50 uppercase">{isTrainer ? 'Coach' : ''}</span></span>
      </div>

      <nav className="flex lg:flex-col items-center lg:items-stretch w-full gap-2 overflow-x-auto no-scrollbar lg:overflow-visible">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === item.id 
                ? isTrainer ? 'bg-amber-600/10 text-amber-400 lg:bg-amber-600 lg:text-white' : 'bg-indigo-600/10 text-indigo-400 lg:bg-indigo-600 lg:text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] lg:text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden lg:flex flex-col mt-auto gap-2 border-t border-slate-800 pt-4">
        <button 
          onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-xl transition-all"
        >
          <Languages size={20} />
          <span className="text-sm font-medium">{language === 'fa' ? 'English' : 'فارسی'}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
