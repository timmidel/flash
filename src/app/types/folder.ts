export interface Folder {
  id: string;
  name: string;
  user_id: string;
  parent_id?: string | null;
  created_at?: string;
}
