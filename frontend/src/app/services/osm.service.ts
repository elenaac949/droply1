import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OsmService {
  private overpassUrl = 'https://overpass-api.de/api/interpreter';

  constructor(private http: HttpClient) {}

  getWaterSourcesByBounds(south: number, west: number, north: number, east: number) {
    const query = `
      [out:json][timeout:25];
      node["amenity"~"drinking_water|water_point"](\
${south},${west},${north},${east});
      out body;
    `;
    const url = `${this.overpassUrl}?data=${encodeURIComponent(query)}`;
    return this.http.get<any>(url);
  }
}
