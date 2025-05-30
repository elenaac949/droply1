import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})

export class ReviewsComponent implements OnInit {
  @Input() waterSourceId!: string;
  @Input() close!: () => void;

  activeTab = signal<'reviews' | 'add'>('reviews');
  sourceData: any = {};
  reviews = signal<any[]>([]);

  form = {
    rating: 5,
    comment: ''
  };

  private http = inject(HttpClient);

  ngOnInit(): void {
    this.loadSourceInfo();       // Nombre + creador
    this.loadApprovedReviews();  // Solo valoraciones aprobadas
  }
/* Ceafamos la informacion de la duente */
  loadSourceInfo(): void {
    this.http.get<any>(`http://localhost:3000/api/water-sources/${this.waterSourceId}`)
      .subscribe(data => {
        console.log('sourceData', data);
        this.sourceData = data;
      });
  }

  /* Cargamos la valoraciones aprobadas */
  loadApprovedReviews(): void {
    this.http.get<any[]>(`http://localhost:3000/api/reviews/source/${this.waterSourceId}`)
      .subscribe(data => {
        console.log('valoraciones aprobadas', data);
        this.reviews.set(data);
      });
  }


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
        this.loadApprovedReviews();/* recragra valoraciones cuando se crea una nueva pero da iguall porque no esta aprobada  */
      },
      error: err => {
        alert('Error al enviar valoración');
        console.error(err);
      }
    });
  }

}
