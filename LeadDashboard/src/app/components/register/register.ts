import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  error = signal<string | null>(null);
  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  submit() {
    this.error.set(null);
    if (this.form.invalid) { this.error.set('Please fill in all fields'); return; }
    const { name, email, password } = this.form.value as { name: string; email: string; password: string };
    this.auth.register(name, email, password).subscribe({
      next: res => {
        this.auth.user.set(res.user);
        this.router.navigateByUrl('/');
      },
      error: (err) => this.error.set(err?.error?.error ?? 'Registration failed')
    });
  }
}
