import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

/**
 * Componente de banner de cookies.
 * Muestra un mensaje si el usuario no ha aceptado aún las cookies
 * y guarda la aceptación en una cookie que expira en 1 año.
 */
@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.css'
})
export class CookiesComponent {

  /** Controla si se debe mostrar el banner de cookies */
  showBanner = false;

  constructor() {
    // Muestra el banner solo si no existe la cookie
    this.showBanner = !this.getCookie('cookiesAccepted');
  }

  /**
   * Acepta las cookies: guarda la cookie y oculta el banner.
   */
  acceptCookies(): void {
    this.setCookie('cookiesAccepted', 'true', 365); // 1 año
    this.showBanner = false;
  }

  /**
   * Obtiene el valor de una cookie.
   * @param name Nombre de la cookie
   * @returns Valor de la cookie o null si no existe
   */
  getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Crea o sobrescribe una cookie.
   * @param name Nombre de la cookie
   * @param value Valor a guardar
   * @param days Número de días hasta que expire
   */
  setCookie(name: string, value: string, days: number): void {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
  }
}
