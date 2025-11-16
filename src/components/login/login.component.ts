


import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  // Fix: Explicitly type injected Router to resolve type error.
  private router: Router = inject(Router);
  // Fix: Explicitly typed the injected FormBuilder to resolve a type inference issue.
  private fb: FormBuilder = inject(FormBuilder);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  currentUser = this.authService.currentUser;
  mode = signal<'login' | 'signup'>('login');

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    if (this.currentUser()) {
      this.router.navigate(['/']);
    }
  }

  toggleMode() {
    this.mode.update(m => m === 'login' ? 'signup' : 'login');
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loginForm.reset();
    this.signupForm.reset();
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { email, password } = this.loginForm.value;

    const { error } = await this.authService.signInWithEmail(email!, password!);

    if (error) {
      this.errorMessage.set('Email ou senha inválidos.');
    } else {
      this.router.navigate(['/']);
    }
    this.loading.set(false);
  }

  async onSignup() {
    if (this.signupForm.invalid) {
      return;
    }
    
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { email, password } = this.signupForm.value;

    const { error } = await this.authService.signUp(email!, password!);

    if (error) {
      this.errorMessage.set(error.message);
    } else {
      this.successMessage.set('Cadastro realizado! Verifique seu e-mail para confirmar sua conta.');
      this.signupForm.reset();
      this.mode.set('login');
    }
    this.loading.set(false);
  }
}
