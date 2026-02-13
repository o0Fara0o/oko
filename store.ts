
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Profile, Program, WorkoutLog, Message, WorkoutSession, TraineeSummary, Alert, DailyWorkoutRecord, Gym, AttendanceRecord, Availability, AvailabilitySlot, SlotType, Subscription, Meal, MacroGoals, Exercise } from './types';
import { DEFAULT_TEMPLATES, MOCK_EXERCISES } from './services/mockData';

const generateWeightHistory = (start: number, end: number, weeks: number) => {
  const history = [];
  const step = (end - start) / (weeks * 3);
  for (let i = 0; i < weeks * 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (weeks * 3 - i) * 2);
    history.push({
      date: date.toLocaleDateString('fa-IR'),
      weight: parseFloat((start + step * i).toFixed(1))
    });
  }
  return history;
};

const SHANGOOL_PROGRAM: Program = {
  ...DEFAULT_TEMPLATES[0],
  id: 'p-shangool',
  name_fa: 'برنامه حجم اختصاصی شنگول',
  is_template: false,
  is_active: true
};

const MANGOOL_PROGRAM: Program = {
  ...DEFAULT_TEMPLATES[1],
  id: 'p-mangool',
  name_fa: 'برنامه کات تخصصی منگول',
  is_template: false,
  is_active: true
};

const INITIAL_GYMS: Gym[] = [
  { id: 'gym-1', name_fa: 'آکادمی تخصصی oko (مرکزی)', name_en: 'oko Elite Academy (Central)', address: 'تهران، الهیه، ساختمان برلیان', trainer_id: 't1' },
  { id: 'gym-2', name_fa: 'باشگاه پلاتینیوم (غرب)', name_en: 'Platinum Gym (West)', address: 'تهران، سعادت‌آباد، خیابان صرافها', trainer_id: 't1' }
];

const INITIAL_AVAILABILITY: Availability[] = [
  { day: 'Saturday', slots: [
    { id: 's1', time: '09:00', type: 'vip', gym_id: 'gym-1' },
    { id: 's2', time: '11:00', type: 'normal', gym_id: 'gym-1' },
    { id: 's3', time: '17:00', type: 'normal', gym_id: 'gym-2' }
  ] },
  { day: 'Sunday', slots: [
    { id: 's4', time: '10:00', type: 'vip', gym_id: 'gym-2' },
    { id: 's5', time: '12:00', type: 'normal', gym_id: 'gym-1' }
  ] },
  { day: 'Monday', slots: [
    { id: 's6', time: '08:00', type: 'normal', gym_id: 'gym-1' },
    { id: 's7', time: '14:00', type: 'vip', gym_id: 'gym-2' }
  ] },
  { day: 'Tuesday', slots: [
    { id: 's8', time: '09:00', type: 'normal', gym_id: 'gym-1' },
    { id: 's9', time: '16:00', type: 'vip', gym_id: 'gym-1' }
  ] },
  { day: 'Wednesday', slots: [
    { id: 's10', time: '10:00', type: 'normal', gym_id: 'gym-2' },
    { id: 's11', time: '15:00', type: 'normal', gym_id: 'gym-1' }
  ] },
  { day: 'Thursday', slots: [
    { id: 's12', time: '08:00', type: 'vip', gym_id: 'gym-1' }
  ] },
];

interface AppState {
  user: any | null;
  profile: Profile | null;
  activeProgram: Program | null;
  programs: Program[];
  templates: Program[];
  exercises: Exercise[];
  language: 'fa' | 'en';
  logs: WorkoutLog[];
  messages: Message[];
  weightHistory: { date: string; weight: number }[];
  currentSession: WorkoutSession | null;
  activeTab: string;
  
  managedTrainees: TraineeSummary[];
  selectedChatTraineeId: string | 'broadcast';
  selectedTraineeId: string | null;
  unreadMessagesCount: number;
  alerts: Alert[];
  dailyWorkouts: DailyWorkoutRecord[];

  gyms: Gym[];
  attendance: AttendanceRecord[];

  // Nutrition state
  meals: Meal[];
  macroGoals: MacroGoals;

