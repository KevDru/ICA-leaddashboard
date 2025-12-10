import { Component, OnInit, signal, inject } from '@angular/core';
import { ColumnsService } from '../../services/columns.services';
import { LeadsService } from '../../services/leads.services';
import { Column } from '../../models/column';
import { Lead } from '../../models/lead';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { KanbanColumnComponent } from '../kanban-column/kanban-column';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, KanbanColumnComponent, FormsModule, HttpClientModule],
  templateUrl: './kanban-board.html',
  styleUrls: ['./kanban-board.scss'],
})
export class KanbanBoardComponent implements OnInit {
  columns = signal<Column[]>([]);
  leadsMap = signal<Map<number, Lead[]>>(new Map());
  newColumnName = signal('');

  private columnsService = inject(ColumnsService);
  private leadsService = inject(LeadsService);

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns() {
    this.columnsService.getAll().subscribe((cols: Column[]) => {
      this.columns.set(cols);
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
    } else {
      const lead = event.previousContainer.data[event.previousIndex];
      this.leadsService.move(lead.id, columnId).subscribe(() => {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      });
    }
  }

  createColumn() {
    const name = this.newColumnName().trim();
    if (!name) return;

    this.columnsService.create(name).subscribe(() => {
      this.newColumnName.set('');
      this.loadColumns();
    });
  }

  deleteColumn(id: number) {
    if (!confirm('Are you sure you want to delete this column?')) return;
    this.columnsService.delete(id).subscribe({
      next: () => this.loadColumns(),
      error: (err) => alert(err.error?.error || 'Failed to delete column'),
    });
  }
}
