import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  username: string;
  status: string;
  source_name?: string; // por si también traes el nombre de la fuente
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private apiUrl = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient) {}

  /** Obtener valoraciones pendientes */
  getPendingReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/pending`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /** Moderar una valoración (aprobar o rechazar) */
  moderateReview(id: string, status: 'approved' | 'rejected'): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/moderate`, { status }).pipe(
      catchError(error => throwError(() => error))
    );
  }
}
