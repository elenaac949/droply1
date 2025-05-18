import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone:true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  registerError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(7)]],
    confirmPassword: ['', Validators.required]
  });
  }

  onSubmit() {
    if (this.registerForm.invalid || this.passwordsDontMatch()) return;
    this.registerError = '';
    const { username, email, password } = this.registerForm.value;
    this.authService.register(username!, email!, password!).subscribe({
      next: () => this.router.navigate(['/login'],{ queryParams: { registered: '1' } }),
      error: err => {
        this.registerError = err.error?.message || 'Error al registrar usuario';
      }
    });
  }

  passwordsDontMatch(): boolean {
    return this.registerForm.value.password !== this.registerForm.value.confirmPassword;
  }
}
