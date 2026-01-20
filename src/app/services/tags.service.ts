import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tag, LeadTag } from '../models/tag';
import { AppData } from '../../app-data';

@Injectable({ providedIn: 'root' })
export class TagsService {
  private appData = inject(AppData);
  private api = this.appData.getBaseAPIURL() + '/tags.php';
  private http = inject(HttpClient);
  private opts = { withCredentials: true } as const;

  // Get all available tags
  getAll() {
    return this.http.get<Tag[]>(`${this.api}`, this.opts);
  }

  // Get tags for a specific lead
  getByLead(leadId: number) {
    return this.http.get<LeadTag[]>(`${this.api}?lead_id=${leadId}`, this.opts);
  }

  // Create a new tag
  create(name: string, color?: string) {
    return this.http.post<{ success: boolean; tag: Tag }>(`${this.api}`, { name, color }, this.opts);
  }

  // Assign a tag to a lead
  assign(leadId: number, tagId: number, percentage?: number) {
    return this.http.post<{ success: boolean; leadTag: LeadTag }>(`${this.api}?action=assign`, { lead_id: leadId, tag_id: tagId, percentage: percentage || null }, { ...this.opts, headers: { 'Content-Type': 'application/json' } });
  }

  // Remove a tag from a lead
  unassign(leadId: number, tagId: number) {
    return this.http.delete(`${this.api}?action=unassign&lead_id=${leadId}&tag_id=${tagId}`, this.opts);
  }

  // Delete a tag
  delete(id: number) {
    return this.http.delete(`${this.api}?id=${id}`, this.opts);
  }

  // Update a tag
  update(id: number, name: string, color?: string) {
    return this.http.put<{ success: boolean }>(`${this.api}?id=${id}`, { name, color }, this.opts);
  }
}
