import { Component, Input, inject } from '@angular/core';
import { Lead } from '../../models/lead';
import { Router } from '@angular/router';
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
  private router = inject(Router);

  goToDetail() {
    this.router.navigate(['/lead', this.lead.id]);
  }
}
