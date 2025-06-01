import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Componente de la página de aterrizaje (landing page).
 * Muestra información introductoria, objetivos del proyecto o enlaces destacados.
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

}
