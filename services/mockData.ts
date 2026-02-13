
import { Exercise, Program, WorkoutDay } from '../types';

export const MOCK_EXERCISES: Exercise[] = [
  // Chest
  { id: 'c1', name_en: 'Flat Bench Press', name_fa: 'پرس سینه تخت دمبل', muscle_group: 'chest', equipment: 'Dumbbells', difficulty: 'intermediate', category: 'compound' },
  { id: 'c2', name_en: 'Incline Bench Press', name_fa: 'پرس بالا سینه دمبل', muscle_group: 'chest', equipment: 'Dumbbells', difficulty: 'intermediate', category: 'compound' },
  { id: 'c3', name_en: 'Chest Flyes', name_fa: 'قفسه سینه دمبل', muscle_group: 'chest', equipment: 'Dumbbells', difficulty: 'beginner', category: 'isolation' },
  { id: 'c4', name_en: 'Cable Crossover', name_fa: 'کراس اور', muscle_group: 'chest', equipment: 'Cable', difficulty: 'intermediate', category: 'isolation' },
  { id: 'c5', name_en: 'Push-Ups', name_fa: 'شنا سوئدی', muscle_group: 'chest', equipment: 'Bodyweight', difficulty: 'beginner', category: 'compound' },
  { id: 'c6', name_en: 'Dips', name_fa: 'پارالل (سینه)', muscle_group: 'chest', equipment: 'Bodyweight', difficulty: 'intermediate', category: 'compound' },
  
  // Back
  { id: 'b1', name_en: 'Deadlift', name_fa: 'ددلیفت', muscle_group: 'back', equipment: 'Barbell', difficulty: 'advanced', category: 'compound' },
  { id: 'b2', name_en: 'Pull Ups', name_fa: 'بارفیکس', muscle_group: 'back', equipment: 'Bodyweight', difficulty: 'advanced', category: 'compound' },
  { id: 'b3', name_en: 'Lat Pulldown', name_fa: 'زیربغل سیمکش', muscle_group: 'back', equipment: 'Cable', difficulty: 'beginner', category: 'compound' },
  { id: 'b4', name_en: 'Seated Row', name_fa: 'قایقی', muscle_group: 'back', equipment: 'Cable', difficulty: 'beginner', category: 'compound' },
  { id: 'b5', name_en: 'One Arm Row', name_fa: 'زیربغل تک خم', muscle_group: 'back', equipment: 'Dumbbell', difficulty: 'intermediate', category: 'compound' },
  { id: 'b6', name_en: 'T-Bar Row', name_fa: 'تی بار', muscle_group: 'back', equipment: 'Barbell', difficulty: 'intermediate', category: 'compound' },
  { id: 'b7', name_en: 'Face Pulls', name_fa: 'فیس پول', muscle_group: 'back', equipment: 'Cable', difficulty: 'beginner', category: 'isolation' },

  // Legs
  { id: 'l1', name_en: 'Back Squat', name_fa: 'اسکات پا هالتر', muscle_group: 'legs', equipment: 'Barbell', difficulty: 'advanced', category: 'compound' },
  { id: 'l2', name_en: 'Leg Press', name_fa: 'پرس پا', muscle_group: 'legs', equipment: 'Machine', difficulty: 'beginner', category: 'compound' },
  { id: 'l3', name_en: 'Leg Extension', name_fa: 'جلو پا دستگاه', muscle_group: 'legs', equipment: 'Machine', difficulty: 'beginner', category: 'isolation' },
  { id: 'l4', name_en: 'Leg Curl', name_fa: 'پشت پا دستگاه', muscle_group: 'legs', equipment: 'Machine', difficulty: 'beginner', category: 'isolation' },
  { id: 'l5', name_en: 'Lunges', name_fa: 'لانگز دمبل', muscle_group: 'legs', equipment: 'Dumbbells', difficulty: 'intermediate', category: 'compound' },
  { id: 'l6', name_en: 'Calf Raises', name_fa: 'ساق پا ایستاده', muscle_group: 'legs', equipment: 'Machine', difficulty: 'beginner', category: 'isolation' },
  { id: 'l7', name_en: 'Romanian Deadlift', name_fa: 'ددلیفت رومانیایی', muscle_group: 'legs', equipment: 'Barbell', difficulty: 'intermediate', category: 'compound' },
  { id: 'l8', name_en: 'Glute Bridge', name_fa: 'پل باسن', muscle_group: 'legs', equipment: 'Bodyweight', difficulty: 'beginner', category: 'isolation' },

  // Shoulders
  { id: 's1', name_en: 'Military Press', name_fa: 'پرس سرشانه هالتر', muscle_group: 'shoulders', equipment: 'Barbell', difficulty: 'advanced', category: 'compound' },
  { id: 's2', name_en: 'Lateral Raise', name_fa: 'نشر جانب دمبل', muscle_group: 'shoulders', equipment: 'Dumbbells', difficulty: 'beginner', category: 'isolation' },
  { id: 's3', name_en: 'Front Raise', name_fa: 'نشر جلو دمبل', muscle_group: 'shoulders', equipment: 'Dumbbells', difficulty: 'beginner', category: 'isolation' },
  { id: 's4', name_en: 'Arnold Press', name_fa: 'پرس آرنولدی', muscle_group: 'shoulders', equipment: 'Dumbbells', difficulty: 'intermediate', category: 'compound' },
  { id: 's5', name_en: 'Upright Row', name_fa: 'کول هالتر', muscle_group: 'shoulders', equipment: 'Barbell', difficulty: 'intermediate', category: 'compound' },

  // Arms
  { id: 'a1', name_en: 'Bicep Curls', name_fa: 'جلو بازو دمبل', muscle_group: 'arms', equipment: 'Dumbbells', difficulty: 'beginner', category: 'isolation' },
  { id: 'a2', name_en: 'Hammer Curls', name_fa: 'جلو بازو چکشی', muscle_group: 'arms', equipment: 'Dumbbells', difficulty: 'beginner', category: 'isolation' },
  { id: 'a3', name_en: 'Tricep Pushdown', name_fa: 'پشت بازو سیمکش', muscle_group: 'arms', equipment: 'Cable', difficulty: 'beginner', category: 'isolation' },
  { id: 'a4', name_en: 'Skull Crushers', name_fa: 'پشت بازو هالتر خوابیده', muscle_group: 'arms', equipment: 'Barbell', difficulty: 'intermediate', category: 'isolation' },
  { id: 'a5', name_en: 'Barbell Curls', name_fa: 'جلو بازو هالتر ایستاده', muscle_group: 'arms', equipment: 'Barbell', difficulty: 'intermediate', category: 'isolation' },

  // Core & HIIT
  { id: 'cr1', name_en: 'Plank', name_fa: 'پلانک', muscle_group: 'core', equipment: 'Bodyweight', difficulty: 'beginner', category: 'isolation' },
  { id: 'cr2', name_en: 'Crunches', name_fa: 'کرانچ', muscle_group: 'core', equipment: 'Bodyweight', difficulty: 'beginner', category: 'isolation' },
  { id: 'cr3', name_en: 'Leg Raises', name_fa: 'زیر شکم خلبانی', muscle_group: 'core', equipment: 'Bodyweight', difficulty: 'intermediate', category: 'isolation' },
  { id: 'cr4', name_en: 'Mountain Climbers', name_fa: 'کوهنوردی', muscle_group: 'core', equipment: 'Bodyweight', difficulty: 'intermediate', category: 'cardio' },
  { id: 'cr5', name_en: 'Burpees', name_fa: 'برپی', muscle_group: 'core', equipment: 'Bodyweight', difficulty: 'advanced', category: 'cardio' },

  // TRX
  { id: 'trx1', name_en: 'TRX Chest Press', name_fa: 'پرس سینه TRX', muscle_group: 'chest', equipment: 'TRX', difficulty: 'intermediate', category: 'compound' },
  { id: 'trx2', name_en: 'TRX Row', name_fa: 'زیربغل قایقی TRX', muscle_group: 'back', equipment: 'TRX', difficulty: 'beginner', category: 'compound' },
  { id: 'trx3', name_en: 'TRX Squat', name_fa: 'اسکات TRX', muscle_group: 'legs', equipment: 'TRX', difficulty: 'beginner', category: 'compound' },
  { id: 'trx4', name_en: 'TRX Y-Fly', name_fa: 'نشر وای TRX', muscle_group: 'shoulders', equipment: 'TRX', difficulty: 'intermediate', category: 'isolation' },
];

