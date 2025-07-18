"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CreateRoutineSchema, type CreateRoutineInput } from "@/lib/types";

export type CreateAthleteState = {
  errors?: {
    registration_number?: string[];
    general?: string[];
  };
  success?: boolean;
};

export async function getAthletesForCoach(coachId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("athletes")
    .select("*")
    .eq("current_coach_id", coachId)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching athletes:", error);
    return [];
  }

  return data;
}

export async function getInactiveAthletesForCoach(coachId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("athletes")
    .select("*")
    .eq("current_coach_id", coachId)
    .eq("is_active", false);

  if (error) {
    console.error("Error fetching inactive athletes:", error);
    return [];
  }

  return data;
}

export async function getSocieties() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("societies").select("id, name");

  if (error) {
    console.error("Error fetching societies:", error);
    return [];
  }

  return data;
}

function getCategory(
  birthDate: string | null,
): "Allievi" | "Junior" | "Senior" {
  if (!birthDate) {
    return "Senior";
  }
  const birthDateObj = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  if (age < 14) {
    return "Allievi";
  } else if (age >= 14 && age < 18) {
    return "Junior";
  } else {
    return "Senior";
  }
}

const athleteSchema = z.object({
  first_name: z.string().min(1, { message: "Il nome è obbligatorio" }),
  last_name: z.string().min(1, { message: "Il cognome è obbligatorio" }),
  birth_date: z.string().refine((d) => !Number.isNaN(Date.parse(d)), {
    message: "Data di nascita non valida",
  }),
  registration_number: z.coerce
    .number({ invalid_type_error: "Numero di tessera non valido" })
    .int()
    .positive({ message: "Numero di tessera obbligatorio" }),
  society_id: z.string().uuid().optional().nullable(),
});

export async function createAthlete(
  prevState: CreateAthleteState,
  formData: FormData,
): Promise<CreateAthleteState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      errors: { general: ["User not found"] },
    };
  }

  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id")
    .eq("supabase_id", user.id)
    .single();

  if (coachError || !coach) {
    return {
      errors: { general: ["Coach not found"] },
    };
  }

  const registration_number = Number(formData.get("registrationNumber"));

  // Validate payload with Zod
  const parsed = athleteSchema.safeParse({
    first_name: formData.get("firstName") as string,
    last_name: formData.get("lastName") as string,
    birth_date: formData.get("dateOfBirth") as string,
    registration_number,
    society_id: formData.get("societyId") as string | null,
  });

  if (!parsed.success) {
    return {
      errors: {
        general: parsed.error.errors.map((e) => e.message),
      },
    };
  }

  const {
    first_name,
    last_name,
    birth_date,
    registration_number: regNum,
    society_id,
  } = parsed.data;

  // Check for duplicate registration number
  const { data: existingAthlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("registration_number", regNum)
    .maybeSingle();

  if (existingAthlete) {
    return {
      errors: {
        registration_number: [
          "Esiste già un atleta con questo numero di matricola.",
        ],
      },
    };
  }

  const rawFormData = {
    first_name,
    last_name,
    birth_date,
    registration_number: regNum,
    registered_society_id: society_id ?? null,
  };

  const category = getCategory(birth_date);

  const { error } = await supabase.from("athletes").insert([
    {
      ...rawFormData,
      category,
      current_coach_id: coach.id,
    },
  ]);

  if (error) {
    return {
      errors: { general: [error.message] },
    };
  }

  revalidatePath("/atleti");
  return { success: true };
}

export async function deleteAthlete(athleteId: string) {
  const supabase = await createClient();

  // Soft delete: set is_active = false
  const { error } = await supabase
    .from("athletes")
    .update({ is_active: false })
    .eq("id", athleteId);

  if (error) {
    console.error("Error deactivating athlete:", error);
    return { error: error.message };
  }

  revalidatePath("/atleti");
  return { success: true };
}

// Change athlete's current coach
export async function changeAthleteCoach(
  athleteId: string,
  newCoachId: string,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("athletes")
    .update({ current_coach_id: newCoachId })
    .eq("id", athleteId);

  if (error) {
    console.error("Error updating athlete coach:", error);
    return { error: error.message };
  }

  revalidatePath("/atleti");
  return { success: true };
}

export async function getCompetitions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("id, location, date")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching competitions:", error);
    return [];
  }

  return data;
}

export async function reactivateAthlete(athleteId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("athletes")
    .update({ is_active: true })
    .eq("id", athleteId);

  if (error) {
    console.error("Error reactivating athlete:", error);
    return { error: error.message };
  }

  revalidatePath("/atleti");
  return { success: true };
}

export async function createRoutine(routine: CreateRoutineInput) {
  const supabase = await createClient();

  // Validate input with Zod
  const validationResult = CreateRoutineSchema.safeParse(routine);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => err.message);
    return {
      error: `Validazione fallita: ${errors.join(", ")}`,
      details: validationResult.error.errors,
    };
  }

  const { data, error } = await supabase
    .from("routines")
    .insert([validationResult.data])
    .select("id")
    .single();

  if (error) {
    console.error("Error creating routine:", error);
    return { error: error.message };
  }

  return { success: true, routineId: data.id };
}

export async function getRoutines() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("routines").select("*");

  if (error) {
    console.error("Error fetching routines:", error);
    return [];
  }

  return data;
}

export async function connectRoutineToAthlete(
  athleteId: string,
  routineId: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not found" };
  }

  // Get the coach ID from the user's supabase_id
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id")
    .eq("supabase_id", user.id)
    .single();

  if (coachError || !coach) {
    return { error: "Coach not found" };
  }

  const { error } = await supabase.from("athletes_routines").insert([
    {
      athlete_id: athleteId,
      routine_id: routineId,
      created_by: coach.id, // Use coach.id instead of user.id
    },
  ]);

  if (error) {
    console.error("Error connecting routine to athlete:", error);
    return { error: error.message };
  }

  revalidatePath("/atleti");
  return { success: true };
}

export async function getRoutinesForAthlete(athleteId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("athletes_routines")
    .select("*")
    .eq("athlete_id", athleteId);

  if (error) {
    console.error("Error fetching routines for athlete:", error);
    return [];
  }

  return data;
}

export async function disconnectRoutineFromAthlete(
  athleteId: string,
  routineId: string,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("athletes_routines")
    .delete()
    .eq("athlete_id", athleteId)
    .eq("routine_id", routineId);

  if (error) {
    console.error("Error disconnecting routine from athlete:", error);
    return { error: error.message };
  }

  revalidatePath("/atleti");
  return { success: true };
}
