import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppData {
  // Production API base (unchanged)
  private readonly BASE_API_URL = 'https://leads.imaginecreativeagency.nl/api';

  // Return a relative path when running on localhost so the dev server proxy
  // (start:proxy) can forward requests to the real backend and avoid CORS.
  // This keeps production behavior identical and only affects local development.
  getBaseAPIURL() {
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocal = host === 'localhost' || host === '127.0.0.1';
      if (isLocal) return '/api';
    } catch (e) {
      // If anything unexpected happens, fall back to production URL
    }
    return this.BASE_API_URL;
  }
}
