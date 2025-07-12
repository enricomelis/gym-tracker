"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  dateOfBirth: string | null,
): "Allievi" | "Junior" | "Senior" {
  if (!dateOfBirth) {
    return "Senior";
  }
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
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
  date_of_birth: z.string().refine((d) => !Number.isNaN(Date.parse(d)), {
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
    date_of_birth: formData.get("dateOfBirth") as string,
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
    date_of_birth,
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
    date_of_birth,
    registration_number: regNum,
    registered_society_id: society_id ?? null,
  };

  const category = getCategory(date_of_birth);

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

export async function addAthleteRoutine(
  athlete_id: string,
  routine_name: string,
  routine_volume: number,
  routine_notes: string,
) {
  const supabase = await createClient();

  // Validate input with Zod
  const routineSchema = z.object({
    athlete_id: z.string().uuid(),
    routine_name: z.string().min(1),
    routine_volume: z.number().int().min(1),
    routine_notes: z.string().nullable().optional(),
  });

  const parsed = routineSchema.safeParse({
    athlete_id,
    routine_name,
    routine_volume,
    routine_notes,
  });

  if (!parsed.success) {
    console.error("Invalid routine data", parsed.error);
    return { error: "Invalid routine data" } as const;
  }

  const { data, error } = await supabase.from("athlete_routines").insert({
    ...parsed.data,
  });

  if (error) {
    console.error("Error adding athlete routine:", error);
    return { error: error.message } as const;
  }

  return { success: true, data } as const;
}
