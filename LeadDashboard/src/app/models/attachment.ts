export interface Attachment {
  id: number;
  lead_id: number;
  file_name: string;
  file_path: string;
  file_size?: number;
  uploaded_by?: number;
  uploader_name?: string;
  created_at: string;
}