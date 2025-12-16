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

  openDetailModal() {
    const dialogRef = this.dialog.open(LeadDetailComponent, {
      width: '600px',
      data: { id: this.lead.id }
    });

    dialogRef.afterClosed().subscribe(updated => {
      if (updated) this.refreshLeadEvent.emit(); // notify parent to refresh list
    });
  }

  deleteLead() {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    this.leadsService.delete(this.lead.id).subscribe(() => {
      this.refreshLeadEvent.emit(); // notify parent to refresh list
    });
  }
}
