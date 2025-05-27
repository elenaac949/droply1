import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { FiltersComponent } from '../filters/filters.component';
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


  handleToggleGeo() {
    this.isLoadingGeo = true;

    this.useGeolocation = !this.useGeolocation;
    
    console.log('Geolocalización:', this.useGeolocation);

    // Ocultar el mensaje después de unos segundos (o después de que Map procese)
    setTimeout(() => {
      this.isLoadingGeo = false;
    }, 1500); 
  }
}
