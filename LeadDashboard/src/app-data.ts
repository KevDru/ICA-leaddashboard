import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppData {
  private readonly DEV_MODE: boolean = false
  private readonly BASE_API_URL: string = 'http://leads.imaginecreativeagency.nl/api'
  private readonly BASE_API_DEV_URL: string = 'http://leads.imaginecreativeagency.nl/api'
    getBaseAPIURL() {
    if(this.DEV_MODE) {
      return this.BASE_API_DEV_URL
    }
    return this.BASE_API_URL
  }
}
