import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { FiltersComponent } from '../filters/filters.component';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [MapComponent, FiltersComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
