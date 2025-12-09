import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lead } from '../models/lead';

@Injectable({ providedIn: 'root' })
export class LeadsService {
  private api = 'http://localhost/ICA-leaddashboard/LeadDashboard/src/API/leads.php';
  private http = inject(HttpClient);

  getByColumn(columnId: number) {
    return this.http.get<Lead[]>(`${this.api}?column_id=${columnId}`);
  }

  getById(id: number) {
    return this.http.get<Lead>(`${this.api}?id=${id}`);
  }

  create(lead: Partial<Lead>) {
    return this.http.post(this.api, lead);
  }

  move(id: number, column_id: number) {
    return this.http.put(`${this.api}/move?id=${id}`, { column_id });
  }

  update(id: number, data: Partial<Lead>) {
    return this.http.put(`${this.api}?id=${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}?id=${id}`);
  }
}
