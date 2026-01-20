import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LeadDetailComponent } from '../lead-detail/lead-detail';
import { LeadsService } from '../../services/leads.services';
import { TagsService } from '../../services/tags.service';
import { Lead } from '../../models/lead';
import { Tag } from '../../models/tag';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-lead-card',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './lead-card.html',
  styleUrls: ['./lead-card.scss']
})
export class LeadCardComponent implements OnInit {
  @Input() lead!: Lead;
  @Output() deleteLeadEvent = new EventEmitter<number>();
  @Output() refreshLeadEvent = new EventEmitter<void>();

  tags = signal<Tag[]>([]);

  private dialog = inject(MatDialog);
  private leadsService = inject(LeadsService);
  private tagsService = inject(TagsService);

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.tagsService.getByLead(this.lead.id).subscribe(leadTags => {
      const tags = leadTags.map(lt => ({
        id: lt.id,
        name: lt.name,
        color: lt.color
      } as Tag));
      this.tags.set(tags);
    });
  }

  getDaysSinceUpdate(): number {
    const timestamps: (string | undefined)[] = [
      this.lead.last_history_at,
      this.lead.updated_at,
      this.lead.created_at
    ];

    const mostRecent = timestamps
      .filter((ts): ts is string => Boolean(ts))
      .map(ts => new Date(ts).getTime())
      .sort((a, b) => b - a)[0];

    if (!mostRecent || Number.isNaN(mostRecent)) return 0;

    const diffMs = Date.now() - mostRecent;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  openDetailModal() {
    const dialogRef = this.dialog.open(LeadDetailComponent, {
      width: '1200px',
      height: '90vh',
      maxWidth: '98vw',
      maxHeight: '95vh',
      data: { id: this.lead.id }
    });

    dialogRef.afterClosed().subscribe(updated => {
      if (updated) {
        this.loadTags(); // Reload tags when details are updated
        this.refreshLeadEvent.emit(); // Trigger parent refresh when details change
      }
    });
  }

  deleteLead() {
    if (!confirm('Weet je zeker dat je deze lead wilt verwijderen?')) return;
    
    this.leadsService.delete(this.lead.id).subscribe(() => {
      this.refreshLeadEvent.emit(); // Trigger parent refresh after delete
    });
  }
}
