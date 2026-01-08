import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Column } from '../../models/column';
import { Lead } from '../../models/lead';
import { CommonModule } from '@angular/common';
import { LeadCardComponent } from '../lead-card/lead-card';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { LeadModalComponent } from '../lead-modal/lead-modal';
import { ColumnModalComponent } from '../column-modal/column-modal';
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
  @Output() moveColumnEvent = new EventEmitter<'left' | 'right'>();

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

  moveLeft() {
    this.moveColumnEvent.emit('left');
  }

  moveRight() {
    this.moveColumnEvent.emit('right');
  }

  openCreateLeadModal() {
    const dialogRef = this.dialog.open(LeadModalComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { columnId: this.column.id }
    });

    dialogRef.afterClosed().subscribe(created => {
      if (created) this.reloadEvent.emit();
    });
  }

  deleteColumn() {
    if (!confirm(`Kolom "${this.column.name}" verwijderen? Dit kan niet ongedaan gemaakt worden.`)) return;

    
    this.columnsService.delete(this.column.id).subscribe({
      next: () => this.reloadEvent.emit(),
      error: (err) => alert(err.error?.error || 'Failed to delete column')
    });
  }

  editColumn() {
    const dialogRef = this.dialog.open(ColumnModalComponent, {
      width: '450px',
      data: { isEdit: true, column: this.column }
    });

    dialogRef.afterClosed().subscribe((columnData: { name: string; color?: string } | null) => {
      if (columnData) {
        this.columnsService.update(this.column.id, { name: columnData.name, color: columnData.color, position: this.column.position }).subscribe({
          next: () => this.reloadEvent.emit(),
          error: (err) => alert(err.error?.error || 'Failed to update column')
        });
      }
    });
  }
}

