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

  /** Formulario reactivo de registro */
  registerForm: FormGroup;

  /** Mensaje de error al registrar */
  registerError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    // Inicializa el formulario con validaciones y validador asíncrono para email
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
      password: ['', [Validators.required, Validators.minLength(7)]],
      confirmPassword: ['', Validators.required],
      phone: [''],
      country: [''],
      city: [''],
      postal_code: [''],
      address: ['']
    });
  }

  /**
   * Envía el formulario si es válido y las contraseñas coinciden.
   * En caso de éxito, redirige al login con query param `registered=1`.
   */
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
    return this.registerForm.value.password !== this.registerForm.value.confirmPassword;
  }

  /**
   * Validador asíncrono que comprueba si el email ya está registrado.
   * 
   * @returns AsyncValidatorFn que emite `{ emailTaken: true }` si existe
   */
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
