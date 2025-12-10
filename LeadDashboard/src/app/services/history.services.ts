import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeadHistory } from '../models/history';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private api = 'http://localhost/ICA-leaddashboard/LeadDashboard/src/API/history.php';
  private http = inject(HttpClient);

  get(leadId: number) {
    return this.http.get<LeadHistory[]>(`${this.api}?lead_id=${leadId}`);
  }
}
