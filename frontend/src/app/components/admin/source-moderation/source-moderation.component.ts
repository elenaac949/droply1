import { Pipe, PipeTransform } from '@angular/core';
import { WaterSource } from '../../../services/water-source.service';
/**
 * Pipe para filtrar fuentes por estado, tipo y accesibilidad.
 */
@Pipe({
  name: 'filterSources',
  standalone: true
})
export class FilterSourcesPipe implements PipeTransform {
  transform(sources: WaterSource[], status: string, type: string, accessible: string): WaterSource[] {
    return sources.filter(source =>
      (!status || source.status === status) &&
      (!type || source.type === type) &&
      (!accessible || source.is_accessible === (accessible === 'true'))
    );
  }
}

/**
 * Pipe para filtrar fuentes por búsqueda textual.
 */
@Pipe({
  name: 'filterSourcesText',
  standalone: true
})
export class FilterSourcesTextPipe implements PipeTransform {
  transform(sources: WaterSource[], term: string): WaterSource[] {
    if (!term || term.trim() === '') return sources;
    const lower = term.toLowerCase();
    return sources.filter(source =>
      (source.name || '').toLowerCase().includes(lower) ||
      (source.username || '').toLowerCase().includes(lower) ||
      (source.description || '').toLowerCase().includes(lower) ||
      String(source.latitude).includes(lower) ||
      String(source.longitude).includes(lower) ||
      (source.country || '').toLowerCase().includes(lower) ||
      (source.city || '').toLowerCase().includes(lower) ||
      (source.postal_code || '').toLowerCase().includes(lower)
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { WaterSourceService } from '../../../services/water-source.service';
import { PhotoService, Photo } from '../../../services/photo.service';
import { environment } from '../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';
type WaterSourceWithPhotos = WaterSource & { photos?: Photo[] };/* extender las variables de la funete */

/**
 * Componente para la moderación de fuentes de agua.
 * Permite listar fuentes pendientes, aprobar o rechazar,
 * editar fuentes existentes, filtrarlas y eliminarlas.
 */
@Component({
  selector: 'app-source-moderation',
  standalone: true,
  imports: [
    NgIf, NgFor, CommonModule,
    FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatProgressSpinnerModule,
    MatCheckboxModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatOptionModule,
    FilterSourcesPipe,
    FilterSourcesTextPipe,MatIconModule
  ],
  templateUrl: './source-moderation.component.html',
  styleUrls: ['./source-moderation.component.css']
})
export class SourceModerationComponent implements OnInit {

  /** Fuentes pendientes de aprobación */
  pendingSources: WaterSourceWithPhotos[] = [];

  /** Fuentes aprobadas/rechazadas (todas) */
  allSources: WaterSource[] = [];
  /** Indicador de carga de fuentes pendientes */
  isLoading: boolean = true;
  /** Indicador de carga de todas las fuentes */
  isLoadingAll: boolean = true;
  /** Mensaje de error de carga pendiente */
  errorMessage: string | null = null;
  /** Mensaje de error de carga total */
  errorAll: string | null = null;
  /** Mensaje de confirmación al eliminar */
  deleteMessage: string | null = null;

  /** Fuente a editar */
  sourceToEdit: WaterSource | null = null;
  /** Mostrar formulario de edición */
  editSourceForm: boolean = false;

  /** Filtros */
  statusFilter: string = '';
  typeFilter: string = '';
  accessibilityFilter: string = '';
  searchTerm: string = '';

  constructor(
    private waterSourceService: WaterSourceService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private photoService: PhotoService
  ) { }

  /**
   * Inicializa la carga de datos al montar el componente.
   */
  ngOnInit(): void {
    this.loadPendingSources();
    this.loadAllSources();
  }

  /**
   * Carga fuentes pendientes de moderación.
   */
  loadPendingSources(): void {
  this.isLoading = true;
  this.errorMessage = null;

  this.waterSourceService.getPendingSources().subscribe({
    next: (sources) => {
      this.pendingSources = sources.map(source => ({
        ...source,
        photos: []
      }));
      this.isLoading = false;
      this.loadPhotos(); // cargamos las imagenes
    },
    error: (err) => {
      console.error('Error loading sources:', err);
      this.errorMessage = 'Error al cargar fuentes pendientes';
      this.isLoading = false;
    }
  });
}



  /**
   * Carga todas las fuentes existentes.
   */
  loadAllSources(): void {
    this.isLoadingAll = true;
    this.waterSourceService.getAllSources().subscribe({
      next: (sources) => {
        this.allSources = sources.map(s => ({
          ...s,
          is_accessible: !!s.is_accessible
        }));
        this.isLoadingAll = false;
      },
      error: () => {
        this.errorAll = 'Error al cargar todas las fuentes';
        this.isLoadingAll = false;
      }
    });
  }

  /**
   * Aprueba o rechaza una fuente de agua.
   * @param id ID de la fuente
   * @param status Estado nuevo ('approved' o 'rejected')
   */
  moderateSource(id: string, status: 'approved' | 'rejected'): void {
    this.waterSourceService.moderateSource(id, status).subscribe({
      next: () => {
        this.loadPendingSources();
        this.loadAllSources();

        const action = status === 'approved' ? 'aprobada' : 'rechazada';
        this.snackBar.open(`Fuente ${action} correctamente.`, 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success'],
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        console.error('Error moderating source:', err);
        this.snackBar.open('Error al moderar la fuente.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error'],
          verticalPosition: 'top'
        });
      }
    });
  }

  /**
   * Traduce el tipo de fuente a un texto legible en español.
   * @param type Código de tipo
   * @returns Texto traducido
   */
  translateType(type: string): string {
    const types: { [key: string]: string } = {
      'drinking': 'Agua potable',
      'tap': 'Grifo',
      'decorative': 'Decorativa',
      'bottle_refill': 'Recarga de botellas',
      'natural_spring': 'Manantial natural',
      'other': 'Otro'
    };
    return types[type] || type;
  }

  /**
   * Abre el formulario de edición para una fuente.
   * @param source Fuente seleccionada
   */
  openSourceEdit(source: WaterSource): void {
    this.sourceToEdit = { ...source };
    this.editSourceForm = true;
  }

  /**
   * Envía los cambios hechos a una fuente editada.
   */
  submitEditSource(): void {
    if (!this.sourceToEdit) return;

    this.waterSourceService.updateSource(this.sourceToEdit.id, this.sourceToEdit).subscribe({
      next: () => {
        this.loadAllSources();
        this.editSourceForm = false;
        this.sourceToEdit = null;

        this.snackBar.open('Fuente actualizada correctamente.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success'],
          verticalPosition: 'top'
        });
      },
      error: () => {
        this.snackBar.open('Error al actualizar la fuente.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error'],
          verticalPosition: 'top'
        });
      }
    });
  }

  /**
   * Elimina una fuente tras confirmación.
   * @param id ID de la fuente
   */
  deleteSource(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta fuente?')) {
      this.waterSourceService.deleteSource(id).subscribe({
        next: () => {
          this.loadAllSources();
          this.snackBar.open('Fuente eliminada correctamente.', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-success'],
            verticalPosition: 'top'
          });
        },
        error: (err) => {
          console.error('Error al eliminar la fuente:', err);
          this.snackBar.open('Error al eliminar la fuente.', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error'],
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  selectedPhotoUrl: string | null = null;
  baseUrl = environment.apiUrl;
  openPhotoModal(url: string): void {
    this.selectedPhotoUrl = url;
  }

  closePhotoModal(): void {
    this.selectedPhotoUrl = null;
  }


  loadPhotos(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.pendingSources.forEach(source => {
      this.photoService.getPhotosByWaterSource(source.id, token).subscribe({
        next: photos => {
          source.photos = photos.map(photo => ({
            ...photo,
            url: `${this.baseUrl}${photo.url}`
          }));
        },
        error: err => {
          console.error(`Error al cargar fotos de la fuente ${source.id}:`, err);
        }
      });
    });
  }



}
