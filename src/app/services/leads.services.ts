import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lead } from '../models/lead';
import { AppData } from '../../app-data';

@Injectable({ providedIn: 'root' })
export class LeadsService {
  private appData = inject(AppData);
  private api = this.appData.getBaseAPIURL() + '/leads.php';
  private http = inject(HttpClient);
  private opts = { withCredentials: true } as const;

  getByColumn(columnId: number) {
    // Use cid to avoid WAF false positive on "column_id" in the URL
    return this.http.get<Lead[]>(`${this.api}?cid=${columnId}`, this.opts);
  }

  getById(id: number) {
    return this.http.get<Lead>(`${this.api}?id=${id}`, this.opts);
  }

  create(lead: Partial<Lead>) {
    return this.http.post(this.api, lead, this.opts);
  }

  move(id: number, column_id: number) {
    return this.http.put(`${this.api}/move?id=${id}`, { column_id }, this.opts);
  }

  update(id: number, data: Partial<Lead>) {
    return this.http.put(`${this.api}?id=${id}`, data, this.opts);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}?id=${id}`, this.opts);
  }
}
