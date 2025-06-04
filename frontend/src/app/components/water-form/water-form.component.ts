import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PhotoService, Photo } from '../../services/photo.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Componente de formulario para añadir una nueva fuente de agua.
 * Incluye validaciones, envío autenticado al backend y redirección al finalizar.
 */
@Component({
  selector: 'app-water-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
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

  /** SnackBar para mostrar notificaciones */
  private snackBar = inject(MatSnackBar);

  /** Servicio de fotos para subir a Cloudinary */
  private photoService = inject(PhotoService);

  photos: string[] = [];
  photoFiles: File[] = [];
  isSubmitting = false;
  isGeolocating = false;
  geolocationError = '';

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

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < Math.min(files.length, 3 - this.photos.length); i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.photos.push(e.target.result);
        this.photoFiles.push(file);
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(index: number): void {
    this.photos.splice(index, 1);
    this.photoFiles.splice(index, 1);
  }

  /**
   * Muestra un mensaje de error en SnackBar
   */
  private showErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Muestra un mensaje de éxito en SnackBar
   */
  private showSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Obtiene los errores del formulario y genera mensajes descriptivos
   */
  private getFormErrors(): string[] {
    const errors: string[] = [];

    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.invalid && control.touched) {
        errors.push(this.getErrorMessage(key, control.errors));
      }
    });

    return errors;
  }

  /**
   * Genera mensajes de error específicos para cada campo
   */
  private getErrorMessage(fieldName: string, errors: any): string {
    const fieldLabels: { [key: string]: string } = {
      name: 'Nombre',
      description: 'Descripción',
      latitude: 'Latitud',
      longitude: 'Longitud',
      type: 'Tipo de fuente',
      schedule: 'Horario',
      country: 'País',
      city: 'Ciudad',
      postal_code: 'Código Postal',
      address: 'Dirección'
    };

    const label = fieldLabels[fieldName] || fieldName;

    if (errors?.['required']) {
      return `${label} es requerido`;
    }
    if (errors?.['maxlength']) {
      return `${label} no debe exceder ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors?.['pattern']) {
      if (fieldName === 'latitude' || fieldName === 'longitude') {
        return `${label} debe tener formato válido (ej: 40.416775)`;
      }
      return `${label} tiene formato inválido`;
    }

    return `${label} no es válido`;
  }



  /**
   * Asocia las URLs de las fotos con la fuente de agua en el backend
   */
  private associatePhotosWithWaterSource(waterSourceId: number, photoUrls: string[]): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.post(
      `http://localhost:3000/api/water-sources/${waterSourceId}/photos`,
      { photos: photoUrls },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => console.log('Photos associated successfully'),
      error: (err) => {
        console.error('Error associating photos:', err);
        this.showErrorSnackBar('Error al asociar las fotos con la fuente');
      }
    });
  }



  getCurrentLocation(): void {
  this.isGeolocating = true;
  this.geolocationError = '';

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

        this.form.patchValue({
          latitude: lat,
          longitude: lng
        });

        // Marca como no tocado para evitar errores visuales
        this.form.get('latitude')?.markAsUntouched();
        this.form.get('longitude')?.markAsUntouched();

        this.isGeolocating = false;

        this.showSuccessSnackBar('Ubicación detectada correctamente');
      },
      error => {
        this.geolocationError = 'No se pudo obtener la ubicación. Asegúrate de tener el GPS activado.';
        this.isGeolocating = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.showErrorSnackBar('Permiso denegado para acceder a la ubicación.');
            break;
          case error.POSITION_UNAVAILABLE:
            this.showErrorSnackBar('La información de ubicación no está disponible.');
            break;
          case error.TIMEOUT:
            this.showErrorSnackBar('Tiempo de espera excedido al obtener la ubicación.');
            break;
          default:
            this.showErrorSnackBar('Error al obtener la ubicación.');
        }
      }
    );
  } else {
    this.geolocationError = 'Tu navegador no soporta geolocalización.';
    this.isGeolocating = false;
    this.showErrorSnackBar(this.geolocationError);
  }
}




  /**
   * Envia los datos del formulario al backend.
   * El usuario debe estar autenticado (se incluye token JWT).
   */
  onSubmit(): void {
  if (this.form.valid) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showErrorSnackBar('No estás autenticado. Inicia sesión para añadir fuentes.');
      return;
    }

    this.isSubmitting = true;

    this.http.post('http://localhost:3000/api/water-sources', this.form.value, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: () => {
        this.showSuccessSnackBar('Fuente de agua añadida con éxito');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting = false;

        if (err.status === 400 && err.error?.error === 'Ya existe una fuente en esa ubicación.') {
          this.showErrorSnackBar('Ya existe una fuente en esa ubicación. Intenta en otra localización.');
        } else if (err.status === 401) {
          this.showErrorSnackBar('No autorizado. Inicia sesión para continuar.');
        } else {
          console.error('Error al añadir la fuente:', err);
          this.showErrorSnackBar('Error inesperado al añadir la fuente. Intenta de nuevo más tarde.');
        }
      }
    });
  } else {
    const errores = this.getFormErrors();
    errores.forEach(msg => this.showErrorSnackBar(msg));
  }
}


}