import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  currentUser = this.authService.currentUser;

  // FIX: Use inject(FormBuilder) directly to initialize the form group, avoiding potential issues with `this` context during property initialization.
  loginForm = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit() {
    if (this.currentUser()) {
      this.router.navigate(['/']);
    }
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    const { error } = await this.authService.signInWithEmail(email!, password!);

    if (error) {
      this.errorMessage.set('Email ou senha inválidos.');
    } else {
      this.router.navigate(['/']);
    }
    this.loading.set(false);
  }
}