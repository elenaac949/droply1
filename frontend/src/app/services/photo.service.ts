import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  private apiUrl = 'http://localhost:3000/api/photos';

  constructor(private http: HttpClient) { }

  uploadPhoto(file: File, waterSourceId: string, token: string): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('water_source_id', waterSourceId);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Photo>(this.apiUrl, formData, { headers })
      .pipe(
        map(response => response.url) // Extraer solo la URL de la respuesta
      );
  }
}