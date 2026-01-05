export interface LeadHistory {
  id: number;
  lead_id: number;
  action: string;
  user_id?: number;
  user_name?: string;
  created_at: string;
}
