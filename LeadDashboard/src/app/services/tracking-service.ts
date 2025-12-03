import { inject, Inject, Injectable, OnDestroy } from '@angular/core';
import { AppData } from './app-data';
export interface VisibilityRecord {
    element: HTMLElement;
    visibleSince: number | null;
    startTime: number | null;
}

export interface CompletedRecord {
    sessionId?: string;
    section: string | null;
    startTime: number;
    duration: number;
}

export interface SendRecordRequest {
    action: string;
    records: CompletedRecord[];
}

export interface CreateSessionRequest {
    action: 'create';
}

@Injectable({
    providedIn: 'root',
})
export class TrackingService implements OnDestroy {
    private static sessionCreated = false;
    private appDataService = inject(AppData)
    private observer: IntersectionObserver;
    private activeRecords: VisibilityRecord[] = [];
    private completedQueue: CompletedRecord[] = [];
    private isSending = false;

    private sessionId: string | null = null;
    private readonly CREATE_SESSION_URL = this.appDataService.getBaseAPIURL() + '/sessionController.php'
    private readonly CREATE_TIMERECORDS_URL = this.appDataService.getBaseAPIURL() + '/timeRecordController.php'
    // private readonly CREATE_SESSION_URL_DEV =
    //     'http://localhost/minisitejones/api/public/sessionController.php';
    // private readonly CREATE_TIMERECORDS_URL_DEV =
    //     'http://localhost/minisitejones/api/public/timeRecordController.php';

    private readonly MAX_QUEUE_SIZE = 200;
    private readonly SEND_INTERVAL_MS = 5000;

    private intervalHandle: any;

    constructor() {
        this.observer = new IntersectionObserver(
            this.handleIntersect.bind(this),
            { threshold: [0.5, 1] }
        );

        if (!TrackingService.sessionCreated) {
            TrackingService.sessionCreated = true;
            this.createSession();
        }

        // Interval: stuur steeds een stukje van de queue
        this.intervalHandle = setInterval(
            () => this.processQueue(),
            this.SEND_INTERVAL_MS
        );

        // the unload event is unreliable according to MDN docs
        // events often not get fired when expected
        // see: [MDN Docs page](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon#avoid_unload_and_beforeunload)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.sendPendingRecordsPageLeave();
            }
        });
    }

    ngOnDestroy(): void {
        this.observer.disconnect();
        clearInterval(this.intervalHandle);
        this.sendPendingRecordsPageLeave();
    }

    // --------------------------------------------------------------
    // SESSION CREATION
    // --------------------------------------------------------------
    private async createSession() {
        const req: CreateSessionRequest = { action: 'create' };
        try {
            const response = await fetch(this.CREATE_SESSION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req),
            });

            const json = await response.json();
            if (json.success && json.id) {
                this.sessionId = json.id;
                console.log('Session created:', this.sessionId);
            } else {
                console.error('Failed to create session:', json);
            }
        } catch (err) {
            console.error('Session creation error:', err);
        }
    }
    public getSessionUUID(): string | null {
        return this.sessionId
    }
    // --------------------------------------------------------------
    // START TRACKING
    // --------------------------------------------------------------
    public startTracking(attr = 'data-tr-section') {
        document.querySelectorAll(`[${attr}]`).forEach((el) => {
            const element = el as HTMLElement;

            if (this.activeRecords.find((r) => r.element === element)) return;

            this.activeRecords.push({
                element,
                visibleSince: null,
                startTime: null,
            });

            this.observer.observe(element);
        });
    }

    // --------------------------------------------------------------
    // INTERSECTION HANDLER
    // --------------------------------------------------------------
    private handleIntersect(entries: IntersectionObserverEntry[]) {
        const now = performance.now(); // stopwatch time

        entries.forEach((entry) => {
            const record = this.activeRecords.find(
                (r) => r.element === entry.target
            );
            if (!record) return;

            if (entry.isIntersecting) {
                if (record.visibleSince === null) {
                    record.visibleSince = now; // start stopwatch
                    record.startTime = Math.floor(Date.now() / 1000); // unixtime in seconds (realworld timestamp)
                }
            } else {
                if (record.visibleSince !== null && record.startTime !== null) {
                    const duration = now - record.visibleSince; //stopwatch reading in MS
                    const durationSeconds = Math.floor(duration / 1000); // Convert to seconds

                    if (duration > 100) {
                        this.queueCompletedRecord(
                            record.element,
                            record.startTime,
                            durationSeconds // Store in seconds to match startTime
                        );
                    }

                    record.visibleSince = null;
                    record.startTime = null;
                }
            }
        });
    }

    // --------------------------------------------------------------
    // QUEUE CREATION
    // --------------------------------------------------------------
    private queueCompletedRecord(
        element: HTMLElement,
        start: number,
        duration: number
    ) {
        if (!this.sessionId) return;

        const completed: CompletedRecord = {
            sessionId: this.sessionId,
            section: element.getAttribute('data-tr-section'),
            startTime: start,
            duration,
        };

        if (this.completedQueue.length >= this.MAX_QUEUE_SIZE) {
            this.completedQueue.shift();
        }

        this.completedQueue.push(completed);
    }

    // --------------------------------------------------------------
    // SEND QUEUE
    // --------------------------------------------------------------
    private async processQueue() {
        if (this.isSending || this.completedQueue.length === 0) return;
        if (!this.sessionId) return;

        this.isSending = true;

        // verzend maximaal 10 records per batch
        const batch = this.completedQueue.splice(0, 10);

        const req: SendRecordRequest = {
            action: 'create',
            records: batch,
        };

        try {
            const ok = await this.sendRequest(req, this.CREATE_TIMERECORDS_URL);

            if (!ok) {
                // mislukt → push batch terug
                this.completedQueue.unshift(...batch);
            }
        } catch (err) {
            console.error('Send failed:', err);
            this.completedQueue.unshift(...batch);
        }

        this.isSending = false;
    }

    private async sendRequest(data: SendRecordRequest, endpoint: string) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const json = await response.json();
            return json.success === true;
        } catch {
            return false;
        }
    }

    // --------------------------------------------------------------
    // BEFORE UNLOAD -> SEND ALL
    // --------------------------------------------------------------
    private sendPendingRecordsPageLeave() {
        if (!this.sessionId || this.completedQueue.length === 0) return;

        const req: SendRecordRequest = {
            action: 'create',
            records: this.completedQueue,
        };

        const blob = new Blob([JSON.stringify(req)], {
            type: 'application/json',
        });
        // sendBeacon sends a (small, < 64 kb) request to the server.
        // Intended to send telementry to the webserver,
        navigator.sendBeacon(this.CREATE_TIMERECORDS_URL, blob);
    }
}
