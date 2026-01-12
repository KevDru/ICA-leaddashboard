import { Routes } from '@angular/router';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board';
import { LeadDetailComponent } from './components/lead-detail/lead-detail';
import { LoginComponent } from './components/login/login';
import { StatsComponent } from './components/stats/stats';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: KanbanBoardComponent, pathMatch: 'full', canActivate: [authGuard] },
  { path: 'stats', component: StatsComponent, canActivate: [authGuard] },
  { path: 'lead/:id', component: LeadDetailComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
