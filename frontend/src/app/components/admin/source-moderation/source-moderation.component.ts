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
  imports: [NgIf, NgFor, MatCardModule, MatButtonModule, CommonModule,MatProgressSpinnerModule],
  templateUrl: './source-moderation.component.html',
  styleUrls: ['./source-moderation.component.css']
})
export class SourceModerationComponent implements OnInit {
  pendingSources: WaterSource[] = []; // Usa la interfaz para tipado
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private waterSourceService: WaterSourceService) {}

  ngOnInit(): void {
    this.loadPendingSources();
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

  moderateSource(id: string, status: 'approved' | 'rejected'): void {
    this.waterSourceService.moderateSource(id, status).subscribe({
      next: () => {
        this.loadPendingSources(); // Recargar la lista después de moderar
      },
      error: (err) => {
        console.error('Error moderating source:', err);
        this.errorMessage = 'Error al moderar la fuente';
      }
    });
  }
}