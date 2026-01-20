import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Attachment } from '../models/attachment';
import { AppData } from '../../app-data';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private appData = inject(AppData);
  private api = this.appData.getBaseAPIURL() + '/attachments';
  private http = inject(HttpClient);
  private opts = { withCredentials: true } as const;

  getByLead(leadId: number) {
    return this.http.get<Attachment[]>(`${this.api}?lead_id=${leadId}`, this.opts);
  }

  upload(leadId: number, file: File) {
    const formData = new FormData();
    formData.append('lead_id', String(leadId));
    formData.append('file', file);
    return this.http.post<{ success: boolean; attachment: Attachment }>(`${this.api}`, formData, this.opts);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}?id=${id}`, this.opts);
  }
}
