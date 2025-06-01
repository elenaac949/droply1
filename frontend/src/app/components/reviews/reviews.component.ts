import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms'

/**
 * Componente que muestra las valoraciones de una fuente de agua,
 * permite ver las existentes y enviar nuevas.
 */
@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent implements OnInit {

  /** ID de la fuente de agua de la cual se mostrarán/enviarán valoraciones */
  @Input() waterSourceId!: string;

  /** Función para cerrar el modal desde el componente padre */
  @Input() close!: () => void;

  /** Pestaña activa: lista de valoraciones o formulario de nueva valoración */
  activeTab = signal<'reviews' | 'add'>('reviews');

  /** Datos básicos de la fuente (nombre, usuario, etc.) */
  sourceData: any = {};

  /** Lista reactiva de valoraciones aprobadas */
  reviews = signal<any[]>([]);

  /** Modelo del formulario de envío de valoración */
  form = {
    rating: 5,
    comment: ''
  };

  /** Cliente HTTP para llamadas al backend */
  private http = inject(HttpClient);

  /**
   * Al iniciar, carga información de la fuente y valoraciones aprobadas.
   */
  ngOnInit(): void {
    this.loadSourceInfo();
    this.loadApprovedReviews();
  }

  /**
   * Carga los datos básicos de la fuente (nombre, usuario, descripción...).
   */
  loadSourceInfo(): void {
    this.http.get<any>(`http://localhost:3000/api/water-sources/${this.waterSourceId}`)
      .subscribe(data => {
        console.log('sourceData', data);
        this.sourceData = data;
      });
  }

  /**
   * Carga las valoraciones aprobadas asociadas a la fuente.
   */
  loadApprovedReviews(): void {
    this.http.get<any[]>(`http://localhost:3000/api/reviews/source/${this.waterSourceId}`)
      .subscribe(data => {
        console.log('valoraciones aprobadas', data);
        this.reviews.set(data);
      });
  }

  /**
   * Envía una nueva valoración al backend. Solo si el usuario está autenticado.
   */
  submitReview(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para enviar una valoración.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(`http://localhost:3000/api/reviews`, {
      water_source_id: this.waterSourceId,
      rating: this.form.rating,
      comment: this.form.comment
    }, { headers }).subscribe({
      next: () => {
        this.form = { rating: 5, comment: '' };
        this.activeTab.set('reviews');
        this.loadApprovedReviews(); 
      },
      error: err => {
        alert('Error al enviar valoración');
        console.error(err);
      }
    });
  }
}
