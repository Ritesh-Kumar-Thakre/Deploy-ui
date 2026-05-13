import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  error = '';
  loading = false;
  showPassword = false;

  registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/)]],
    mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
    role: ['CUSTOMER']
  });

  /** Custom validator for password strength */
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const errors: ValidationErrors = {};
    if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
    if (!/[a-z]/.test(value)) errors['noLowercase'] = true;
    if (!/[0-9]/.test(value)) errors['noDigit'] = true;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value)) errors['noSpecial'] = true;

    return Object.keys(errors).length ? errors : null;
  }

  /** Get password strength as a percentage (0-100) */
  get passwordStrength(): number {
    const value = this.registerForm.get('password')?.value || '';
    if (!value) return 0;
    let score = 0;
    if (value.length >= 8) score += 25;
    if (/[A-Z]/.test(value)) score += 25;
    if (/[a-z]/.test(value)) score += 15;
    if (/[0-9]/.test(value)) score += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(value)) score += 20;
    return Math.min(score, 100);
  }

  get strengthLabel(): string {
    const s = this.passwordStrength;
    if (s === 0) return '';
    if (s < 40) return 'Weak';
    if (s < 75) return 'Fair';
    if (s < 100) return 'Good';
    return 'Strong';
  }

  get strengthColor(): string {
    const s = this.passwordStrength;
    if (s < 40) return '#ef4444';
    if (s < 75) return '#f59e0b';
    if (s < 100) return '#3b82f6';
    return '#22c55e';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onRegister() {
    // Mark all fields as touched to trigger validation display
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.error = 'Please fix the errors above before submitting.';
      return;
    }

    this.error = '';
    this.loading = true;
    this.auth.register(this.registerForm.value).subscribe({
      next: () => {
        this.toast.show('Account created! Please login.', 'success');
        this.router.navigate(['/login']);
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || err.error || 'Registration failed';
      }
    });
  }
}
