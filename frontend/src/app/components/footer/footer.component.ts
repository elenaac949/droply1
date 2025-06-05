import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Componente del pie de página (footer) de la aplicación.
 * 
 * Incluye enlaces de navegación y posibles elementos informativos,
 * como aviso legal, políticas de privacidad o contacto.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  currentYear: number = new Date().getFullYear();
}
