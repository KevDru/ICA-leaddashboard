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
      this.columns.set(cols);
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

  reloadLeads() {
    this.columns().forEach(col => this.loadLeads(col.id));
  }

  promptCreateColumn() {
    const dialogRef = this.dialog.open(ColumnModalComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe((columnName: string | null) => {
      if (columnName) {
        this.columnsService.create(columnName).subscribe(() => {
          this.loadColumns();
        });
      }
    });
  }
} 
