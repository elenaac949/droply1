import { Component, EventEmitter, Output, Input } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
/**
 * Componente de filtros que contiene el botón para activar o desactivar la geolocalización.
 * Comunica el cambio al componente padre mediante un `@Output`.
 */
@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    NgClass,
    NgFor,
    NgIf,
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

  /** Indica si la geolocalización está activada */
  @Input() useGeolocation = false;

  /** Evento emitido cuando el usuario pulsa el botón de geolocalización */
  @Output() toggleGeo = new EventEmitter<void>();


  @Output() filtersChange = new EventEmitter<{
    status?: string;
    type?: string;
    accessible?: boolean;
  }>();

  filters = {
    status: '',
    type: '',
    accessible: ''
  };
  /**
   * Emite el evento `toggleGeo` al componente padre para activar o desactivar la geolocalización.
   */
  toggleGeolocation(): void {
    this.toggleGeo.emit();
    console.log('aqui llega');
  }

   applyFilters(): void {
    const result = {
      status: this.filters.status || undefined,
      type: this.filters.type || undefined,
      accessible:
        this.filters.accessible === ''
          ? undefined
          : this.filters.accessible === 'true'
    };

    this.filtersChange.emit(result);
  }
}
