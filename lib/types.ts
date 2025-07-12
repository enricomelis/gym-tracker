// Export dei tipi usati nell'app

export type Apparatus = "FX" | "PH" | "SR" | "VT" | "PB" | "HB";
export const APPARATUS_TYPES: Apparatus[] = [
  "FX",
  "PH",
  "SR",
  "VT",
  "PB",
  "HB",
];

export type Macro = "Mixed" | "Competition";
export const MACRO_TYPES: Macro[] = ["Mixed", "Competition"];

export type Micro =
  | "Increasing Load"
  | "Decreasing Load"
  | "Model"
  | "Competition Week";
export const MICRO_TYPES: Micro[] = [
  "Increasing Load",
  "Decreasing Load",
  "Model",
  "Competition Week",
];

export type ExecutionCoeff = "A+" | "A" | "B+" | "B" | "C+" | "C";
export const EXECUTION_COEFF_TYPES: ExecutionCoeff[] = [
  "A+",
  "A",
  "B+",
  "B",
  "C+",
  "C",
];

export type ExerciseType =
  | "I+"
  | "I"
  | "P"
  | "C"
  | "U"
  | "Std"
  | "G"
  | "S"
  | "B"
  | "D";
export const EXERCISE_TYPES_NOT_VAULT: ExerciseType[] = [
  "I+",
  "I",
  "P",
  "C",
  "U",
  "Std",
  "G",
  "S",
  "B",
  "D",
];
export const EXERCISE_TYPES_VAULT: ExerciseType[] = ["G", "S", "B", "D"];
export const EXERCISE_TYPES: ExerciseType[] = [
  ...EXERCISE_TYPES_NOT_VAULT,
  ...EXERCISE_TYPES_VAULT,
];

export const ExerciseTypeVolumeMultipliers: Record<ExerciseType, number> = {
  "I+": 1.15,
  I: 1.0,
  P: 0.5,
  C: 0.33,
  U: 1.0,
  Std: 0,
  G: 0,
  S: 0,
  B: 0,
  D: 0,
};

export const ExecutionPenaltyMap: Record<ExecutionCoeff, number> = {
  "A+": 1.4,
  A: 1.6,
  "B+": 1.8,
  B: 2.0,
  "C+": 2.2,
  C: 2.5,
};

export type Competition = {
  id: string;
  location: string;
  date: string;
};

// Tipi per la programmazione
export type WeeklyGoal = {
  id?: string;
  athlete_id: string;
  week_number: number;
  year: number;
  apparatus: "FX" | "PH" | "SR" | "VT" | "PB" | "HB";
  macro: "Mixed" | "Competition";
  micro: "Increasing Load" | "Decreasing Load" | "Model" | "Competition Week";
  exercise_volume: number;
  dismount_volume: number;
  target_penalty: number;
  base_volume?: number | null;
  camp?: string | null;
  competition_id?: string | null;
};

export type DailyRoutine = {
  id?: string;
  session_id: string;
  apparatus: "FX" | "PH" | "SR" | "VT" | "PB" | "HB";
  type: "I+" | "I" | "P" | "C" | "U" | "Std" | "G" | "S" | "B" | "D";
  quantity: number;
  target_sets: number; // n_salite
  target_execution: "A+" | "A" | "B+" | "B" | "C+" | "C";
};

export type TrainingSession = {
  id: string;
  date: string;
  session_number: number;
  daily_routines: DailyRoutine[];
};

export type EnrichedTrainingSession = {
  id: string;
  date: string;
  session_number: number;
  week_number: number;
  total_volume: number;
  average_intensity: number;
  routines: DailyRoutine[];
};

// Tipi per la gestione degli atleti
export type Athlete = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  registration_number: number;
  category: "Allievi" | "Junior" | "Senior";
  current_coach_id: string;
  registered_society_id: string | null;
  created_at: string;
  updated_at: string;
  supabase_id: string | null;
  is_active?: boolean;
};

// Tipi per la gestione delle sessioni di allenamento
export type UpdateApparatusSessionPayload = {
  id: string;
  base_volume: number;
  total_time: number;
  density?: number;
  intensity_sets_count?: number;
  total_volume?: number;
  average_intensity?: number;
  max_intensity?: number;
};

export type AddTrainingSetPayload = {
  apparatus_session_id: string;
  set_number: number;
  volume_done: number;
  execution_coefficient: string;
  execution_penalty: number;
  falls: number;
  elements_done_number: number;
  intensity: number;
};

export type ApparatusSession = {
  id: string;
  apparatus: string;
  base_volume: number;
  total_time: number;
  density: number | null;
  intensity_sets_count: number | null;
  total_volume: number | null;
  average_intensity: number | null;
  max_intensity: number | null;
};

export type TrainingSet = {
  id?: string;
  set_number: number;
  volume_done: number;
  execution_coefficient: string;
  execution_penalty: number;
  falls: number;
  elements_done_number: number;
  intensity: number;
};

// Tipi per la gestione dei presets
export type WeeklyGoalPreset = {
  id?: string;
  name: string;
  apparatus: "FX" | "PH" | "SR" | "VT" | "PB" | "HB";
  macro: "Mixed" | "Competition";
  micro: "Increasing Load" | "Decreasing Load" | "Model" | "Competition Week";
  exercise_volume: number;
  dismount_volume: number;
  target_penalty: number;
  base_volume?: number | null;
  created_by?: string;
};
