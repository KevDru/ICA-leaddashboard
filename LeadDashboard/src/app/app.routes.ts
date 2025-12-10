  import { Routes } from '@angular/router';
  import { KanbanBoardComponent } from './components/kanban-board/kanban-board';
  import { LeadDetailComponent } from './components/lead-detail/lead-detail';

  export const routes: Routes = [
    { path: '', component: KanbanBoardComponent },
    { path: 'lead/:id', component: LeadDetailComponent }, // <- Add this
  ];
