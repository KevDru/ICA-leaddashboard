import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, TagBudget, ColumnBudget } from '../../services/stats.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.html',
  styleUrls: ['./stats.scss']
})
export class StatsComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  totalBudget = signal<number>(0);
  tags = signal<TagBudget[]>([]);
  columns = signal<ColumnBudget[]>([]);

  private statsService = inject(StatsService);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.statsService.getOverview().subscribe({
      next: (data) => {
        const ordered = [...data.tags].sort((a, b) => b.budget - a.budget);
        this.tags.set(ordered);
        this.totalBudget.set(data.totalBudget || 0);
        const colOrdered = [...data.columns].sort((a, b) => b.budget - a.budget);
        this.columns.set(colOrdered);
      },
      error: (err) => {
        const msg = err?.error?.error || 'Kon statistieken niet laden';
        this.error.set(msg);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  trackByTagId(_: number, tag: TagBudget) {
    return tag.id;
  }

  trackByColumnId(_: number, col: ColumnBudget) {
    return col.id;
  }

  hasData() {
    return this.tags().length > 0;
  }

  hasColumnData() {
    return this.columns().length > 0;
  }
}
