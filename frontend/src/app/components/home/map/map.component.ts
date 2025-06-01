import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { OsmService } from '../../../services/osm.service';
import { HttpClient } from '@angular/common/http';
import 'leaflet.markercluster';
import { ReviewsComponent } from '../../reviews/reviews.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, ReviewsComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})

export class MapComponent implements AfterViewInit, OnChanges {
  @Input() useGeolocation = false;

  userIcon = L.icon({
    iconUrl: 'assets/icons/localizacion.png',
    iconSize: [40, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  dbSourceIcon = L.icon({
    iconUrl: 'assets/icons/gota.png',
    iconSize: [40, 41],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });


  map!: L.Map;
  userMarker?: L.Marker;
  osmCluster = L.markerClusterGroup();
  mySourcesCluster = L.markerClusterGroup();

  /* Control del modal de las valoraicones */
  selectedSourceId: string | null = null;

  openModal(id: string) {
    this.selectedSourceId = id;
  }

  closeModal() {
    this.selectedSourceId = null;
  }

  constructor(private http: HttpClient, private osmService: OsmService) { }

  ngAfterViewInit(): void {
    this.loadDefaultMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['useGeolocation'] && !changes['useGeolocation'].firstChange) {
      const before = changes['useGeolocation'].previousValue;
      const current = changes['useGeolocation'].currentValue;


      // Solo si se activa
      if (!before && current) {
        this.centerOnUserLocation();
      }

      console.log('ngOnChanges: useGeolocation =', this.useGeolocation);

      // Si se desactiva:el mapa se queda como está
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

  centerOnUserLocation(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocalización no soportada');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.map.setView([lat, lng], 15);

        if (this.userMarker) {
          this.userMarker.setLatLng([lat, lng]);
        } else {
          this.userMarker = L.marker([lat, lng], { icon: this.userIcon })
            .addTo(this.map)
            .bindPopup('Tú estás aquí')
            .openPopup();
        }
      },
      (error) => {
        console.error('Error al obtener ubicación del usuario', error);
      }
    );
  }

  loadMyWaterSources(): void {
    this.mySourcesCluster.clearLayers();

    this.http.get<any[]>('http://localhost:3000/api/water-sources/approved').subscribe(data => {
      data.forEach(f => {
        const typeMap: { [key: string]: string } = {
          drinking: 'Agua potable',
          tap: 'Grifo público',
          decorative: 'Fuente decorativa',
          bottle_refill: 'Recarga de botellas',
          natural_spring: 'Manantial',
          other: 'Otros'
        };

        const tooltipText = `
          <strong>${f.name || 'Desconocido'}</strong><br>
          ${f.description ? f.description : 'Descripción: Desconocida'}<br>
          Tipo: ${typeMap[f.type] || 'Desconocido'}<br>
          Accesible: ${f.is_accessible === true ? 'Sí' : f.is_accessible === false ? 'No' : 'Desconocido'}<br>
          Horario: ${f.schedule || 'Desconocido'}<br>
          Fecha: ${f.created_at ? new Date(f.created_at).toLocaleDateString() : 'Desconocida'}
        `;

        const marker = L.marker([f.latitude, f.longitude], { icon: this.dbSourceIcon })
          .bindTooltip(tooltipText, {
            direction: 'top',
            offset: [0, -10],
            opacity: 0.9
          })
          .on('click', () => this.openModal(f.id)) /* cuando hacemos click en el modal */
          ;

        this.mySourcesCluster.addLayer(marker);
      });
    });
  }

  loadOSMWaterSources(): void {
    this.osmCluster.clearLayers();

    const b = this.map.getBounds();
    this.osmService.getWaterSourcesByBounds(
      b.getSouth(), b.getWest(), b.getNorth(), b.getEast()
    ).subscribe((result: any) => {
      result.elements.forEach((el: any) => {
        const lat = el.lat;
        const lon = el.lon;
        const tags = el.tags || {};

        let tooltipText = `
          <strong>${tags.name || 'Fuente pública'}</strong><br>
          ${tags.description ? `<strong>Descripción:</strong> ${tags.description}<br>` : ''}
          ${tags.operator ? `<strong>Operador:</strong> ${tags.operator}<br>` : ''}
          ${tags.access ? `<strong>Acceso:</strong> ${tags.access}<br>` : ''}
          ${tags.note ? `<strong>Nota:</strong> ${tags.note}<br>` : ''}
          <strong>Lat:</strong> ${lat.toFixed(6)}, <strong>Lon:</strong> ${lon.toFixed(6)}
        `;


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
