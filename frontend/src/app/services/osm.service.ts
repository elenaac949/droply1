import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/**
 * Servicio para obtener fuentes de agua desde OpenStreetMap
 * mediante la API Overpass.
 */
@Injectable({ providedIn: 'root' })
export class OsmService {

  /** URL base de la API Overpass */
  private overpassUrl = 'https://overpass-api.de/api/interpreter';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene fuentes de agua públicas dentro de un área geográfica.
   * 
   * Utiliza una consulta Overpass para encontrar nodos con `amenity=drinking_water`
   * o `water_point` dentro del rectángulo delimitado por las coordenadas.
   * 
   * @param south Latitud sur del área
   * @param west Longitud oeste del área
   * @param north Latitud norte del área
   * @param east Longitud este del área
   * @returns Observable con los resultados en formato JSON
   */
  getWaterSourcesByBounds(south: number, west: number, north: number, east: number) {
    const query = `
      [out:json][timeout:25];
      node["amenity"~"drinking_water|water_point"](${south},${west},${north},${east});
      out body;
    `;
    const url = `${this.overpassUrl}?data=${encodeURIComponent(query)}`;
    return this.http.get<any>(url);
  }
}
