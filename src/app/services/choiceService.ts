import { supabase } from "../lib/supabaseClient";
import { Choice } from "../types/item";

// Create multiple choices
export async function createChoices(choices: Omit<Choice, "id">[]) {
  const { data, error } = await supabase
    .from("choices")
    .insert(choices)
    .select();

  if (error) throw error;
  return data;
}

// Get choices by question_id
export async function getChoicesByQuestion(questionId: string) {
  const { data, error } = await supabase
    .from("choices")
    .select("*")
    .eq("question_id", questionId)
    .order("letter", { ascending: true });

  if (error) throw error;
  return data;
}

// Update a single choice
export async function updateChoice(id: string, updates: Partial<Choice>) {
  const { data, error } = await supabase
    .from("choices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete a choice
export async function deleteChoice(id: string) {
  const { error } = await supabase.from("choices").delete().eq("id", id);

  if (error) throw error;
}
