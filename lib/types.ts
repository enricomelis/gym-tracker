import { z } from "zod";

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

export type Coach = {
  id: string;
  first_name: string;
  last_name: string;
  created_at?: string | null;
  updated_at?: string | null;
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
  birth_date: string | null;
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
export type OldAthleteRoutine = {
  id: string;
  athlete_id: string;
  routine_name: string;
  routine_volume: number;
  routine_notes: string;
  apparatus: Apparatus;
};

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

export type DailyRoutinePreset = {
  id: string;
  name: string;
  apparatus: "All" | "FX" | "PH" | "SR" | "VT" | "PB" | "HB";
  type: "I+" | "I" | "P" | "C" | "U" | "Std" | "G" | "S" | "B" | "D";
  quantity: number;
  target_sets: number;
  target_execution: "A+" | "A" | "B+" | "B" | "C+" | "C";
  created_by?: string | null;
};

export type TrainingSessionPreset = {
  id: string;
  name: string;
  created_by: string;
  week_day: number | null;
  fx_preset_id: string | null;
  ph_preset_id: string | null;
  sr_preset_id: string | null;
  vt_preset_id: string | null;
  pb_preset_id: string | null;
  hb_preset_id: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MacrocyclePreset = {
  id: string;
  name: string;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MicrocyclePreset = {
  id: string;
  name: string;
  allenamento_1: string | null;
  allenamento_2: string | null;
  allenamento_3: string | null;
  allenamento_4: string | null;
  allenamento_5: string | null;
  allenamento_6: string | null;
  allenamento_7: string | null;
  macrocycle_id: string | null;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

// nuovi tipi
export type AthletesRoutines = {
  id: string;
  athlete_id: string;
  routine_id: string;
  created_by: string;
};

export type Routine = {
  id: string;
  name: string;
  volume: number;
  notes: string;
  apparatus: Apparatus;
  type: DatabaseExerciseType;
  created_by: string;
};

// Zod schemas for validation

// Database enum values (from excel_routine_type)
export type DatabaseExerciseType =
  | "I+"
  | "Int"
  | "Par"
  | "Com"
  | "Usc"
  | "Std"
  | "G"
  | "S"
  | "B"
  | "D";

// Mapping between UI types and database types
export const UI_TO_DB_EXERCISE_TYPE: Record<
  ExerciseType,
  DatabaseExerciseType
> = {
  "I+": "I+",
  I: "Int",
  P: "Par",
  C: "Com",
  U: "Usc",
  Std: "Std",
  G: "G",
  S: "S",
  B: "B",
  D: "D",
};

export const DB_TO_UI_EXERCISE_TYPE: Record<
  DatabaseExerciseType,
  ExerciseType
> = {
  "I+": "I+",
  Int: "I",
  Par: "P",
  Com: "C",
  Usc: "U",
  Std: "Std",
  G: "G",
  S: "S",
  B: "B",
  D: "D",
};

export const RoutineSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  volume: z.number().int().min(0).max(1000),
  notes: z.string().optional(),
  apparatus: z.enum(["FX", "PH", "SR", "VT", "PB", "HB"]),
  type: z.enum(["I+", "Int", "Par", "Com", "Usc", "Std", "G", "S", "B", "D"]),
  created_by: z.string().uuid(),
});

export const CreateRoutineSchema = z.object({
  name: z
    .string()
    .min(1, "Il nome della routine è obbligatorio")
    .max(255, "Il nome non può superare i 255 caratteri"),
  volume: z
    .number()
    .int()
    .min(0, "Il volume deve essere un numero positivo")
    .max(1000, "Il volume non può superare 1000"),
  notes: z.string().optional(),
  apparatus: z.enum(["FX", "PH", "SR", "VT", "PB", "HB"], {
    errorMap: () => ({ message: "Apparato non valido" }),
  }),
  type: z.enum(["I+", "Int", "Par", "Com", "Usc", "Std", "G", "S", "B", "D"], {
    errorMap: () => ({ message: "Tipo di routine non valido" }),
  }),
  created_by: z.string().uuid("ID coach non valido"),
});

export type CreateRoutineInput = z.infer<typeof CreateRoutineSchema>;
