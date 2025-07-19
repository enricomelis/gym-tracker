import { z } from "zod";

// Export dei tipi usati nell'app

// ============================================================================
// TIPI FONDAMENTALI (mantenuti per compatibilità con sistema allenamenti)
// ============================================================================

export type Apparatus = "FX" | "PH" | "SR" | "VT" | "PB" | "HB";
export const APPARATUS_TYPES: Apparatus[] = [
  "FX",
  "PH",
  "SR",
  "VT",
  "PB",
  "HB",
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

// ============================================================================
// TIPI PER GESTIONE ATLETI E COACH
// ============================================================================

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

// ============================================================================
// TIPI PER SESSIONI DI ALLENAMENTO (sistema attivo)
// ============================================================================

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

// ============================================================================
// NUOVI TIPI PER SISTEMA PRESET (prefisso "New")
// ============================================================================

export type NewAthletesRoutines = {
  id: string;
  athlete_id: string;
  routine_id: string;
  created_by: string;
};

export type NewRoutine = {
  id: string;
  name: string;
  volume: number;
  notes: string;
  apparatus: Apparatus;
  type: NewDatabaseExerciseType;
  created_by: string;
};

// Database enum values (from excel_routine_type)
export type NewDatabaseExerciseType =
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
  NewDatabaseExerciseType
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
  NewDatabaseExerciseType,
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

export const NewRoutineSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  volume: z.number().int().min(0).max(1000),
  notes: z.string().optional(),
  apparatus: z.enum(["FX", "PH", "SR", "VT", "PB", "HB"]),
  type: z.enum(["I+", "Int", "Par", "Com", "Usc", "Std", "G", "S", "B", "D"]),
  created_by: z.string().uuid(),
});

export const NewCreateRoutineSchema = z.object({
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

export type NewCreateRoutineInput = z.infer<typeof NewCreateRoutineSchema>;

export type NewApparatusPreset = {
  id: string;
  name: string;
  apparatus: Apparatus;
  quantity: number;
  execution_grade: ExecutionCoeff;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NewPresetType =
  | "attrezzo"
  | "allenamento"
  | "giornaliero"
  | "microciclo"
  | "macrociclo";

export type NewTrainingSessionPreset = {
  id: string;
  name: string;
  fx_preset_id: string | null;
  ph_preset_id: string | null;
  sr_preset_id: string | null;
  vt_preset_id: string | null;
  pb_preset_id: string | null;
  hb_preset_id: string | null;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NewWeekdayPreset = {
  id: string;
  weekday_number: number;
  name: string;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NewWeekdaysSessionsPreset = {
  id: string;
  name: string;
  weekday_id: string;
  session_id: string;
  session_number: number;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NewMicrocyclePreset = {
  id: string;
  name: string;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NewMicrocyclesWeekdaysPreset = {
  id: string;
  name: string;
  microcycle_id: string;
  weekday_id: string;
  day_number: number;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NewMacrocyclePreset = {
  id: string;
  name: string;
  length_in_weeks: number;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NewMacrocyclesMicrocyclesPreset = {
  id: string;
  name: string;
  macrocycle_id: string;
  microcycle_id: string;
  week_number: number;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};