  setLanguage: (lang: 'fa' | 'en') => void;
  setUser: (user: any) => void;
  setProfile: (profile: Profile | null) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  setActiveProgram: (program: Program | null) => void;
  setInspirationImage: (traineeId: string, imageData: string) => void;
  addProgram: (program: Program) => void;
  addTemplate: (template: Program) => void;
  addExercise: (exercise: Exercise) => void;
  assignProgram: (program: Program, traineeIds: string[]) => void;
  addMessage: (msg: Message) => void;
  markChatAsRead: (traineeId: string) => void;
  broadcastMessage: (msgTemplate: Omit<Message, 'id' | 'trainee_id' | 'is_broadcast'>) => void;
  addWeight: (weight: number) => void;
  addLog: (log: WorkoutLog) => void;
  startSession: (dayId: string) => void;
  saveSessionData: (exerciseId: string, setIndex: number, data: { reps: number; weight: number; rpe?: number }) => void;
  endSession: () => void;
  setActiveTab: (tab: string) => void;
  setSelectedTrainee: (id: string | null) => void;
  setSelectedChatTraineeId: (id: string | 'broadcast') => void;
  resetUnreadCount: () => void;
  dismissAlert: (id: string) => void;

  addGym: (gym: Gym) => void;
  removeGym: (id: string) => void;
  recordAttendance: (traineeId: string, gymId: string, type: 'enter' | 'exit') => void;
  
  bookSession: (traineeId: string, day: string, slotId: string) => void;
  cancelSession: (day: string, slotId: string) => void;
  addAvailabilitySlot: (day: string, slot: Omit<AvailabilitySlot, 'id'>) => void;
  removeAvailabilitySlot: (day: string, slotId: string) => void;
  updateAvailability: (availability: Availability[]) => void;
  updateSubscription: (traineeId: string, sub: Partial<Subscription>) => void;

  // Nutrition actions
  addMeal: (meal: Meal) => void;
  removeMeal: (id: string) => void;
  setMacroGoals: (goals: MacroGoals) => void;
  setNutritionProgramForTrainee: (traineeId: string, goals: MacroGoals) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      activeProgram: null,
      programs: [SHANGOOL_PROGRAM, MANGOOL_PROGRAM],
      templates: DEFAULT_TEMPLATES,
      exercises: MOCK_EXERCISES,
      language: 'fa',
      activeTab: 'dashboard',
      logs: [],
      messages: [],
      weightHistory: [],
      currentSession: null,
      unreadMessagesCount: 0,
      alerts: [],
      dailyWorkouts: [],
      managedTrainees: [],
      selectedTraineeId: null,
      selectedChatTraineeId: 'u1',
      gyms: INITIAL_GYMS,
      attendance: [],
      
      // Nutrition
      meals: [],
      macroGoals: {
        protein: 160,
        carbs: 250,
        fats: 70,
        calories: 2300,
        guidelines: 'مصرف پروتئین کافی و هیدراتاسیون مناسب الزامی است.'
      },

