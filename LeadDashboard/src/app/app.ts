import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.auth.bootstrap();
  }

  onLogout() {
    this.auth.logout().subscribe(() => {
      this.auth.user.set(null);
      this.router.navigateByUrl('/login');
    });
  }
}
