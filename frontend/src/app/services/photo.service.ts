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
  public_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}


export interface PhotoUploadResponse {
  success: boolean;
  message: string;
  url: string;
  data: Photo;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private apiUrl = `${environment.apiUrl}/api/photos`;

  constructor(private http: HttpClient) { }

  /**
   * Sube múltiples fotos al servidor
   * @param files Array de archivos a subir
   * @param token Token de autenticación
   * @param waterSourceId ID de la fuente de agua (opcional)
   * @param reviewId ID de la reseña (opcional)
   * @returns Observable con array de URLs de las fotos subidas
   */
  uploadPhotos(files: File[], token: string, waterSourceId?: string, reviewId?: string): Observable<string[]> {
    return files.length
      ? forkJoin(files.map(file => this.uploadPhoto(file, token, waterSourceId, reviewId)))
      : of([]);
  }

  /**
   * Sube una sola foto al servidor
   * @param file Archivo a subir
   * @param token Token de autenticación
   * @param waterSourceId ID de la fuente de agua (opcional)
   * @param reviewId ID de la reseña (opcional)
   * @returns Observable con la URL de la foto subida
   */
  private uploadPhoto(file: File, token: string, waterSourceId?: string, reviewId?: string): Observable<string> {
    const formData = new FormData();
    formData.append('photo', file);

    if (waterSourceId) formData.append('water_source_id', waterSourceId);
    if (reviewId) formData.append('review_id', reviewId);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<PhotoUploadResponse>(`${this.apiUrl}/upload`, formData, { headers })
      .pipe(map(res => res.url));
  }


  /**
   * Obtiene una foto por ID
   * @param id ID de la foto
   * @param token Token de autenticación
   * @returns Observable con la foto
   */
  getPhotoById(id: string, token: string): Observable<Photo> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ success: boolean, data: Photo }>(`${this.apiUrl}/${id}`, { headers })
      .pipe(map(res => res.data));
  }

  /**
   * Obtiene todas las fotos con filtros opcionales
   * @param filters Filtros de búsqueda
   * @param token Token de autenticación
   * @returns Observable con array de fotos
   */
  getAllPhotos(filters: {
    water_source_id?: string,
    review_id?: string,
    user_id?: string,
    status?: string,
    limit?: number
  } = {}, token: string): Observable<Photo[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const url = params.toString() ? `${this.apiUrl}?${params.toString()}` : this.apiUrl;

    return this.http.get<{ success: boolean, data: Photo[], count: number }>(url, { headers })
      .pipe(map(res => res.data));
  }

  /**
   * Obtiene fotos de una fuente de agua específica
   * @param waterSourceId ID de la fuente de agua
   * @param token Token de autenticación
   * @returns Observable con array de fotos
   */
  getPhotosByWaterSource(waterSourceId: string, token: string): Observable<Photo[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ success: boolean, data: Photo[], count: string }>(`${this.apiUrl}/water-source/${waterSourceId}`, { headers })
      .pipe(map(res => res.data));
  }

  /**
   * Obtiene fotos de una reseña específica
   * @param reviewId ID de la reseña
   * @param token Token de autenticación
   * @returns Observable con array de fotos
   */
  getPhotosByReview(reviewId: string, token: string): Observable<Photo[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ success: boolean, data: Photo[], count: number }>(`${this.apiUrl}/review/${reviewId}`, { headers })
      .pipe(map(res => res.data));
  }

  /**
   * Obtiene las fotos del usuario actual
   * @param token Token de autenticación
   * @returns Observable con array de fotos del usuario
   */
  getMyPhotos(token: string): Observable<Photo[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ success: boolean, data: Photo[], count: number }>(`${this.apiUrl}/my-photos`, { headers })
      .pipe(map(res => res.data));
  }

  /**
   * Actualiza el estado de una foto (para moderación)
   * @param id ID de la foto
   * @param status Nuevo estado
   * @param token Token de autenticación
   * @returns Observable con la foto actualizada
   */
  updatePhotoStatus(id: string, status: 'pending' | 'approved' | 'rejected', token: string): Observable<Photo> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<{ success: boolean, data: Photo }>(`${this.apiUrl}/${id}/status`, { status }, { headers })
      .pipe(map(res => res.data));
  }

  /**
   * Elimina una foto
   * @param id ID de la foto
   * @param token Token de autenticación
   * @returns Observable con resultado de la eliminación
   */
  deletePhoto(id: string, token: string): Observable<{ success: boolean, message: string }> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<{ success: boolean, message: string }>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Obtiene fotos pendientes de moderación (solo admin)
   * @param token Token de autenticación
   * @returns Observable con array de fotos pendientes
   */
  getPendingPhotos(token: string): Observable<Photo[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ success: boolean, data: Photo[], count: number }>(`${this.apiUrl}/pending`, { headers })
      .pipe(map(res => res.data));
  }
}