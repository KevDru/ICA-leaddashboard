import { inject, Injectable } from '@angular/core';
import { AppData } from './app-data';
@Injectable({
    providedIn: 'root',
})
export class StatisticsService {
    private appDataService = inject(AppData);

    // private appDataService = inject(AppData)
    async getSummary(accessCode: string, pageNum: string = '1') {
        try {
            const response = await fetch(
                this.appDataService.getBaseAPIURL() + '/statsController.php',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        accessCode: accessCode,
                        pageNum: pageNum,
                        action: 'get',
                    }),
                }
            );

            if (!response.ok) {
              console.error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json();

            return data
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
            throw error;
        }
    }
}
