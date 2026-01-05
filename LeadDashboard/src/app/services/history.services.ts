import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeadHistory } from '../models/history';
import { AppData } from '../../app-data';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private appData = inject(AppData);
  private api = this.appData.getBaseAPIURL() + '/history.php';
  private http = inject(HttpClient);
  private opts = { withCredentials: true } as const;

  get(leadId: number) {
    return this.http.get<LeadHistory[]>(`${this.api}?lead_id=${leadId}`, this.opts);
  }
}
