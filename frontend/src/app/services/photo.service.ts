import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Photo {
  id?: string; 
  water_source_id?: string | null;
  review_id?: string | null;
  user_id: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private apiUrl = `${environment.apiUrl}/api/photos`;

  constructor(private http: HttpClient) { }

  uploadPhotos(files: File[], token: string, waterSourceId?: string): Observable<string[]> {
    return files.length
      ? forkJoin(files.map(file => this.uploadPhoto(file, token, waterSourceId)))
      : of([]);
  }


  private uploadPhoto(file: File, token: string, waterSourceId?: string, reviewId?: string): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    if (waterSourceId) formData.append('water_source_id', waterSourceId);
    if (reviewId) formData.append('review_id', reviewId);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<Photo>(this.apiUrl, formData, { headers })
      .pipe(map(res => res.url));
  }


}