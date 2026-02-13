
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Timer, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { useStore } from '../store';
import { WorkoutDay } from '../types';

interface Props {
  day: WorkoutDay;
  onClose: () => void;
}

const WorkoutSession: React.FC<Props> = ({ day, onClose }) => {
  const { language, addLog, endSession, saveSessionData, currentSession } = useStore();
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  
  const [sessionInputs, setSessionInputs] = useState<Record<string, { weight: number, reps: number, rpe: number }>>({});

  const t = (fa: string, en: string) => language === 'fa' ? fa : en;
  const currentEx = day.exercises?.[activeExerciseIdx];

  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const handleSetToggle = (setIndex: number) => {
    if (!currentEx) return;
    const inputKey = `${currentEx.exercise_id}-${setIndex}`;
    const inputs = sessionInputs[inputKey] || { 
      weight: 60, 
      reps: parseInt(currentEx.reps) || 10,
      rpe: 8
    };
    
    saveSessionData(currentEx.exercise_id, setIndex, { 
      reps: inputs.reps, 
      weight: inputs.weight,
      rpe: inputs.rpe
    });
  };

  const updateInput = (setIndex: number, field: 'weight' | 'reps' | 'rpe', value: number) => {
    if (!currentEx) return;
    const inputKey = `${currentEx.exercise_id}-${setIndex}`;
    setSessionInputs(prev => ({
      ...prev,
      [inputKey]: {
        ...(prev[inputKey] || { weight: 60, reps: parseInt(currentEx.reps) || 10, rpe: 8 }),
        [field]: value
      }
    }));
  };

  const handleFinish = () => {
    const totalVolume = currentSession?.exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
    }, 0) || 0;

    addLog({
      id: Math.random().toString(),
      date: new Date().toISOString(),
      workout_name: day.name_fa || 'تمرین روزانه',
      duration: Math.floor(timer / 60),
      volume: totalVolume
    });
    endSession();
    onClose();
  };

  if (!currentEx) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-300">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 shadow-lg">
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
          <X size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('زمان سپری شده', 'Workout Time')}</span>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xl font-bold">
            <Timer size={18} />
            {new Date(timer * 1000).toISOString().substr(14, 5)}
          </div>
        </div>
        <button 
          onClick={handleFinish}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg"
        >
          <Save size={18} />
          {t('پایان تمرین', 'Finish')}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-indigo-500 text-xs font-bold uppercase tracking-widest">
              {t('حرکت', 'Exercise')} {activeExerciseIdx + 1} / {day.exercises?.length}
            </span>
            <h2 className="text-3xl font-bold mt-1 text-white">
              {language === 'fa' ? currentEx.exercise?.name_fa : currentEx.exercise?.name_en}
            </h2>
            <div className="flex gap-4 mt-3">
              <span className="text-slate-400 text-sm font-medium">{currentEx.sets} {t('ست', 'Sets')}</span>
              <span className="text-slate-400 text-sm font-medium">{currentEx.reps} {t('تکرار هدف', 'Target Reps')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: currentEx.sets }).map((_, i) => {
            const isCompleted = currentSession?.exercises.find(e => e.exerciseId === currentEx.exercise_id)?.sets[i]?.completed;
            const inputKey = `${currentEx.exercise_id}-${i}`;
            const currentInputs = sessionInputs[inputKey] || { weight: 60, reps: parseInt(currentEx.reps) || 10, rpe: 8 };

            return (
              <div key={i} className={`p-5 rounded-[2rem] border transition-all flex flex-col gap-4 ${
                isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCompleted ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                      {i + 1}
                    </span>
                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{t('وزن', 'Weight')}</span>
                        <input type="number" value={currentInputs.weight} onChange={(e) => updateInput(i, 'weight', parseFloat(e.target.value))} className="bg-transparent text-white font-black w-12 outline-none text-xl" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{t('تکرار', 'Reps')}</span>
                        <input type="number" value={currentInputs.reps} onChange={(e) => updateInput(i, 'reps', parseInt(e.target.value))} className="bg-transparent text-white font-black w-12 outline-none text-xl" />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleSetToggle(i)} className={`p-3 rounded-2xl transition-all ${isCompleted ? 'text-emerald-500' : 'text-slate-600'}`}>
                    <CheckCircle2 size={32} />
                  </button>
                </div>

                <div className="space-y-3 px-1 pt-2 border-t border-white/5">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('سختی (RPE)', 'Intensity (RPE)')}</span>
                      <span className="text-xs font-black text-indigo-400">{currentInputs.rpe} / 10</span>
                   </div>
                   <div className="flex justify-between gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                        <button
                          key={val}
                          onClick={() => updateInput(i, 'rpe', val)}
                          className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all ${currentInputs.rpe === val ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-600'}`}
                        >
                          {val}
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutSession;
