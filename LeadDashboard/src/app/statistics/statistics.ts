import {
    Component,
    ElementRef,
    inject,
    ViewChild,
    viewChild,
} from '@angular/core';
import { StatisticsService } from '../services/statistics-service';
import { OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

Chart.register(...registerables);

interface TimeRecord {
    startedAt: number;
    duration: number;
    sectionName: string;
}

interface Session {
    sessionIndex: number;
    sessionCreatedAt: string;
    timeRecords: TimeRecord[];
}

interface SectionStats {
    name: string;
    totalDuration: number;
    viewCount: number;
    avgDuration: number;
}

interface InfoRequest {
    irIndex: number;
    irCreatedAt: string;
    namePrefix: string;
    lastName: string;
    streetName: string;
    houseNumber: string;
    postalCode: string;
    placeName: string;
    countryName: string;
    sessionIndex: number;
    interestedHouselabel: string;
    statusName: string;
}

@Component({
    selector: 'app-statistics',
    imports: [ReactiveFormsModule],
    templateUrl: './statistics.html',
    styleUrl: './statistics.scss',
})
export class Statistics implements OnInit {
    private statsService = inject(StatisticsService);

    // Access
    protected isSignedIn: boolean = false;
    protected signInFormGroup: FormGroup = new FormGroup({
        accessKey: new FormControl('', [
            Validators.required,
            Validators.minLength(10),
        ]),
    });

    @ViewChild('loginFeedback')
    signInFeedbackEl!: ElementRef<HTMLParagraphElement>;

    private summary: any;
    // private sessions: any
    sessions: Session[] = [];
    sectionStats: Map<string, SectionStats> = new Map();

    protected infoRequests: InfoRequest[] = [];

    // Metrics
    totalSessions = 0;
    avgSessionDuration = 0;
    totalSectionViews = 0;
    mostPopularSection = '-';
    sortedSections: SectionStats[] = [];
    maxTotalDuration = 0;

    constructor() {}
    async ngOnInit() {}

    protected async signIn() {
        const submittedData = this.signInFormGroup.value.accessKey;
        const response = await this.statsService.getSummary(submittedData);
        console.log('Sign in response:', response);
        if (response.success) {
            this.isSignedIn = true;
            this.summary = response.summary;
            const data = JSON.parse(this.summary.JSONContents);
            this.sessions = data.sessions;
            this.infoRequests = data.infoRequests;
            // console.log("Summary: ",this.summary)
            // console.log("Sessions: ", this.sessions)
            console.log('Info requests: ', this.infoRequests);
            this.processData();
            this.renderCharts();
        } else {
            this.signInFeedbackEl.nativeElement.innerText =
                'Could not sign you in. ' + response.msg;
        }
    }

    processData() {
        this.totalSessions = this.sessions.length;
        let totalDuration = 0;
        this.totalSectionViews = 0;

        // Process each session
        this.sessions.forEach((session) => {
            let sessionDuration = 0;

            // Walk trough each time record
            session.timeRecords.forEach((record) => {
                sessionDuration += record.duration;
                this.totalSectionViews++;

                // Totalize section stats
                const existing = this.sectionStats.get(record.sectionName);
                if (existing) {
                    existing.totalDuration += record.duration;
                    existing.viewCount++;
                    existing.avgDuration = Math.round(
                        existing.totalDuration / existing.viewCount
                    );
                } else {
                    this.sectionStats.set(record.sectionName, {
                        name: record.sectionName,
                        totalDuration: record.duration,
                        viewCount: 1,
                        avgDuration: record.duration,
                    });
                }
            });

            totalDuration += sessionDuration;
        });

        // Ternary operation. Calculates average visit duration (duration counted of all sessions / session amount)
        // Only if there are more than 0 sessions (to avoid division by 0)
        this.avgSessionDuration =
            this.totalSessions > 0
                ? Math.round(totalDuration / this.totalSessions)
                : 0;

        // Sort sections and find most popular
        this.sortedSections = Array.from(this.sectionStats.values()).sort(
            (a, b) => b.totalDuration - a.totalDuration
        );

        this.maxTotalDuration = this.sortedSections[0]?.totalDuration || 1;
        this.mostPopularSection = this.formatSectionName(
            this.sortedSections[0]?.name || '-'
        );
    }

    renderCharts() {
        setTimeout(() => {
            this.renderSectionPopularityChart();
            this.renderViewCountChart();
            this.renderAvgDurationChart();
            this.renderSessionDurationChart();
        }, 100);
    }

    renderSectionPopularityChart() {
        const ctx = document.getElementById(
            'sectionPopularityChart'
        ) as HTMLCanvasElement;
        if (!ctx) return;

        const top10 = this.sortedSections.slice(0, 10);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: top10.map((s) => this.formatSectionName(s.name)),
                datasets: [
                    {
                        data: top10.map((s) => s.totalDuration),
                        backgroundColor: [
                            '#3b82f6',
                            '#8b5cf6',
                            '#ec4899',
                            '#f59e0b',
                            '#10b981',
                            '#06b6d4',
                            '#6366f1',
                            '#f97316',
                            '#14b8a6',
                            '#a855f7',
                        ],
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 12, font: { size: 11 } },
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.parsed}s`;
                            },
                        },
                    },
                },
            },
        });
    }

    renderViewCountChart() {
        const ctx = document.getElementById(
            'viewCountChart'
        ) as HTMLCanvasElement;
        if (!ctx) return;

        const top10 = this.sortedSections.slice(0, 10);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top10.map((s) => this.formatSectionName(s.name)),
                datasets: [
                    {
                        label: 'View Count',
                        data: top10.map((s) => s.viewCount),
                        backgroundColor: '#3b82f6',
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                },
            },
        });
    }

    renderAvgDurationChart() {
        const ctx = document.getElementById(
            'avgDurationChart'
        ) as HTMLCanvasElement;
        if (!ctx) return;

        const sorted = [...this.sortedSections].sort(
            (a, b) => b.avgDuration - a.avgDuration
        );

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sorted.map((s) => this.formatSectionName(s.name)),
                datasets: [
                    {
                        label: 'Avg Duration (s)',
                        data: sorted.map((s) => s.avgDuration),
                        backgroundColor: '#8b5cf6',
                    },
                ],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    x: { beginAtZero: true },
                },
            },
        });
    }

    renderSessionDurationChart() {
        const ctx = document.getElementById(
            'sessionDurationChart'
        ) as HTMLCanvasElement;
        if (!ctx) return;

        const sessionDurations = this.sessions.map((session, idx) => {
            const total = session.timeRecords.reduce(
                (sum, r) => sum + r.duration,
                0
            );
            return { session: idx + 1, duration: total };
        });

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: sessionDurations.map((s) => `Session ${s.session}`),
                datasets: [
                    {
                        label: 'Duration (s)',
                        data: sessionDurations.map((s) => s.duration),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: { beginAtZero: true },
                },
            },
        });
    }

    formatSectionName(name: string): string {
        // Convert camelCase/PascalCase to readable format
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }

    getPopularityPercentage(duration: number): number {
        return (duration / this.maxTotalDuration) * 100;
    }
}
