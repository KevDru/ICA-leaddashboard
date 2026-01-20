import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppData } from '../../app-data';

export interface TagBudget {
  id: number;
  name: string;
  color?: string | null;
  budget: number;
  percentage: number;
}

export interface ColumnBudget {
  id: number;
  name: string;
  color?: string | null;
  budget: number;
  percentage: number;
  tags?: TagBudget[];
  leads?: LeadStats[];
}

export interface StatsResponse {
  totalBudget: number;
  tags: TagBudget[];
  columns: ColumnBudget[];
}

export interface LeadStats {
  id: number;
  title: string;
  customer?: string | null;
  value: number;
  tags: TagBudget[];
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private appData = inject(AppData);
  private api = this.appData.getBaseAPIURL() + '/stats.php';
  private http = inject(HttpClient);
  private opts = { withCredentials: true } as const;

  getOverview() {
    return this.http.get<StatsResponse>(this.api, this.opts);
  }
}
