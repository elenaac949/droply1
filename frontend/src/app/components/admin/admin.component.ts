import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Componente de administración.
 * 
 * Este componente sirve como contenedor para las secciones 
 * de moderación, gestión de usuarios y fuentes. Incluye navegación lateral
 * con iconos y enlaces (usando Angular Material y Router).
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  // Componente base. La lógica de navegación o visualización
  // se implementa principalmente en la plantilla HTML.
}
