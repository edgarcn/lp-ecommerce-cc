import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();
    this.auth.login(username!, password!).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: (err) => {
        this.error.set(err?.status === 401 ? 'Invalid credentials.' : 'Login failed. Try again.');
        this.submitting.set(false);
      },
    });
  }
}
