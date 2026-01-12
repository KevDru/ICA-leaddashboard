export interface Tag {
  id: number;
  name: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LeadTag {
  id: number;
  lead_id: number;
  tag_id: number;
  name: string;
  color?: string;
  percentage?: number | null;
  tag?: Tag;
  created_at?: string;
}
