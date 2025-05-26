import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { OsmService } from '../../services/osm.service';
import { HttpClient } from '@angular/common/http';
import 'leaflet.markercluster';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit {

  map!: L.Map;
  osmCluster = L.markerClusterGroup();
  mySourcesCluster = L.markerClusterGroup();

  myIcon = L.icon({
    iconUrl: 'assets/marker-icon-green.png', // Icono personalizado verde
    shadowUrl: 'assets/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  constructor(private http: HttpClient, private osmService: OsmService) {}

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([40.5, -3.7], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.addLayer(this.osmCluster);       // Añadir clúster de OSM
    this.map.addLayer(this.mySourcesCluster); // Añadir clúster propio

    this.loadMyWaterSources();
    this.loadOSMWaterSources();

    this.map.on('moveend', () => {
      const zoom = this.map.getZoom();
      if (zoom >= 5) {
        this.loadOSMWaterSources();
      } else {
        this.osmCluster.clearLayers();
      }
    });
  }

  // ✅ Tus fuentes desde el backend
  loadMyWaterSources() {
    this.mySourcesCluster.clearLayers();

    this.http.get<any[]>('/api/water-sources/approved').subscribe(data => {
      data.forEach(f => {
        const marker = L.marker([f.latitude, f.longitude], {
          icon: this.myIcon,
          title: f.name
        }).bindPopup(`<strong>${f.name}</strong><br>${f.description || ''}`);
        
        this.mySourcesCluster.addLayer(marker);
      });
    });
  }

  // ✅ Fuentes desde OSM
  loadOSMWaterSources() {
    this.osmCluster.clearLayers();

    const b = this.map.getBounds();
    this.osmService.getWaterSourcesByBounds(
      b.getSouth(), b.getWest(), b.getNorth(), b.getEast()
    ).subscribe((result: any) => {
      result.elements.forEach((el: any) => {
        const marker = L.marker([el.lat, el.lon])
          .bindPopup('Fuente pública (OSM)');
        this.osmCluster.addLayer(marker);
      });
    });
  }
}
