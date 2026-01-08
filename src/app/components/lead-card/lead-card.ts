import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LeadDetailComponent } from '../lead-detail/lead-detail';
import { LeadsService } from '../../services/leads.services';
import { Lead } from '../../models/lead';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-lead-card',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './lead-card.html',
  styleUrls: ['./lead-card.scss']
})
export class LeadCardComponent {
  @Input() lead!: Lead;
  @Output() deleteLeadEvent = new EventEmitter<number>();
  @Output() refreshLeadEvent = new EventEmitter<void>();

  private dialog = inject(MatDialog);
  private leadsService = inject(LeadsService);

  getDaysSinceUpdate(): number {
    if (!this.lead.updated_at) return 0;
    const updateDate = new Date(this.lead.updated_at);
    const today = new Date();
    const diffMs = today.getTime() - updateDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
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
      if (updated) this.refreshLeadEvent.emit(); // Trigger parent refresh when details change
    });
  }

  deleteLead() {
    if (!confirm('Weet je zeker dat je deze lead wilt verwijderen?')) return;
    
    this.leadsService.delete(this.lead.id).subscribe(() => {
      this.refreshLeadEvent.emit(); // Trigger parent refresh after delete
    });
  }
}
