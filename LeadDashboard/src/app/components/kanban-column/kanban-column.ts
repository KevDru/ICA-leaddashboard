import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Column } from '../../models/column';
import { Lead } from '../../models/lead';
import { LeadsService } from '../../services/leads.services';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { LeadCardComponent } from '../lead-card/lead-card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, LeadCardComponent, FormsModule],
  templateUrl: './kanban-column.html',
  styleUrls: ['./kanban-column.scss'],
})
export class KanbanColumnComponent {
  @Input() column!: Column;
  @Input() leads: Lead[] = [];
  @Input() connectedDropListsIds: string[] = [];
  @Output() dropEvent = new EventEmitter<CdkDragDrop<Lead[]>>();
  @Output() deleteColumnEvent = new EventEmitter<number>();

  private leadsService = inject(LeadsService);

  newLeadTitle: string = '';

  createLead() {
    const title = this.newLeadTitle.trim();
    if (!title) return;

    this.leadsService.create({ title, column_id: this.column.id }).subscribe((res: any) => {
      this.leads.unshift({ id: res.id, title, customer: '', description: '', column_id: this.column.id });
      this.newLeadTitle = '';
    });
  }

  deleteLead(leadId: number) {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    this.leadsService.delete(leadId).subscribe(() => {
      this.leads = this.leads.filter(l => l.id !== leadId);
    });
  }

  deleteColumn() {
    this.deleteColumnEvent.emit(this.column.id);
  }
}
