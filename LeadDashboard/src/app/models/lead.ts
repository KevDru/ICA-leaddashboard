export interface Lead {
  id: number;
  title: string;
  customer: string;
  description: string;
  column_id: number;
  created_by?: number;
  creator_name?: string;
  created_at?: string;
  updated_at?: string;
}
