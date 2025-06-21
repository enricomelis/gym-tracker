"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
    .eq("current_coach_id", coachId);

  if (error) {
    console.error("Error fetching athletes:", error);
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

function getCategory(dateOfBirth: string): "Allievi" | "Junior" | "Senior" {
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

  // Check for duplicate registration number
  const { data: existingAthlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("registration_number", registration_number)
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
    first_name: formData.get("firstName") as string,
    last_name: formData.get("lastName") as string,
    date_of_birth: formData.get("dateOfBirth") as string,
    registration_number,
    registered_society_id: formData.get("societyId") as string | null,
  };

  const category = getCategory(rawFormData.date_of_birth);

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

  const { error } = await supabase
    .from("athletes")
    .delete()
    .eq("id", athleteId);

  if (error) {
    console.error("Error deleting athlete:", error);
    return { error: error.message };
  }

  revalidatePath("/atleti");
  return { success: true };
}
