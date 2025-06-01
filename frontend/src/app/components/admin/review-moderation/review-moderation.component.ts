import { Component, OnInit } from '@angular/core';
import { ReviewService, Review } from '../../../services/review.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

/**
 * Componente para moderar valoraciones de usuarios.
 * Permite ver las valoraciones pendientes y aprobarlas o rechazarlas.
 */
@Component({
  selector: 'app-review-moderation',
  standalone: true,
  imports: [
    NgIf, NgFor,
    MatCardModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './review-moderation.component.html',
  styleUrls: ['./review-moderation.component.css']
})
export class ReviewModerationComponent implements OnInit {

  /** Lista de valoraciones pendientes de moderación */
  pendingReviews: Review[] = [];

  constructor(
    private reviewService: ReviewService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Carga las valoraciones pendientes al iniciar el componente.
   */
  ngOnInit(): void {
    this.loadPendingReviews();
  }

  /**
   * Llama al servicio para obtener todas las valoraciones en estado 'pending'.
   */
  loadPendingReviews(): void {
    this.reviewService.getPendingReviews().subscribe(reviews => {
      this.pendingReviews = reviews;
    });
  }

  /**
   * Cambia el estado de una valoración a 'approved' o 'rejected'.
   * 
   * @param id ID de la valoración
   * @param status Estado nuevo ('approved' | 'rejected')
   */
  moderate(id: string, status: 'approved' | 'rejected'): void {
    this.reviewService.moderateReview(id, status).subscribe(() => {
      this.loadPendingReviews();
      this.snackBar.open(
        status === 'approved' ? 'Valoración aprobada' : 'Valoración rechazada',
        'Cerrar',
        { duration: 3000 }
      );
    });
  }
}
