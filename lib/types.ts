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
  U: 1.0, // This will be handled separately
  Std: 0,
  G: 0,
  S: 0,
  B: 0,
  D: 0,
};

export type Competition = {
  id: string;
  location: string;
  date: string;
};
