import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppData } from '../../app-data';
import { Tag } from '../models/tag';

@Injectable({ providedIn: 'root' })
export class TagsService {
  private appData = inject(AppData);
  private api = this.appData.getBaseAPIURL() + '/tags.php';
  private http = inject(HttpClient);
  private opts = { withCredentials: true } as const;

  getAll() {
    return this.http.get<Tag[]>(this.api, this.opts);
  }

  create(tag: Partial<Tag>) {
    return this.http.post<Tag>(this.api, tag, this.opts);
  }

  update(id: number, tag: Partial<Tag>) {
    return this.http.put<Tag>(`${this.api}?id=${id}`, tag, this.opts);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}?id=${id}`, this.opts);
  }
}