      setLanguage: (language) => {
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        set({ language });
      },
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null
      })),
      setInspirationImage: (traineeId, imageData) => set((state) => ({
        managedTrainees: state.managedTrainees.map(t => 
          t.id === traineeId ? { ...t, inspiration_image: imageData } : t
        )
      })),
      setActiveProgram: (activeProgram) => set({ activeProgram }),
      addProgram: (program) => set((state) => ({ programs: [...state.programs, program] })),
      addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
      addExercise: (exercise) => set((state) => ({ exercises: [exercise, ...state.exercises] })),
      assignProgram: (program, traineeIds) => set((state) => ({
        managedTrainees: state.managedTrainees.map(t => 
          traineeIds.includes(t.id) ? { ...t, active_program: program, active_program_name: program.name_fa } : t
        )
      })),
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      markChatAsRead: (traineeId) => set((state) => ({
        managedTrainees: state.managedTrainees.map(t => 
          t.id === traineeId ? { ...t, unread_count: 0 } : t
        )
      })),
      broadcastMessage: (msgTemplate) => set((state) => {
        const timestamp = new Date();
        const newMessages = state.managedTrainees.map(trainee => ({
          ...msgTemplate,
          id: Math.random().toString(36).substr(2, 9),
          trainee_id: trainee.id,
          is_broadcast: true,
          timestamp
        }));
        return { messages: [...state.messages, ...newMessages] };
      }),
      addWeight: (weight) => set((state) => ({
        weightHistory: [...state.weightHistory, { date: new Date().toLocaleDateString('fa-IR'), weight }]
      })),
      addLog: (log) => set((state) => ({
        logs: [log, ...state.logs]
      })),
      startSession: (dayId) => set({ 
        currentSession: { 
          dayId, 
          startTime: Date.now(), 
          exercises: [] 
        } 
      }),
      saveSessionData: (exerciseId, setIndex, data) => set((state) => {
        if (!state.currentSession) return state;
        const newSession = { ...state.currentSession };
        let ex = newSession.exercises.find(e => e.exerciseId === exerciseId);
        if (!ex) {
          ex = { exerciseId, sets: [] };
          newSession.exercises.push(ex);
        }
        ex.sets[setIndex] = { ...data, completed: true };
        return { currentSession: newSession };
      }),
      endSession: () => set({ currentSession: null }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedTrainee: (id) => set({ selectedTraineeId: id }),
      setSelectedChatTraineeId: (id) => set({ selectedChatTraineeId: id }),
      resetUnreadCount: () => set({ unreadMessagesCount: 0 }),
      dismissAlert: (id) => set((state) => ({
        alerts: state.alerts.filter(a => a.id !== id)
      })),
      addGym: (gym) => set((state) => ({ gyms: [...state.gyms, gym] })),
      removeGym: (id) => set((state) => ({ gyms: state.gyms.filter(g => g.id !== id) })),
      recordAttendance: (traineeId, gymId, type) => set((state) => ({
        attendance: [...state.attendance, {
          id: Math.random().toString(),
          trainee_id: traineeId,
          gym_id: gymId,
          check_in: new Date().toISOString(),
          status: type === 'enter' ? 'present' : 'exited'
        }]
      })),
      bookSession: (traineeId, day, slotId) => set((state) => {
        const newAvailability = state.profile?.availability?.map(a => {
          if (a.day !== day) return a;
          return {
            ...a,
            slots: a.slots.map(s => s.id === slotId ? { ...s, booked_trainee_id: traineeId } : s)
          };
        });
        return { profile: state.profile ? { ...state.profile, availability: newAvailability } : null };
      }),
      cancelSession: (day, slotId) => set((state) => {
        const newAvailability = state.profile?.availability?.map(a => {
          if (a.day !== day) return a;
          return {
            ...a,
            slots: a.slots.map(s => s.id === slotId ? { ...s, booked_trainee_id: undefined } : s)
          };
        });
        return { profile: state.profile ? { ...state.profile, availability: newAvailability } : null };
      }),
      addAvailabilitySlot: (day, slot) => set((state) => {
        const newSlot = { ...slot, id: Math.random().toString() };
        const newAvailability = state.profile?.availability?.map(a => {
          if (a.day !== day) return a;
          return { ...a, slots: [...a.slots, newSlot] };
        }) || [];
        return { profile: state.profile ? { ...state.profile, availability: newAvailability } : null };
      }),
      removeAvailabilitySlot: (day, slotId) => set((state) => {
        const newAvailability = state.profile?.availability?.map(a => {
          if (a.day !== day) return a;
          return { ...a, slots: a.slots.filter(s => s.id !== slotId) };
        });
        return { profile: state.profile ? { ...state.profile, availability: newAvailability } : null };
      }),
      updateAvailability: (availability) => set((state) => ({
        profile: state.profile ? { ...state.profile, availability } : null
      })),
      updateSubscription: (traineeId, sub) => set((state) => ({
        managedTrainees: state.managedTrainees.map(t => 
          t.id === traineeId ? { ...t, subscription: { ...t.subscription!, ...sub } } : t
        )
      })),

      // Nutrition
      addMeal: (meal) => set((state) => ({ meals: [meal, ...state.meals] })),
      removeMeal: (id) => set((state) => ({ meals: state.meals.filter(m => m.id !== id) })),
      setMacroGoals: (macroGoals) => set({ macroGoals }),
      setNutritionProgramForTrainee: (traineeId, goals) => set((state) => ({
        managedTrainees: state.managedTrainees.map(t => 
          t.id === traineeId ? { ...t, nutrition_program: goals } : t
        )
      }))
    }),
    {
      name: 'oko-persistent-storage-v9',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
