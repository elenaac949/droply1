import { Component } from '@angular/core';
import { MapComponent } from './map/map.component';
import { FiltersComponent } from './filters/filters.component';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapComponent, FiltersComponent, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  useGeolocation = false;
  isLoadingGeo = false;

  ngOnInit(): void {
    // Leer el estado guardado al iniciar
    const saved = localStorage.getItem('useGeolocation');
    this.useGeolocation = saved === 'true';
  }

  handleToggleGeo(): void {
    this.isLoadingGeo = true;
    this.useGeolocation = !this.useGeolocation;

    // Guardar estado en localStorage
    localStorage.setItem('useGeolocation', String(this.useGeolocation));

    console.log('Geolocalización:', this.useGeolocation);

    setTimeout(() => {
      this.isLoadingGeo = false;
    }, 1500);
  }
}
