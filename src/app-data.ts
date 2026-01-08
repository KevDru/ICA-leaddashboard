import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppData {
  // Production API endpoint
  private readonly BASE_API_URL = 'https://leads.imaginecreativeagency.nl/api';

  // Use dev proxy locally to avoid CORS while keeping prod behavior unchanged
  getBaseAPIURL() {
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocal = host === 'localhost' || host === '127.0.0.1';
      if (isLocal) return '/api';
    } catch (e) {
      // On any error, fall back to the production URL
    }
    return this.BASE_API_URL;
  }
}
