import { Component, EventEmitter, Output, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-filters',
  standalone:true,
  imports: [NgClass],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
  
  @Input() useGeolocation = false;
  @Output() toggleGeo = new EventEmitter<void>();

  toggleGeolocation() {
    this.toggleGeo.emit();
    console.log('aqui llega');
  }
}

