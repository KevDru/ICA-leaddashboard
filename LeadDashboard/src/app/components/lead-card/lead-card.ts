import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LeadDetailComponent } from '../lead-detail/lead-detail';
import { Lead } from '../../models/lead';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lead-card',
  standalone: true,
  imports: [],
  templateUrl: './lead-card.html',
  styleUrls: ['./lead-card.scss']
})
export class LeadCardComponent {
  @Input() lead!: Lead;
  @Output() deleteLeadEvent = new EventEmitter<number>();

  private dialog = inject(MatDialog); // ✅ FIX
  private router = inject(Router);

  openDetailModal() {
    this.dialog.open(LeadDetailComponent, {
      width: '600px',
      data: { id: this.lead.id }
    });
  }

  deleteLead() {
    this.deleteLeadEvent.emit(this.lead.id);
  }
}
