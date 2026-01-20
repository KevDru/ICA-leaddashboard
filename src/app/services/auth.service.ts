import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppData } from '../../app-data';

type User = { id: number; email: string; name?: string | null };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private appData = inject(AppData);
  private http = inject(HttpClient);
  private router = inject(Router);

  user = signal<User | null>(null);
  ready = signal(false);
  private bootstrapped = false;
  private bootstrapPromise: Promise<void> | null = null;

  private base = this.appData.getBaseAPIURL();
  private opts = { withCredentials: true } as const;

  bootstrap(): Promise<void> {
    if (this.bootstrapPromise) return this.bootstrapPromise;
    if (this.bootstrapped) return Promise.resolve();

    this.bootstrapPromise = new Promise((resolve) => {
      this.http.get<{ authenticated: boolean; user?: User }>(`${this.base}/me`, this.opts)
        .subscribe({
          next: res => {
            this.user.set(res.authenticated ? (res.user ?? null) : null);
            this.ready.set(true);
            this.bootstrapped = true;
            resolve();
          },
          error: _ => { 
            this.user.set(null); 
            this.ready.set(true); 
            this.bootstrapped = true;
            resolve();
          }
        });
    });

    return this.bootstrapPromise;
  }

  isAuthenticated() { return !!this.user(); }

  login(email: string, password: string) {
    return this.http.post<{ success: boolean; user: User }>(`${this.base}/login`, { email, password }, this.opts);
  }

  logout() {
    return this.http.post<{ success: boolean }>(`${this.base}/logout`, {}, this.opts);
  }
}
