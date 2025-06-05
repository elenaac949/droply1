import { Component, EventEmitter, Output, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

/**
 * Componente de filtros que permite al usuario:
 * - Activar/desactivar la geolocalización.
 * - Aplicar filtros de tipo y accesibilidad para las fuentes de agua.
 * 
 * Este componente emite eventos hacia el componente padre cuando:
 * - Se activa o desactiva la geolocalización.
 * - Se aplican nuevos filtros.
 */
@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {

  /**
   * Indica si la geolocalización está activada.
   * Este valor se recibe desde el componente padre.
   * 
   * @input useGeolocation - `true` si la geolocalización está activa, `false` en caso contrario.
   */
  @Input() useGeolocation = false;

  /**
   * Evento emitido cuando se activa o desactiva la geolocalización.
   * 
   * @output toggleGeo - Emite un evento sin valor al hacer clic en el botón de geolocalización.
   */
  @Output() toggleGeo = new EventEmitter<void>();

  /**
   * Evento emitido al aplicar filtros.
   * 
   * @output filtersChange - Devuelve un objeto con los filtros aplicados:
   *   - `type`: tipo de fuente (string) o `undefined`.
   *   - `accessible`: si es accesible (`true`/`false`) o `undefined`.
   */
  @Output() filtersChange = new EventEmitter<{
    type?: string;
    accessible?: boolean;
  }>();

  /**
   * Objeto interno que almacena el estado actual de los filtros seleccionados por el usuario.
   */
  filters = {
    status: '',
    type: '',
    accessible: ''
  };

  /**
   * Método que emite el evento `toggleGeo` al hacer clic en el botón de geolocalización.
   * 
   * @returns void
   */
  toggleGeolocation(): void {
    this.toggleGeo.emit();
    console.log('aqui llega');
  }

  /**
   * Método que aplica los filtros seleccionados y los emite al componente padre mediante `filtersChange`.
   * Si un campo está vacío, se emite como `undefined` para no incluirlo en la búsqueda.
   * 
   * @returns void
   */
  applyFilters(): void {
    const result = {
      type: this.filters.type || undefined,
      accessible:
        this.filters.accessible === ''
          ? undefined
          : this.filters.accessible === 'true'
    };

    this.filtersChange.emit(result);
  }
}
