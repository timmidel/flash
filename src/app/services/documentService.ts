import { supabase } from "../lib/supabaseClient";
import { deleteImageFolder } from "./rationaleImageService";

type Document = {
  id?: string;
  user_id?: string;
  folder_id?: string | null;
  title: string;
  content: string;
  answer_flag?: string;
  rationale_flag?: string;
  created_at?: string;
};

export async function createDocument(doc: Omit<Document, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("documents")
    .insert([doc])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDocumentsByUser(
  userId: string,
  folderId: string | null = null
) {
  let query = supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (folderId) {
    query = query.eq("folder_id", folderId);
  } else {
    query = query.is("folder_id", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getDocumentById(id: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getDocumentsByFolder(folderId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("folder_id", folderId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, updates: Partial<Document>) {
  const { data, error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
  await deleteImageFolder("rationale-images", id); // Clean up related images
}
