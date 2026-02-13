
import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TrainerDashboard from './components/Trainer/TrainerDashboard';
import TraineeDetail from './components/Trainer/TraineeDetail';
import ProgramArchitect from './components/Trainer/ProgramArchitect';
import TrainerAnalytics from './components/Trainer/TrainerAnalytics';
import TrainingHub from './components/TrainingHub';
import Booking from './components/Booking';
import Fuel from './components/Fuel';
import Progress from './components/Progress';
import Messages from './components/Messages';
import WorkoutSession from './components/WorkoutSession';
import ProfileSettings from './components/ProfileSettings';
import GymManagement from './components/Trainer/GymManagement';
import ScheduleManager from './components/Trainer/ScheduleManager';
import { Dumbbell, Users, ShieldCheck, ChevronRight, User, GraduationCap, ArrowRight, LogIn } from 'lucide-react';

const App: React.FC = () => {
  const { 
    profile, setProfile, setActiveProgram, 
    language, setLanguage, currentSession, endSession,
    selectedTraineeId, setSelectedTrainee,
    activeTab, setActiveTab, setSelectedChatTraineeId,
    activeProgram, managedTrainees, addMessage
  } = useStore();

  const [loginStep, setLoginStep] = useState<'role' | 'auth' | 'main'>(profile ? 'main' : 'role');
  const [selectedRole, setSelectedRole] = useState<'trainer' | 'trainee' | null>(null);

  useEffect(() => {
    if (!language) setLanguage('fa');
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language || 'fa';
  }, [language, setLanguage]);

  useEffect(() => {
    const checkScheduleAndSubs = () => {
      if (!profile) return;
      
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentTimeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      if (profile.role === 'trainer') {
        const todaySchedule = profile.availability?.find(a => a.day === currentDay);
        if (todaySchedule) {
          todaySchedule.slots.forEach(slot => {
            if (slot.time === currentTimeStr && slot.booked_trainee_id) {
              const targetTrainee = managedTrainees.find(t => t.id === slot.booked_trainee_id);
              addMessage({
                id: `ai-notif-${slot.time}-${slot.booked_trainee_id}`,
                type: 'text',
                chat_type: 'ai',
                text: language === 'fa' 
                  ? `🚨 وقت تمرین! ${targetTrainee?.full_name} عزیز، طبق زمان‌بندی مربی نسترن جلسه شما ساعت ${slot.time} شروع شده است.` 
                  : `🚨 WORKOUT TIME! ${targetTrainee?.full_name}, your session with Coach Nastaran is starting now at ${slot.time}.`,
                sender: 'ai',
                timestamp: new Date(),
                trainee_id: slot.booked_trainee_id
              });
            }
          });
        }
      } else {
        const traineeData = managedTrainees.find(t => t.id === profile.id);
        if (traineeData?.subscription && traineeData.subscription.sessions_remaining <= 3 && traineeData.subscription.sessions_remaining > 0) {
          const subMsgId = `sub-expiry-warning-${traineeData.id}`;
          addMessage({
            id: subMsgId,
            type: 'text',
            chat_type: 'ai',
            text: language === 'fa' 
              ? `⚠️ هشدار تمدید: تنها ${traineeData.subscription.sessions_remaining} جلسه از اشتراک شما باقی مانده است. لطفاً برای تمدید اقدام کنید.` 
              : `⚠️ Subscription Warning: Only ${traineeData.subscription.sessions_remaining} sessions left. Please renew your plan soon.`,
            sender: 'ai',
            timestamp: new Date(),
            trainee_id: profile.id
          });
        }
      }
    };

    const interval = setInterval(checkScheduleAndSubs, 60000);
    return () => clearInterval(interval);
  }, [profile, addMessage, language, managedTrainees]);

  const handleLogin = (userId: string) => {
    const role = userId === 't1' ? 'trainer' : 'trainee';
    let fullName = '';
    let avatar_url = '';
    
    if (userId === 't1') {
      fullName = 'نسترن اسکوئی (مربی)';
      avatar_url = 'https://i.pravatar.cc/150?u=nastaran';
    } else if (userId === 'u1') {
      fullName = 'شنگول دانا';
      avatar_url = 'https://i.pravatar.cc/150?u=shangool';
    } else if (userId === 'u2') {
      fullName = 'منگول زکی';
      avatar_url = 'https://i.pravatar.cc/150?u=mangool';
    }
    
    const newProfile = {
      id: userId,
      full_name: fullName,
      role: role as any,
      height: userId === 'u1' ? 180 : userId === 'u2' ? 175 : 170,
      weight: userId === 'u1' ? 78.5 : userId === 'u2' ? 83.8 : 65,
      goal: (userId === 'u1' ? 'muscle_gain' : userId === 'u2' ? 'fat_loss' : 'strength') as any,
      age: userId === 't1' ? 30 : 25,
      avatar_data: avatar_url,
      phone: '09120000000',
      is_vip: userId === 'u1',
      body_measurements: {
        chest: 102,
        waist: 82,
        hips: 95,
        arms: 38,
        thighs: 58,
        neck: 40
      },
      availability: userId === 't1' ? [
        { day: 'Saturday', slots: [{ id: 's1', time: '09:00', type: 'vip', gym_id: 'gym-1' }, { id: 's2', time: '11:00', type: 'normal', gym_id: 'gym-1' }] },
        { day: 'Sunday', slots: [{ id: 's3', time: '10:00', type: 'normal', gym_id: 'gym-2' }] }
      ] : []
    };

    setProfile(newProfile);
    setLoginStep('main');
    
    if (role === 'trainee') {
      const traineeInManaged = managedTrainees.find(t => t.id === userId);
      if (traineeInManaged?.active_program) {
        setActiveProgram(traineeInManaged.active_program);
      } else {
        setActiveProgram(null);
      }
      setSelectedChatTraineeId('ai');
      setActiveTab('dashboard');
    } else {
      setSelectedChatTraineeId('u1');
      setActiveTab('trainer-dashboard');
      setActiveProgram(null);
    }
  };

  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  if (loginStep === 'role') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden relative font-['Vazirmatn']">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
        
        <div className="text-center mb-12 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-2xl">
            <Dumbbell className="text-white w-10 h-10" />
          </div>
          <h1 className="text-6xl font-black text-white italic tracking-tighter">oko</h1>
          <p className="text-slate-400 mt-4 text-lg">{t('پلتفرم هوشمند تناسب اندام', 'The Smart Fitness Platform')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl relative z-10">
          <button 
            onClick={() => { setSelectedRole('trainee'); setLoginStep('auth'); }}
            className="group bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-6 hover:border-indigo-500 hover:bg-slate-800/80 transition-all duration-500 shadow-2xl"
          >
            <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
              <User size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{t('ورزشکار هستم', 'I am an Athlete')}</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">{t('می‌خواهم تمرینات خود را ثبت کرده و پیشرفت خود را ببینم', 'I want to track my workouts and see my progress')}</p>
            </div>
            <ArrowRight className={`${language === 'fa' ? 'rotate-180' : ''} text-indigo-500 group-hover:translate-x-2 transition-transform`} />
          </button>

          <button 
            onClick={() => { setSelectedRole('trainer'); setLoginStep('auth'); }}
            className="group bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-6 hover:border-amber-500 hover:bg-slate-800/80 transition-all duration-500 shadow-2xl"
          >
            <div className="w-20 h-20 bg-amber-600/10 rounded-3xl flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-lg">
              <GraduationCap size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{t('مربی هستم', 'I am a Coach')}</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">{t('می‌خواهم شاگردانم را مدیریت کرده و برایشان برنامه بنویسم', 'I want to manage my trainees and design protocols')}</p>
            </div>
            <ArrowRight className={`${language === 'fa' ? 'rotate-180' : ''} text-amber-500 group-hover:translate-x-2 transition-transform`} />
          </button>
        </div>
      </div>
    );
  }

  if (loginStep === 'auth') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative font-['Vazirmatn']">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] p-12 border border-slate-800 shadow-2xl text-center space-y-10 relative z-10">
          <button onClick={() => setLoginStep('role')} className="absolute top-8 left-8 text-slate-500 hover:text-white">
            <ArrowRight className={`${language === 'fa' ? '' : 'rotate-180'}`} size={20} />
          </button>
          
          <div className="space-y-4">
             <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
               <LogIn size={32} />
             </div>
             <h2 className="text-3xl font-black text-white">{t('ورود به حساب', 'Sign In')}</h2>
             <p className="text-slate-500 text-sm">{t(`ورود به عنوان ${selectedRole === 'trainer' ? 'مربی' : 'ورزشکار'}`, `Login as ${selectedRole}`)}</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleLogin(selectedRole === 'trainer' ? 't1' : 'u1')}
              className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black flex items-center justify-center gap-4 hover:bg-slate-200 transition-all shadow-xl"
            >
              <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="google" />
              {t('ورود با حساب گوگل', 'Sign in with Google')}
            </button>
            
            <div className="flex items-center gap-4 text-slate-700 py-4">
               <div className="h-px bg-slate-800 flex-1" />
               <span className="text-[10px] uppercase font-black tracking-widest">{t('یا از لیست دمو انتخاب کنید', 'Or Choose Account')}</span>
               <div className="h-px bg-slate-800 flex-1" />
            </div>

            <div className="grid gap-3">
              {selectedRole === 'trainee' ? (
                <>
                  <button onClick={() => handleLogin('u1')} className="w-full p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-white font-bold hover:border-indigo-500 transition-all">شنگول دانا (Trainee)</button>
                  <button onClick={() => handleLogin('u2')} className="w-full p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-white font-bold hover:border-indigo-500 transition-all">منگول زکی (Trainee)</button>
                </>
              ) : (
                <button onClick={() => handleLogin('t1')} className="w-full p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-white font-bold hover:border-amber-500 transition-all">نسترن اسکوئی (مربی)</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (profile?.role === 'trainer' && selectedTraineeId) {
      return <TraineeDetail traineeId={selectedTraineeId} onBack={() => setSelectedTrainee(null)} />;
    }

    switch (activeTab) {
      case 'messages': return <Messages />;
      case 'profile': return <ProfileSettings />;
      case 'dashboard': return <Dashboard />;
      case 'training-hub': return <TrainingHub />;
      case 'booking': return <Booking />;
      case 'fuel': return <Fuel />;
      case 'progress': return <Progress />;
      case 'trainer-dashboard': return <TrainerDashboard />;
      case 'gym-management': return <GymManagement />;
      case 'schedule-manager': return <ScheduleManager />;
      case 'managed-trainees': return <TrainerDashboard />;
      case 'program-architect': return <ProgramArchitect />;
      case 'trainer-analytics': return <TrainerAnalytics />;
      default: return profile?.role === 'trainer' ? <TrainerDashboard /> : <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-['Vazirmatn'] overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 lg:p-10 lg:ml-0 overflow-y-auto no-scrollbar relative z-0 pb-20 lg:pb-10">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {currentSession && activeProgram?.workout_days && (
        <WorkoutSession 
          day={activeProgram.workout_days.find(d => d.id === currentSession.dayId) || activeProgram.workout_days[0]} 
          onClose={endSession} 
        />
      )}
    </div>
  );
};

export default App;
