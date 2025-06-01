import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { WaterSourceService } from '../../../services/water-source.service';
import { CommonModule } from '@angular/common';
import { WaterSource } from '../../../services/water-source.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-source-moderation',
  standalone: true,
  imports: [NgIf, NgFor, MatCardModule, MatButtonModule, CommonModule, MatProgressSpinnerModule],
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

  constructor(private waterSourceService: WaterSourceService) { }

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
        this.loadAllSources();  //recargar la tabla completa
      },
      error: (err) => {
        console.error('Error moderating source:', err);
        this.errorMessage = 'Error al moderar la fuente';
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

  editSource(id: string): void {
    console.log('Editar fuente con ID:', id);
    // Aquí puedes redirigir a una página de edición o abrir un modal
  }

  deleteSource(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta fuente?')) {
      this.waterSourceService.deleteSource(id).subscribe({
        next: () => {
          this.loadAllSources(); // refresca la lista
        },
        error: () => {
          alert('Error al eliminar la fuente.');
        }
      });
    }
  }

}