import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Column } from '../../models/column';
import { Lead } from '../../models/lead';
import { CommonModule } from '@angular/common';
import { LeadCardComponent } from '../lead-card/lead-card';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { LeadModalComponent } from '../lead-modal/lead-modal';
import { ColumnsService } from '../../services/columns.services';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CommonModule, LeadCardComponent, DragDropModule],
  templateUrl: './kanban-column.html',
  styleUrls: ['./kanban-column.scss']
})
export class KanbanColumnComponent implements OnChanges {
  @Input() column!: Column;
  @Input() leads: Lead[] = [];
  @Input() connectedDropLists: string[] = [];
  @Output() dropEvent = new EventEmitter<CdkDragDrop<Lead[]>>();
  @Output() reloadEvent = new EventEmitter<void>();

  leadsSignal = signal<Lead[]>([]);
  private dialog = inject(MatDialog);
  private columnsService = inject(ColumnsService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['leads']) {
      this.leadsSignal.set([...this.leads]);
    }
  }

  onRefreshLeads() {
    this.reloadEvent.emit();
  }

  openCreateLeadModal() {
    const dialogRef = this.dialog.open(LeadModalComponent, {
      width: '500px',
      data: { columnId: this.column.id }
    });

    dialogRef.afterClosed().subscribe(created => {
      if (created) this.reloadEvent.emit();
    });
  }

  deleteColumn() {
    if (!confirm(`Delete column "${this.column.name}"? This cannot be undone.`)) return;

    this.columnsService.delete(this.column.id).subscribe({
      next: () => this.reloadEvent.emit(),
      error: (err) => alert(err.error?.error || 'Failed to delete column')
    });
  }
}

