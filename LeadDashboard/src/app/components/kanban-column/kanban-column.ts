import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Column } from '../../models/column';
import { Lead } from '../../models/lead';
import { CommonModule } from '@angular/common';
import { LeadCardComponent } from '../lead-card/lead-card';
import { CdkDropList, DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CommonModule, LeadCardComponent, DragDropModule],
  templateUrl: './kanban-column.html',
  styleUrls: ['./kanban-column.scss']
})
export class KanbanColumnComponent {
  @Input() column!: Column;
  @Input() leads: Lead[] = [];
  @Output() dropEvent = new EventEmitter<CdkDragDrop<Lead[]>>();
}
