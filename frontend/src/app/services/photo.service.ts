import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Photo {
  id?: string; // generado automáticamente
  water_source_id?: string | null;
  review_id?: string | null;
  user_id: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private apiUrl =  `${environment.apiUrl}/api/photos`;

  constructor(private http: HttpClient) { }


  uploadPhoto(file: File, token: string, waterSourceId?: string, reviewId?: string): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    if (waterSourceId) formData.append('water_source_id', waterSourceId);
    if (reviewId) formData.append('review_id', reviewId);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Photo>(this.apiUrl, formData, { headers })
      .pipe(map(res => res.url));
  }


}