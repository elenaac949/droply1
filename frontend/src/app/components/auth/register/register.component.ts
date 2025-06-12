import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';

import { debounceTime, map, switchMap, take, catchError, of } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

/**
 * Componente de registro de usuarios.
 * Incluye validación de contraseña, verificación asíncrona del email y envío al backend.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {

  registerForm: FormGroup;
  registerError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ],
        [this.emailExistsValidator()]
      ],
      password: ['', [
        Validators.required,
        this.passwordValidator.bind(this)
      ]],
      confirmPassword: ['', Validators.required],
      phone: [''],
      country: [''],
      city: [''],
      postal_code: [''],
      address: ['']
    });

    // Escuchar cambios en la contraseña o confirmación para validar coincidencia
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
        this.registerForm.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      } else {
        this.registerForm.get('confirmPassword')?.setErrors(null);
      }
    });

    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
        this.registerForm.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      } else {
        this.registerForm.get('confirmPassword')?.setErrors(null);
      }
    });
  }

  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = control.value || '';
  
  if (!value) return null;
  
  // Verificar longitud mínima (7 caracteres)
  const hasMinLength = value.length >= 7;
  
  // Verificar mayúscula
  const hasUpperCase = /[A-Z]/.test(value);
  
  // Verificar minúscula
  const hasLowerCase = /[a-z]/.test(value);
  
  // Verificar número
  const hasNumber = /[0-9]/.test(value);

  // Objeto para acumular errores (usando notación de corchetes)
  const errors: { [key: string]: boolean } = {};
  
  if (!hasMinLength) errors['passwordMinLength'] = true;
  if (!hasUpperCase) errors['passwordNoUpperCase'] = true;
  if (!hasLowerCase) errors['passwordNoLowerCase'] = true;
  if (!hasNumber) errors['passwordNoNumber'] = true;

  // Si hay errores, los devolvemos, sino null
  return Object.keys(errors).length > 0 ? errors : null;
}

  onSubmit(): void {
    if (this.registerForm.invalid || this.passwordsDontMatch()) return;
    this.registerError = '';

    const {
      username, email, password,
      phone, country, city, postal_code, address
    } = this.registerForm.value;

    this.authService.register({
      username,
      email,
      password,
      phone,
      country,
      city,
      postal_code,
      address
    }).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { registered: '1' } }),
      error: err => {
        this.registerError = err.error?.error || 'Error al registrar usuario';
      }
    });
  }

  /**
 * Verifica si las contraseñas introducidas no coinciden.
 * @returns true si son diferentes, false si coinciden
 */
  passwordsDontMatch(): boolean {
    const confirmPassword = this.registerForm.get('confirmPassword');
    return confirmPassword ? confirmPassword.hasError('passwordMismatch') : false;
  }

  emailExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return control.valueChanges.pipe(
        debounceTime(500),
        take(1),
        switchMap(value =>
          this.userService.checkEmailExists(value).pipe(
            map((res: any) => (res.exists ? { emailTaken: true } : null)),
            catchError(() => of(null))
          )
        )
      );
    };
  }
}