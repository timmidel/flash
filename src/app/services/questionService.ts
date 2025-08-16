import { supabase } from "../lib/supabaseClient";
import { Question } from "../types/item";

// Create a question
export async function createQuestion(
  question: Omit<Question, "id" | "created_at" | "choices">
) {
  const { data, error } = await supabase
    .from("questions")
    .insert([question])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get all questions by document_id
export async function getQuestionsByDocument(documentId: string) {
  const { data, error } = await supabase
    .from("questions")
    .select(
      `
    id,
    question_text,
    answer,
    rationale,
    selected_answer,
    created_at,
    choices:choices (
      id,
      letter,
      text
    )
  `
    )
    .eq("document_id", documentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

// Get a single question by id
export async function getQuestionById(id: string) {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Update a question
export async function updateQuestions(
  ids: string[],
  updates: Partial<Question>
) {
  const { data, error } = await supabase
    .from("questions")
    .update(updates)
    .eq("id", ids)
    .select();

  if (error) throw error;
  return data;
}

export async function bulkUpdateQuestions(
  updates: { id: string; data: Partial<Question> }[]
) {
  const results = [];
  for (const { id, data } of updates) {
    const { data: updated, error } = await supabase
      .from("questions")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    results.push(updated);
  }
  return results;
}
// Delete a question
export async function deleteQuestion(id: string) {
  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) throw error;
}
