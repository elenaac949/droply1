import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { WaterSourceService } from '../../../services/water-source.service';
import { CommonModule } from '@angular/common';
import { WaterSource } from '../../../services/water-source.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-source-moderation',
  standalone: true,
  imports: [NgIf, NgFor, MatCardModule, MatButtonModule, CommonModule, MatProgressSpinnerModule, FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule],
  templateUrl: './source-moderation.component.html',
  styleUrls: ['./source-moderation.component.css']
})
export class SourceModerationComponent implements OnInit {
  pendingSources: WaterSource[] = []; // Usar la interfaz para tipado
  isLoading: boolean = true;
  errorMessage: string | null = null;

  allSources: WaterSource[] = [];
  isLoadingAll: boolean = true;
  errorAll: string | null = null;

  deleteMessage: string | null = null;


  editSourceForm: boolean = false;
  sourceToEdit: WaterSource | null = null;


  constructor(private waterSourceService: WaterSourceService, private fb: FormBuilder, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadPendingSources();
    this.loadAllSources();
  }

  loadPendingSources(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.waterSourceService.getPendingSources().subscribe({
      next: (sources) => {
        this.pendingSources = sources;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading sources:', err);
        this.errorMessage = 'Error al cargar fuentes pendientes';
        this.isLoading = false;
      }
    });
  }

  loadAllSources(): void {
    this.isLoadingAll = true;
    this.waterSourceService.getAllSources().subscribe({
      next: (sources) => {
        this.allSources = sources;
        this.isLoadingAll = false;
      },
      error: () => {
        this.errorAll = 'Error al cargar todas las fuentes';
        this.isLoadingAll = false;
      }
    });
  }

  moderateSource(id: string, status: 'approved' | 'rejected'): void {
  this.waterSourceService.moderateSource(id, status).subscribe({
    next: () => {
      this.loadPendingSources(); // Recargar la lista después de moderar
      this.loadAllSources();     // Recargar la tabla completa

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

  openSourceEdit(source: WaterSource): void {
    this.sourceToEdit = { ...source };
    this.editSourceForm = true;
  }


  submitEditSource(): void {
    if (!this.sourceToEdit) return;

    this.waterSourceService.updateSource(this.sourceToEdit.id, this.sourceToEdit).subscribe({
      next: () => {
        this.loadAllSources();
        this.editSourceForm = false;
        this.sourceToEdit = null;

        // ✅ Snackbar
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



}