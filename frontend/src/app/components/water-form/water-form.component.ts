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
    MatSnackBarModule,
    ReactiveFormsModule],
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
  photoFiles: File[] = []; // Guardamos los archivos originales
  isSubmitting = false; // Para mostrar estado de carga

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
    if (files) {
      for (let i = 0; i < Math.min(files.length, 3 - this.photos.length); i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.photos.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  removePhoto(index: number): void {
    this.photos.splice(index, 1);
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

    if (errors['required']) {
      return `${label} es requerido`;
    }
    if (errors['maxlength']) {
      return `${label} no debe exceder ${errors['maxlength'].requiredLength} caracteres`;
    }
    if (errors['pattern']) {
      if (fieldName === 'latitude' || fieldName === 'longitude') {
        return `${label} debe tener formato válido (ej: 40.416775)`;
      }
      return `${label} tiene formato inválido`;
    }

    return `${label} no es válido`;
  }

  /**
  * Marca todos los campos del formulario como tocados
  */
  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Añade esta propiedad a la clase
  isGeolocating = false;
  geolocationError = '';

  // Método para obtener la ubicación actual
  async getCurrentLocation(): Promise<void> {
    this.isGeolocating = true;
    this.geolocationError = '';

    try {
      const position = await this.getPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Actualizar el formulario con 6 decimales de precisión
      this.form.patchValue({
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6)
      });

      // Mostrar mensaje de éxito
      this.snackBar.open('Ubicación obtenida correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('Error getting location:', error);
      this.handleGeolocationError(error);
    } finally {
      this.isGeolocating = false;
    }
  }

  // Helper function para promisify geolocation API
  private getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada por el navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 segundos
          maximumAge: 0 // No usar caché
        }
      );
    });
  }

  // Manejo de errores de geolocalización
  private handleGeolocationError(error: any): void {
    let errorMessage = 'Error al obtener la ubicación';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Permiso denegado. Por favor, habilita la geolocalización en tu navegador.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'La información de ubicación no está disponible.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Tiempo de espera agotado al intentar obtener la ubicación.';
        break;
      case error.UNKNOWN_ERROR:
        errorMessage = 'Error desconocido al obtener la ubicación.';
        break;
    }

    this.geolocationError = errorMessage;
    this.snackBar.open(errorMessage, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Sube las fotos a Cloudinary después de guardar la fuente
   */
  private uploadPhotos(waterSourceId: number): void {
    if (this.photoFiles.length === 0) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.snackBar.open('No se encontró token de autenticación', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.snackBar.open('Subiendo fotos...', '', {
      duration: 0, // No se cierra automáticamente
      panelClass: ['info-snackbar']
    });

    // Crear observables para cada upload
    const uploadObservables = this.photoFiles.map(file => 
      this.photoService.uploadPhoto(file, waterSourceId.toString(), token).pipe(
        catchError((error: any) => {
          console.error('Error uploading photo:', error);
          return of(null); // Retorna null en caso de error
        })
      )
    );

    forkJoin(uploadObservables).subscribe({
      next: (results) => {
        // Filtrar resultados nulos (errores)
        const validUrls = results.filter(url => url !== null) as string[];
        
        if (validUrls.length > 0) {
          // Asociar las fotos con la fuente de agua
          this.associatePhotosWithWaterSource(waterSourceId, validUrls);
        }
        
        if (validUrls.length < this.photoFiles.length) {
          this.snackBar.open('Algunas fotos no se pudieron subir', 'Cerrar', {
            duration: 4000,
            panelClass: ['warning-snackbar']
          });
        } else if (validUrls.length > 0) {
          this.snackBar.open('Fotos subidas correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      },
      error: (error: any) => {
        console.error('Error uploading photos:', error);
        this.snackBar.open('Error al subir las fotos', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  
  }


   /**
   * Asocia las URLs de las fotos con la fuente de agua en el backend
   */
  private associatePhotosWithWaterSource(waterSourceId: number, photoUrls: string[]): void {
    const token = localStorage.getItem('token');
    
    this.http.post(`http://localhost:3000/api/water-sources/${waterSourceId}/photos`, 
      { photos: photoUrls }, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe({
      next: () => {
        console.log('Photos associated with water source successfully');
      },
      error: (err) => {
        console.error('Error associating photos with water source:', err);
        this.snackBar.open('Error al asociar las fotos con la fuente', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }



  /**
 * Envia los datos del formulario al backend.
 * El usuario debe estar autenticado (se incluye token JWT).
 */
   /**
   * Envia los datos del formulario al backend.
   * El usuario debe estar autenticado (se incluye token JWT).
   */
  onSubmit(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      const token = localStorage.getItem('token');

      // Primero guardar la fuente de agua (sin fotos)
      this.http.post<any>('http://localhost:3000/api/water-sources', this.form.value, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe({
        next: (response) => {
          this.showSuccessSnackBar('¡Fuente de agua añadida con éxito!');
          
          // Si hay fotos, subirlas después de guardar la fuente
          if (this.photoFiles.length > 0 && response.id) {
            this.uploadPhotos(response.id);
          }
          
          // Esperar un poco antes de redirigir para que se vea el mensaje
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: (err) => {
          if (err.status === 400 && err.error?.error === 'Ya existe una fuente en esa ubicación.') {
            this.showErrorSnackBar('Ya existe una fuente en esa ubicación. Intenta en otra localización.');
          } else if (err.status === 401) {
            this.showErrorSnackBar('No tienes permisos para realizar esta acción. Por favor, inicia sesión.');
          } else if (err.status === 500) {
            this.showErrorSnackBar('Error del servidor. Por favor, inténtalo más tarde.');
          } else {
            console.error('Error al añadir la fuente:', err);
            this.showErrorSnackBar('Error al añadir la fuente. Por favor, inténtalo de nuevo.');
          }
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.markFormGroupTouched();

      const errors = this.getFormErrors();
      if (errors.length > 0) {
        this.showErrorSnackBar(`Por favor, corrige los siguientes errores: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
      }
    }
  }
}
