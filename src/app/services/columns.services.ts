import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Column } from '../models/column';

@Injectable({ providedIn: 'root' })
export class ColumnsService {
  private api = 'http://localhost/ICA-leaddashboard/ICA-leaddashboard/LeadDashboard/src/API/lead_columns.php';
  private http = inject(HttpClient);

  getAll() { return this.http.get<Column[]>(this.api); }
  create(name: string) { return this.http.post(this.api, { name }); }
  update(id: number, data: Partial<Column>) { return this.http.put(`${this.api}?id=${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.api}?id=${id}`); }
}
