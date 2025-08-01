import { supabase } from "../lib/supabaseClient";

export const createFolder = async ({
  name,
  user_id,
  parent_id = null,
}: {
  name: string;
  user_id: string;
  parent_id?: string | null;
}) => {
  const { data, error } = await supabase
    .from("folders")
    .insert([{ name, user_id, parent_id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getFoldersByUser = async (user_id: string) => {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getFolderById = async (id: string) => {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const updateFolder = async ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  const { data, error } = await supabase
    .from("folders")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteFolder = async (id: string) => {
  const { error } = await supabase.from("folders").delete().eq("id", id);
  if (error) throw error;
};
