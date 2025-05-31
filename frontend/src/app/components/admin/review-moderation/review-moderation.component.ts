import { Component, OnInit } from '@angular/core';
import { ReviewService,Review } from '../../../services/review.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgIf, NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-moderation',
  standalone:true,
  imports:[NgIf, NgFor, MatCardModule, MatButtonModule,CommonModule],
  templateUrl: './review-moderation.component.html',
  styleUrls: ['./review-moderation.component.css']
})
export class ReviewModerationComponent implements OnInit {

  pendingReviews: Review[] = [];

  constructor(
    private reviewService: ReviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPendingReviews();
  }

  loadPendingReviews() {
    this.reviewService.getPendingReviews().subscribe(reviews => {
      this.pendingReviews = reviews;
    });
  }

  moderate(id: string, status: 'approved' | 'rejected') {
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
