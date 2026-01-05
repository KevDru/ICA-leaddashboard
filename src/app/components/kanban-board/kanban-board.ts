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
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
  newColumnName = signal('');

  private columnsService = inject(ColumnsService);
  private leadsService = inject(LeadsService);

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns() {
    this.columnsService.getAll().subscribe((cols: Column[]) => {
      this.columns.set(cols);
      // build drop-list ids so lists can be connected for cross-column dragging
      this.connectedDropLists.set(cols.map(col => `drop-list-${col.id}`));
      cols.forEach((col: Column) => this.loadLeads(col.id));
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

    // Optimistically update UI
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    // determine lead id (prefer item.data if provided)
    const lead = (event.item && (event.item.data as Lead)) || event.container.data[event.currentIndex];
    const leadId = lead?.id;

    if (!leadId) {
      // fallback: reload lists to restore correct state
      this.reloadLeads();
      return;
    }

    this.leadsService.move(leadId, columnId).subscribe({
      next: () => this.reloadLeads(),
      error: () => {
        // revert optimistic transfer
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

  reloadLeads() {
    this.columns().forEach(col => this.loadLeads(col.id));
  }

  createColumn() {
    const name = this.newColumnName().trim();
    if (!name) return;

    this.columnsService.create(name).subscribe((res: any) => {
      this.newColumnName.set('');
      this.loadColumns();
    });
  }
} 
