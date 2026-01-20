import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Column } from '../models/column';
import { AppData } from '../../app-data';

@Injectable({ providedIn: 'root' })
export class ColumnsService {
  private appData = inject(AppData);
  private api = this.appData.getBaseAPIURL() + '/lead_columns';
  private http = inject(HttpClient);
  private opts = { withCredentials: true } as const;

  getAll() { return this.http.get<Column[]>(this.api, this.opts); }
  create(data: { name: string; color?: string }) {
    return this.http.post(this.api, data, this.opts);
  }
  update(id: number, data: Partial<Column>) {
    return this.http.put(`${this.api}?id=${id}`, data, this.opts);
  }
  delete(id: number) { return this.http.delete(`${this.api}?id=${id}`, this.opts); }
}
