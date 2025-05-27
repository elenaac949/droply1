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

  osmCluster = L.markerClusterGroup();       // Clúster para fuentes OSM
  mySourcesCluster = L.markerClusterGroup(); // Clúster para tus propias fuentes
  userMarker?: L.Marker;

  constructor(private http: HttpClient, private osmService: OsmService) { }

  ngAfterViewInit(): void {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        if (!this.map) {
          // Crear mapa solo la primera vez
          this.map = L.map('map').setView([userLat, userLng], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(this.map);

          this.map.addLayer(this.osmCluster);
          this.map.addLayer(this.mySourcesCluster);

          this.loadMyWaterSources();
          this.loadOSMWaterSources();

          this.map.on('moveend', () => {
            const zoom = this.map.getZoom();
            if (zoom >= 13) {
              this.loadOSMWaterSources();
            }
          });
        }

        // ⬅️ Aquí: actualiza el marcador de la ubicación actual
        if (this.userMarker) {
          this.userMarker.setLatLng([userLat, userLng]);
        } else {
          this.userMarker = L.marker([userLat, userLng])
            .addTo(this.map)
            .bindPopup('Tú estás aquí')
            .openPopup();
        }
      },
      (error) => {
        console.error('Geolocalización no disponible. Cargando vista por defecto.', error);
        this.loadDefaultMap();
      }
    );
  } else {
    console.warn('Geolocalización no soportada');
    this.loadDefaultMap();
  }
}


  loadDefaultMap(): void {
    this.map = L.map('map').setView([40.5, -3.7], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.addLayer(this.osmCluster);
    this.map.addLayer(this.mySourcesCluster);

    this.loadMyWaterSources();
    this.loadOSMWaterSources();

    this.map.on('moveend', () => {
      const zoom = this.map.getZoom();
      if (zoom >= 13) {
        this.loadOSMWaterSources();
      }
    });
  }


  // uentes desde el backend
  loadMyWaterSources() {
    this.mySourcesCluster.clearLayers();

    this.http.get<any[]>('http://localhost:3000/api/water-sources/approved').subscribe(data => {
      data.forEach(f => {
        const marker = L.marker([f.latitude, f.longitude])
          .bindPopup(`<strong>${f.name}</strong><br>${f.description || ''}`);
        this.mySourcesCluster.addLayer(marker);
      });
    });
  }

  // Fuentes desde OSM
  loadOSMWaterSources() {
  this.osmCluster.clearLayers();

  const b = this.map.getBounds();
  this.osmService.getWaterSourcesByBounds(
    b.getSouth(), b.getWest(), b.getNorth(), b.getEast()
  ).subscribe((result: any) => {
    result.elements.forEach((el: any) => {
      const lat = el.lat;
      const lon = el.lon;
      const tags = el.tags || {};

      // Generar texto para el tooltip
      let tooltipText = 'Fuente pública';
      if (tags.name) tooltipText += `: ${tags.name}`;
      if (tags.description) tooltipText += `\n${tags.description}`;
      if (tags.operator) tooltipText += `\nOperador: ${tags.operator}`;
      if (tags.access) tooltipText += `\nAcceso: ${tags.access}`;
      if (tags.note) tooltipText += `\nNota: ${tags.note}`;

      const marker = L.marker([lat, lon])
        .bindTooltip(tooltipText, {
          direction: 'top',
          offset: [0, -10],
          opacity: 0.9
        });

      this.osmCluster.addLayer(marker);
    });
  });
}

}
