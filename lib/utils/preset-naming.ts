/**
 * Utility functions for automatic preset naming following the hierarchy:
 * Macrocycle -> Microcycle -> Session -> Apparatus
 */

export const formatApparatusName = (apparatus: string) => {
  const names: Record<string, string> = {
    FX: "Corpo Libero",
    PH: "Cavallo",
    SR: "Anelli",
    VT: "Volteggio",
    PB: "Parallele",
    HB: "Sbarra",
    All: "Tutti gli Attrezzi",
  };
  return names[apparatus] || apparatus;
};

export const getWeekdayLabel = (dayNumber: number) => {
  const weekDays = [
    { value: 1, label: "Lunedì" },
    { value: 2, label: "Martedì" },
    { value: 3, label: "Mercoledì" },
    { value: 4, label: "Giovedì" },
    { value: 5, label: "Venerdì" },
    { value: 6, label: "Sabato" },
    { value: 7, label: "Domenica" },
  ];

  return (
    weekDays.find((day) => day.value === dayNumber)?.label ||
    `Giorno ${dayNumber}`
  );
};

/**
 * Generates automatic names for presets based on their hierarchy level
 */
export const generatePresetName = {
  /**
   * For microcycle presets: "MacrocycleName - DayName"
   */
  microcycle: (macrocycleName: string, dayName: string) => {
    return `${macrocycleName} - ${dayName}`;
  },

  /**
   * For session presets: "MicrocycleName - DayName"
   */
  session: (microcycleName: string, dayName: string) => {
    return `${microcycleName} - ${dayName}`;
  },

  /**
   * For apparatus presets: "SessionName - ApparatusName"
   */
  apparatus: (sessionName: string, apparatusName: string) => {
    return `${sessionName} - ${apparatusName}`;
  },
};

/**
 * Extracts the base name from a hierarchical preset name
 * Example: "SG - Lunedì - Cavallo" -> "SG"
 */
export const extractBaseName = (presetName: string): string => {
  const parts = presetName.split(" - ");
  return parts[0] || presetName;
};

/**
 * Checks if a preset name follows the hierarchical naming convention
 */
export const isHierarchicalName = (presetName: string): boolean => {
  return presetName.includes(" - ");
};

/**
 * Gets the parent name from a hierarchical preset name
 * Example: "SG - Lunedì - Cavallo" -> "SG - Lunedì"
 */
export const getParentName = (presetName: string): string => {
  const parts = presetName.split(" - ");
  if (parts.length >= 2) {
    return parts.slice(0, -1).join(" - ");
  }
  return presetName;
};
