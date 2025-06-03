import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

/**
 * Componente de formulario para añadir una nueva fuente de agua.
 * Incluye validaciones, envío autenticado al backend y redirección al finalizar.
 */
@Component({
  selector: 'app-water-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './water-form.component.html',
  styleUrl: './water-form.component.css'
})
export class WaterFormComponent {

  /** FormBuilder inyectado para construir el formulario */
  private fb = inject(FormBuilder);

  /** Cliente HTTP para envío de datos al backend */
  private http = inject(HttpClient);

  /** Router para redirigir tras enviar el formulario */
  private router = inject(Router);

  /** Opciones de tipo de fuente disponibles */
  waterSourceTypes = [
    { value: 'drinking', label: 'Potable' },
    { value: 'tap', label: 'Grifo' },
    { value: 'decorative', label: 'Decorativa' },
    { value: 'bottle_refill', label: 'Recarga de botellas' },
    { value: 'natural_spring', label: 'Manantial natural' },
    { value: 'other', label: 'Otro' }
  ];

  /** Formulario reactivo con validaciones para campos */
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    latitude: ['', [Validators.required, Validators.pattern(/^-?\d{1,3}\.\d{6,8}$/)]],
    longitude: ['', [Validators.required, Validators.pattern(/^-?\d{1,3}\.\d{6,8}$/)]],
    type: ['other', Validators.required],
    is_accessible: [false],
    schedule: ['', Validators.maxLength(100)],
    country: ['', Validators.maxLength(100)],
    city: ['', Validators.maxLength(100)],
    postal_code: ['', Validators.maxLength(20)],
    address: ['', Validators.maxLength(255)]
  });

  /**
   * Envia los datos del formulario al backend.
   * El usuario debe estar autenticado (se incluye token JWT).
   */
  onSubmit(): void {
    if (this.form.valid) {
      const token = localStorage.getItem('token');

      this.http.post('http://localhost:3000/api/water-sources', this.form.value, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe({
        next: () => {
          alert('Fuente de agua añadida con éxito!');
          this.router.navigate(['/']);
        },
        error: (err) => {
          if (err.status === 400 && err.error?.error === 'Ya existe una fuente en esa ubicación.') {
            alert('Ya existe una fuente en esa ubicación. Intenta en otra localización.');
          } else {
            console.error('Error al añadir la fuente:', err);
            alert('Error al añadir la fuente. Por favor, inténtalo de nuevo.');
          }
        }

      });
    }
  }
}