export const DEFAULT_TEMPLATES: Program[] = [
  {
    id: 'tpl-male-gain',
    name_fa: 'فاز حجم آقایان (حرفه‌ای)',
    name_en: 'Professional Male Bulking',
    is_template: true,
    duration_weeks: 12,
    days_per_week: 4,
    is_active: false,
    workout_days: [
      {
        id: 'tpl-mg-d1',
        day_number: 1,
        name_fa: 'بالاتنه (قدرتی)',
        focus: 'Upper Body Power',
        rest_day: false,
        exercises: [
          { id: 'we-mg-1', exercise_id: 'c1', exercise: MOCK_EXERCISES.find(e => e.id === 'c1'), sets: 4, reps: '6-8', rest_seconds: 120 },
          { id: 'we-mg-2', exercise_id: 'b1', exercise: MOCK_EXERCISES.find(e => e.id === 'b1'), sets: 3, reps: '5', rest_seconds: 180 },
          { id: 'we-mg-3', exercise_id: 's1', exercise: MOCK_EXERCISES.find(e => e.id === 's1'), sets: 3, reps: '8', rest_seconds: 90 },
        ]
      },
      {
        id: 'tpl-mg-d2',
        day_number: 2,
        name_fa: 'پایین‌تنه (قدرتی)',
        focus: 'Lower Body Power',
        rest_day: false,
        exercises: [
          { id: 'we-mg-4', exercise_id: 'l1', exercise: MOCK_EXERCISES.find(e => e.id === 'l1'), sets: 4, reps: '6-8', rest_seconds: 150 },
          { id: 'we-mg-5', exercise_id: 'l7', exercise: MOCK_EXERCISES.find(e => e.id === 'l7'), sets: 3, reps: '10', rest_seconds: 90 },
        ]
      }
    ]
  },
  {
    id: 'tpl-female-loss',
    name_fa: 'کاهش وزن و فرم‌دهی بانوان',
    name_en: 'Female Weight Loss & Tone',
    is_template: true,
    duration_weeks: 8,
    days_per_week: 3,
    is_active: false,
    workout_days: [
      {
        id: 'tpl-fl-d1',
        day_number: 1,
        name_fa: 'فول بادی (هوازی + قدرتی)',
        focus: 'Full Body HIIT',
        rest_day: false,
        exercises: [
          { id: 'we-fl-1', exercise_id: 'l8', exercise: MOCK_EXERCISES.find(e => e.id === 'l8'), sets: 4, reps: '20', rest_seconds: 45 },
          { id: 'we-fl-2', exercise_id: 'cr4', exercise: MOCK_EXERCISES.find(e => e.id === 'cr4'), sets: 3, reps: '45 sec', rest_seconds: 30 },
          { id: 'we-fl-3', exercise_id: 'b3', exercise: MOCK_EXERCISES.find(e => e.id === 'b3'), sets: 3, reps: '15', rest_seconds: 60 },
        ]
      }
    ]
  },
  {
    id: 'tpl-trx-full',
    name_fa: 'تمرین معلق TRX (تمام بدن)',
    name_en: 'TRX Full Body Suspension',
    is_template: true,
    duration_weeks: 6,
    days_per_week: 3,
    is_active: false,
    workout_days: [
      {
        id: 'tpl-trx-d1',
        day_number: 1,
        name_fa: 'قدرت و تعادل TRX',
        focus: 'TRX Strength',
        rest_day: false,
        exercises: [
          { id: 'we-trx-1', exercise_id: 'trx1', exercise: MOCK_EXERCISES.find(e => e.id === 'trx1'), sets: 3, reps: '12', rest_seconds: 60 },
          { id: 'we-trx-2', exercise_id: 'trx2', exercise: MOCK_EXERCISES.find(e => e.id === 'trx2'), sets: 3, reps: '15', rest_seconds: 60 },
          { id: 'we-trx-3', exercise_id: 'trx3', exercise: MOCK_EXERCISES.find(e => e.id === 'trx3'), sets: 3, reps: '20', rest_seconds: 45 },
        ]
      }
    ]
  },
  {
    id: 'tpl-home-basic',
    name_fa: 'تمرین در منزل (بدون وسیله)',
    name_en: 'Home Workout (No Equipment)',
    is_template: true,
    duration_weeks: 4,
    days_per_week: 3,
    is_active: false,
    workout_days: [
      {
        id: 'tpl-hb-d1',
        day_number: 1,
        name_fa: 'شنبه - آمادگی بدنی',
        focus: 'Bodyweight Basics',
        rest_day: false,
        exercises: [
          { id: 'we-hb-1', exercise_id: 'c5', exercise: MOCK_EXERCISES.find(e => e.id === 'c5'), sets: 3, reps: '15', rest_seconds: 60 },
          { id: 'we-hb-2', exercise_id: 'l8', exercise: MOCK_EXERCISES.find(e => e.id === 'l8'), sets: 3, reps: '20', rest_seconds: 60 },
          { id: 'we-hb-3', exercise_id: 'cr1', exercise: MOCK_EXERCISES.find(e => e.id === 'cr1'), sets: 3, reps: '60 sec', rest_seconds: 30 },
        ]
      }
    ]
  },
  {
    id: 'tpl-weight-loss-general',
    name_fa: 'پکیج طلایی کاهش وزن',
    name_en: 'General Weight Loss Package',
    is_template: true,
    duration_weeks: 10,
    days_per_week: 3,
    is_active: false,
    workout_days: [
      {
        id: 'tpl-wlg-d1',
        day_number: 1,
        name_fa: 'تمرین چربی سوزی فول بادی',
        focus: 'Fat Burner',
        rest_day: false,
        exercises: [
          { id: 'we-wlg-1', exercise_id: 'cr5', exercise: MOCK_EXERCISES.find(e => e.id === 'cr5'), sets: 3, reps: '12', rest_seconds: 60 },
          { id: 'we-wlg-2', exercise_id: 'l5', exercise: MOCK_EXERCISES.find(e => e.id === 'l5'), sets: 3, reps: '15', rest_seconds: 45 },
          { id: 'we-wlg-3', exercise_id: 'c5', exercise: MOCK_EXERCISES.find(e => e.id === 'c5'), sets: 3, reps: '20', rest_seconds: 60 },
        ]
      }
    ]
  }
];

export const MOCK_PROGRAM: Program = {
  id: 'p1',
  name_en: 'Hypertrophy Phase 1',
  name_fa: 'فاز حجم ۱',
  goal: 'muscle_gain',
  duration_weeks: 4,
  days_per_week: 3,
  is_active: true,
  workout_days: [
    {
      id: 'd1',
      day_number: 1,
      name_fa: 'شنبه - سینه و پشت بازو',
      focus: 'Chest & Triceps',
      rest_day: false,
      exercises: [
        { id: 'we1', exercise_id: 'c1', exercise: MOCK_EXERCISES[0], sets: 4, reps: '8-12', rest_seconds: 90 },
      ]
    },
    {
      id: 'd2',
      day_number: 2,
      name_fa: 'یکشنبه - استراحت',
      rest_day: true,
    },
    {
      id: 'd3',
      day_number: 3,
      name_fa: 'دوشنبه - پا و شکم',
      focus: 'Legs & Abs',
      rest_day: false,
      exercises: [
        { id: 'we2', exercise_id: 'l1', exercise: MOCK_EXERCISES[9], sets: 3, reps: '10', rest_seconds: 120 },
      ]
    }
  ]
};
