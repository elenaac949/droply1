import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService, CreateReviewRequest } from '../../services/review.service';
import { PhotoService, Photo } from '../../services/photo.service';
import { environment } from '../../environments/environment';


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

  baseUrl = environment.apiUrl;

  /** Servicio de valoraciones */
  private reviewService = inject(ReviewService);



  private photoService = inject(PhotoService);


  /** Fotos asociadas a la fuente */
  photos = signal<Photo[]>([]);

  /**
   * Al iniciar, carga información de la fuente y valoraciones aprobadas.
   */
  ngOnInit(): void {
    this.loadSourceInfo();
    this.loadApprovedReviews();
    this.loadPhotos();
  }

  /**
   * Carga los datos básicos de la fuente (nombre, usuario, descripción...).
   */
  loadSourceInfo(): void {
    this.reviewService.getWaterSourceInfo(this.waterSourceId)
      .subscribe({
        next: data => {
          this.sourceData = data;
        },
        error: err => {
          console.error('Error al cargar información de la fuente:', err);
        }
      });
  }

  /**
   * Carga las valoraciones aprobadas asociadas a la fuente.
   */
  loadApprovedReviews(): void {
    this.reviewService.getApprovedReviewsBySource(this.waterSourceId)
      .subscribe({
        next: data => {
          this.reviews.set(data);
        },
        error: err => {
          console.error('Error al cargar valoraciones:', err);
        }
      });
  }

  /**
   * Envía una nueva valoración al backend. Solo si el usuario está autenticado.
   */
  submitReview(): void {
    const reviewData: CreateReviewRequest = {
      water_source_id: this.waterSourceId,
      rating: this.form.rating,
      comment: this.form.comment
    };

    this.reviewService.createReview(reviewData)
      .subscribe({
        next: () => {
          this.form = { rating: 5, comment: '' };
          this.activeTab.set('reviews');
          this.loadApprovedReviews();
        },
        error: err => {
          if (err.message === 'Token de autenticación requerido') {
            alert('Debes iniciar sesión para enviar una valoración.');
          } else {
            alert('Error al enviar valoración');
            console.error(err);
          }
        }
      });
  }

  loadPhotos(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.photoService.getPhotosByWaterSource(this.waterSourceId, token)
      .subscribe({
        next: data => this.photos.set(data.filter(p => p.status === 'approved')),
        error: err => console.error('Error al cargar fotos:', err)
      });
  }
}