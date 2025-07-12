"use server";
import { createClient } from "@/lib/supabase/server";
import {
  type UpdateApparatusSessionPayload,
  type AddTrainingSetPayload,
} from "@/lib/types";
import { z } from "zod";

export async function initApparatusSession(formData: FormData) {
  const trainingSessionId = formData.get("trainingSessionId") as string;
  const athleteId = formData.get("athleteId") as string;
  const apparatus = formData.get("apparatus") as string;
  if (!trainingSessionId || !athleteId || !apparatus) {
    return { error: "Missing parameters" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apparatus_sessions")
    .insert({
      training_session_id: trainingSessionId,
      apparatus,
      base_volume: 0,
      total_time: 1,
      density: null,
      intensity_sets_count: 0,
      total_volume: null,
      average_intensity: null,
      max_intensity: null,
    })
    .select()
    .single();
  if (error) {
    return { error: error.message };
  }
  return { session: data };
}

export async function updateApparatusSession({
  id,
  base_volume,
  total_time,
  density,
  intensity_sets_count,
  total_volume,
  average_intensity,
  max_intensity,
}: UpdateApparatusSessionPayload) {
  const supabase = await createClient();
  const updateObj: Record<string, unknown> = { base_volume, total_time };
  if (typeof density === "number") updateObj.density = density;
  if (typeof intensity_sets_count === "number")
    updateObj.intensity_sets_count = intensity_sets_count;
  if (typeof total_volume === "number") updateObj.total_volume = total_volume;
  if (typeof average_intensity === "number")
    updateObj.average_intensity = average_intensity;
  if (typeof max_intensity === "number")
    updateObj.max_intensity = max_intensity;
  const { data, error } = await supabase
    .from("apparatus_sessions")
    .update(updateObj)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    return { error: error.message };
  }
  return { session: data };
}

export async function addTrainingSet(payload: AddTrainingSetPayload) {
  // Validate payload using Zod
  const setSchema = z.object({
    apparatus_session_id: z.string().uuid(),
    set_number: z.number().int().min(1),
    volume_done: z.number().int().min(1),
    execution_coefficient: z.enum(["A+", "A", "B+", "B", "C+", "C"]),
    execution_penalty: z.number().min(0).max(10),
    falls: z.number().int().min(0),
    elements_done_number: z.number().int().min(1),
    intensity: z.number().min(0),
  });

  const parsed = setSchema.safeParse(payload);

  if (!parsed.success) {
    return { error: "Invalid training set data" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_sets")
    .insert(parsed.data)
    .select()
    .single();
  if (error) {
    return { error: error.message };
  }
  return { set: data };
}

export async function deleteTrainingSet(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("training_sets").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }
  return { success: true };
}
