import { Component, EventEmitter, Output, Input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Componente de filtros que contiene el botón para activar o desactivar la geolocalización.
 * Comunica el cambio al componente padre mediante un `@Output`.
 */
@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [NgClass],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {

  /** Indica si la geolocalización está activada */
  @Input() useGeolocation = false;

  /** Evento emitido cuando el usuario pulsa el botón de geolocalización */
  @Output() toggleGeo = new EventEmitter<void>();

  /**
   * Emite el evento `toggleGeo` al componente padre para activar o desactivar la geolocalización.
   */
  toggleGeolocation(): void {
    this.toggleGeo.emit();
    console.log('aqui llega');
  }
}
