import { Component, signal } from '@angular/core';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board';
// import other components here if needed

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [KanbanBoardComponent],
  template: `
      <app-kanban-board></app-kanban-board>
  `,
})
export class AppComponent {
  isLoggedIn = signal(true);
}
