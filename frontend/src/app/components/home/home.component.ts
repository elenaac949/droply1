import { Component } from '@angular/core';
import { MapComponent } from './map/map.component';
import { FiltersComponent } from './filters/filters.component';
import { NgIf } from '@angular/common';

/**
 * Componente principal de la página de inicio.
 * Contiene el mapa, los filtros y controla la activación de geolocalización.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapComponent, FiltersComponent, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  /** Indica si la geolocalización está activada */
  useGeolocation = false;

  /** Muestra el spinner mientras cambia el estado de geolocalización */
  isLoadingGeo = false;

  /**
   * Al iniciar, carga el valor de `useGeolocation` desde localStorage.
   */
  ngOnInit(): void {
    const saved = localStorage.getItem('useGeolocation');
    this.useGeolocation = saved === 'true';
  }

  /**
   * Cambia el estado de la geolocalización y lo guarda en localStorage.
   * Simula una carga con un pequeño retardo.
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
}
