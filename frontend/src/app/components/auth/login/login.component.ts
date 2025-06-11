import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatError } from '@angular/material/form-field';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';

import { AuthService } from '../../../services/auth.service';

/**
 * Componente de login para autenticación de usuarios.
 * Incluye opción de "recordar contraseña", validación reactiva y redirección tras login.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatIcon,
    MatCheckbox
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  /** Formulario reactivo para login */
  loginForm: FormGroup;

  /** Mensaje de error tras intento fallido de login */
  loginError: string | undefined;

  /** Bandera para mostrar mensaje de registro exitoso */
  registrationSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Inicializa el formulario con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    // Comprueba si el usuario llega tras registrarse con éxito
    this.route.queryParams.subscribe(params => {
      this.registrationSuccess = params['registered'] === '1';
    });
  }

  /**
   * Al iniciar, carga email/contraseña guardados si el usuario eligió "recordarme".
   */
  ngOnInit(): void {
    const savedEmail = localStorage.getItem('email');
    /* const savedPassword = localStorage.getItem('password'); */

    if (savedEmail /* && savedPassword */) {
      this.loginForm.patchValue({
        email: savedEmail,
        /* password: savedPassword, */
        rememberMe: true
      });
    }
  }

  /**
   * Envía el formulario de login si es válido.
   * Maneja la lógica de "recordarme", errores y redirección.
   */
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loginError = '';
    const { email, password, rememberMe } = this.loginForm.value;

    if (rememberMe) {
      localStorage.setItem('email', email);
    } else {
      localStorage.removeItem('email');
    }

    this.authService.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/home']),
      error: err => {
        this.loginError = err.error?.message || 'Login incorrecto';
      }
    });
  }
}
