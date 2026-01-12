import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app-header.html',
  styleUrls: ['./app-header.scss']
})
export class AppHeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Ensure auth state is initialized when the header renders
    this.auth.bootstrap();
  }

  onLogout() {
    this.auth.logout().subscribe(() => {
      this.auth.user.set(null);
      this.router.navigateByUrl('/login');
    });
  }

  get userDisplayName(): string {
    const u = this.auth.user();
    if (!u) return '';
    return (u.name && u.name.trim()) ? (u.name as string) : u.email;
  }

  get userInitials(): string {
    const u = this.auth.user();
    if (!u) return '';
    const source = (u.name && u.name.trim()) ? (u.name as string) : (u.email.split('@')[0] || u.email);
    const parts = source.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  }
}
