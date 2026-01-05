export interface Note {
  id: number;
  lead_id: number;
  content: string;
  created_by?: number;
  author_name?: string;
  created_at: string;
  updated_at?: string;
}