import { Component, OnInit, signal, inject } from '@angular/core';
import { ColumnsService } from '../../services/columns.services';
import { LeadsService } from '../../services/leads.services';
import { Column } from '../../models/column';
import { Lead } from '../../models/lead';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { KanbanColumnComponent } from '../kanban-column/kanban-column';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ColumnModalComponent } from '../column-modal/column-modal';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, KanbanColumnComponent, DragDropModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './kanban-board.html',
  styleUrls: ['./kanban-board.scss'],
})
export class KanbanBoardComponent implements OnInit {
  columns = signal<Column[]>([]);
  leadsMap = signal<Map<number, Lead[]>>(new Map());
  connectedDropLists = signal<string[]>([]);

  private columnsService = inject(ColumnsService);
  private leadsService = inject(LeadsService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns() {
    this.columnsService.getAll().subscribe((cols: Column[]) => {
      const ordered = [...cols].sort((a, b) => a.position - b.position);
      this.columns.set(ordered);
      this.connectedDropLists.set(ordered.map(col => `drop-list-${col.id}`));
      ordered.forEach((col: Column) => this.loadLeads(col.id));
    });
  }

  loadLeads(columnId: number) {
    this.leadsService.getByColumn(columnId).subscribe((leads: Lead[]) => {
      const map = new Map(this.leadsMap());
      map.set(columnId, leads);
      this.leadsMap.set(map);
    });
  }

  drop(event: CdkDragDrop<Lead[]>, columnId: number) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const lead = (event.item && (event.item.data as Lead)) || event.container.data[event.currentIndex];
    const leadId = lead?.id;

    if (!leadId) {
      this.reloadLeads();
      return;
    }

    this.leadsService.move(leadId, columnId).subscribe({
      next: () => this.reloadLeads(),
      error: () => {
        transferArrayItem(
          event.container.data,
          event.previousContainer.data,
          event.currentIndex,
          event.previousIndex
        );
        alert('Failed to move lead');
      }
    });
    return;
  }

  moveColumn(column: Column, direction: 'left' | 'right') {
    const current = this.columns();
    const fromIndex = current.findIndex(c => c.id === column.id);
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;

    if (fromIndex === -1 || toIndex < 0 || toIndex >= current.length) return;

    const reordered = [...current];
    moveItemInArray(reordered, fromIndex, toIndex);

    this.persistColumnOrder(reordered);
  }

  private persistColumnOrder(reordered: Column[]) {
    const previous = [...this.columns()];
    const withPositions = reordered.map((col, idx) => ({ ...col, position: idx + 1 }));

    this.columns.set(withPositions);
    this.connectedDropLists.set(withPositions.map(col => `drop-list-${col.id}`));

    const requests = withPositions.map(col =>
      this.columnsService.update(col.id, { name: col.name, position: col.position, color: col.color })
    );

    forkJoin(requests).subscribe({
      error: () => {
        this.columns.set(previous);
        this.connectedDropLists.set(previous.map(col => `drop-list-${col.id}`));
        alert('Failed to reorder columns');
      }
    });
  }

  reloadLeads() {
    this.columns().forEach(col => this.loadLeads(col.id));
  }

  promptCreateColumn() {
    const dialogRef = this.dialog.open(ColumnModalComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe((columnData: { name: string; color?: string } | null) => {
      if (columnData) {
        this.columnsService.create(columnData).subscribe(() => {
          this.loadColumns();
        });
      }
    });
  }
} 
