import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Note } from '../models/note';
import { AppData } from '../../app-data';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private appData = inject(AppData);
  private api = this.appData.getBaseAPIURL() + '/notes';
  private http = inject(HttpClient);
  private opts = { withCredentials: true } as const;

  getByLead(leadId: number) {
    return this.http.get<Note[]>(`${this.api}?lead_id=${leadId}`, this.opts);
  }

  create(leadId: number, content: string) {
    return this.http.post<{ success: boolean; note: Note }>(`${this.api}`, { lead_id: leadId, content }, this.opts);
  }

  update(id: number, content: string) {
    return this.http.put<{ success: boolean }>(`${this.api}?id=${id}`, { content }, this.opts);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}?id=${id}`, this.opts);
  }
}
