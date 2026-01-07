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
  // Optional contact fields — may be absent if backend hasn't been extended yet
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
}
