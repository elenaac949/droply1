import { Component } from '@angular/core';
import { MapComponent } from './map/map.component';
import { FiltersComponent } from './filters/filters.component';
import { NgIf } from '@angular/common';

/**
 * @component HomeComponent
 * 
 * Componente principal de la página de inicio.
 * 
 * Este componente:
 * - Muestra el mapa (`MapComponent`) y los filtros (`FiltersComponent`).
 * - Controla la activación o desactivación de la geolocalización.
 * - Guarda la preferencia de geolocalización en `localStorage`.
 * - Recibe y maneja filtros para pasarlos al componente del mapa.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapComponent, FiltersComponent, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  /**
   * Indica si la geolocalización está activada.
   * Se guarda y recupera desde `localStorage` bajo la clave `useGeolocation`.
   * 
   * @type {boolean}
   */
  useGeolocation = false;

  /**
   * Indica si se está mostrando el spinner de carga mientras cambia el estado de la geolocalización.
   * 
   * @type {boolean}
   */
  isLoadingGeo = false;

  /**
   * Filtros activos aplicados por el usuario desde el componente de filtros.
   * Este objeto se pasa al `MapComponent` como input.
   * 
   * @type {{ type?: string; accessible?: boolean }}
   */
  filters: { type?: string; accessible?: boolean } = {};

  /**
   * Hook de inicialización del componente.
   * Recupera la preferencia de geolocalización desde `localStorage`.
   * 
   * @method ngOnInit
   * @returns {void}
   */
  ngOnInit(): void {
    const saved = localStorage.getItem('useGeolocation');
    this.useGeolocation = saved === 'true';
  }

  /**
   * Cambia el estado de la geolocalización.
   * Guarda el nuevo valor en `localStorage` y muestra un spinner de carga durante 1.5 segundos.
   * 
   * @method handleToggleGeo
   * @returns {void}
   */
  handleToggleGeo(): void {
    this.isLoadingGeo = true;
    this.useGeolocation = !this.useGeolocation;

    localStorage.setItem('useGeolocation', String(this.useGeolocation));
    console.log('Geolocalización:', this.useGeolocation);

    setTimeout(() => {
      this.isLoadingGeo = false;
    }, 1500);
  }

  /**
   * Maneja los filtros aplicados emitidos desde el componente `FiltersComponent`.
   * Se guardan para pasarlos como input al `MapComponent`.
   * 
   * @method onFiltersChanged
   * @param {{ type?: string; accessible?: boolean }} filters Objeto con los filtros aplicados.
   * @returns {void}
   */
  onFiltersChanged(filters: { type?: string; accessible?: boolean }): void {
    this.filters = filters;
    console.log('Filtros aplicados:', filters);
  }
}
