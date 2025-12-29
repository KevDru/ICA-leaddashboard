import { Routes } from '@angular/router';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board';
import { LeadDetailComponent } from './components/lead-detail/lead-detail';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: KanbanBoardComponent, pathMatch: 'full', canActivate: [authGuard] },
  { path: 'lead/:id', component: LeadDetailComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
