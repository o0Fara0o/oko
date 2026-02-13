
export type Role = 'trainer' | 'trainee';
export type Goal = 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance' | 'flexibility';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Category = 'compound' | 'isolation' | 'cardio' | 'stretch' | 'warmup';
export type SlotType = 'normal' | 'vip';

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  neck?: number;
}

export interface Meal {
  id: string;
  name: string;
  timestamp: Date;
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface MacroGoals {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  guidelines?: string;
}

export interface Subscription {
  type: 'normal' | 'vip';
  price: number;
  sessions_total: number;
  sessions_remaining: number;
  expiry_date?: string;
  is_paid: boolean;
}

export interface AvailabilitySlot {
  id: string;
  time: string;
  type: SlotType;
  gym_id: string;
  booked_trainee_id?: string;
}

export interface Availability {
  day: string;
  slots: AvailabilitySlot[];
}

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  avatar_url?: string;
  avatar_data?: string;
  reference_images?: {
    face?: string;
    front?: string;
    angle?: string;
  };
  phone?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: Goal;
  fitness_level?: Difficulty;
  body_measurements?: BodyMeasurements;
  // Trainer Specifics
  experience_years?: number;
  expertise?: string[];
  certificates?: string[];
  resume_summary?: string;
  availability?: Availability[];
  // Trainee Specifics
  nutrition_program?: MacroGoals;
}

export interface TraineeSummary extends Profile {
  last_workout?: string;
  compliance_rate: number;
  active_program?: Program;
  active_program_name?: string;
  recent_weight_change: number;
  inspiration_image?: string; 
  unread_count?: number;
  last_message_at?: string;
  is_vip?: boolean;
  subscription?: Subscription;
}

export interface Gym {
  id: string;
  name_fa: string;
  name_en: string;
  address?: string;
  trainer_id: string;
}

export interface AttendanceRecord {
  id: string;
  trainee_id: string;
  gym_id: string;
  check_in: string;
  check_out?: string;
  status: 'present' | 'exited';
}

export interface Exercise {
  id: string;
  name_en: string;
  name_fa: string;
  description_en?: string;
  description_fa?: string;
  muscle_group: string;
  secondary_muscles?: string[];
  equipment?: string;
  difficulty: Difficulty;
  video_url?: string;
  thumbnail_url?: string;
  instructions_en?: string[];
  instructions_fa?: string[];
  tips_en?: string[];
  tips_fa?: string[];
  category: Category;
}

export interface WorkoutExercise {
  id: string;
  exercise_id: string;
  exercise?: Exercise;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  day_number: number;
  name_en?: string;
  name_fa?: string;
  focus?: string;
  rest_day: boolean;
  exercises?: WorkoutExercise[];
}

export interface Program {
  id: string;
  name_en?: string;
  name_fa?: string;
  goal?: Goal;
  duration_weeks: number;
  days_per_week: number;
  is_active: boolean;
  is_template?: boolean;
  workout_days?: WorkoutDay[];
}

export interface SetLog {
  reps: number;
  weight: number;
  rpe?: number;
  completed: boolean;
}

export interface WorkoutLog {
  id: string;
  date: string;
  workout_name: string;
  volume: number;
  duration: number;
  trainee_id?: string;
}

export type MessageType = 'text' | 'image' | 'audio';
export type ChatChannel = 'direct' | 'ai';

export interface Message {
  id: string;
  type: MessageType;
  chat_type: ChatChannel;
  text?: string;
  media_data?: string;
  sender: 'user' | 'ai' | 'trainer';
  timestamp: Date;
  trainee_id: string;
  is_broadcast?: boolean;
}

export interface WorkoutSession {
  dayId: string;
  startTime: number;
  exercises: {
    exerciseId: string;
    sets: SetLog[];
  }[];
}

export interface Alert {
  id: string;
  trainee: string;
  issue: string;
  type: 'danger' | 'warning' | 'info';
  timestamp: string;
}

export interface DailyWorkoutRecord {
  traineeId: string;
  name: string;
  activity: string;
  time: string;
  status: 'active' | 'completed';
}
