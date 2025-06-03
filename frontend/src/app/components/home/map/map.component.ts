import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { OsmService } from '../../../services/osm.service';
import { HttpClient } from '@angular/common/http';
import { ReviewsComponent } from '../../reviews/reviews.component';
import { CommonModule } from '@angular/common';
import { WaterSource, WaterSourceService } from '../../../services/water-source.service';

/**
 * Componente de mapa Leaflet para mostrar fuentes de agua (base de datos + OSM).
 * Permite centrarse en la ubicación del usuario, agrupar marcadores, y abrir un modal de valoraciones.
 */
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, ReviewsComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit, OnChanges {

  /** Determina si se debe centrar el mapa en la ubicación del usuario */
  @Input() useGeolocation = false;

  /** Icono de marcador para la ubicación del usuario */
  userIcon = L.icon({
    iconUrl: 'assets/icons/localizacion.png',
    iconSize: [40, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  /** Icono de marcador para fuentes de agua desde la base de datos */
  dbSourceIcon = L.icon({
    iconUrl: 'assets/icons/gota.png',
    iconSize: [40, 41],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  defaultIcon = L.icon({
    iconUrl: 'assets/leaflet/marker-icon.png',
    shadowUrl: 'assets/leaflet/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  
  /** Mapa Leaflet */
  map!: L.Map;

  /** Marcador del usuario (si se usa geolocalización) */
  userMarker?: L.Marker;

  /** Grupo de marcadores para fuentes OSM */
  osmCluster = L.markerClusterGroup();

  /** Grupo de marcadores para fuentes internas de la base de datos */
  mySourcesCluster = L.markerClusterGroup();

  /** Fuente seleccionada para mostrar modal de valoraciones */
  selectedSourceId: string | null = null;

  constructor(
    private http: HttpClient,
    private osmService: OsmService,
    private waterSourceService: WaterSourceService
  ) { }

  /** Hook que se ejecuta después de montar la vista: inicializa el mapa */
  ngAfterViewInit(): void {
    this.loadDefaultMap();
  }

  /** Hook que detecta cambios en los inputs. Centra el mapa si se activa la geolocalización */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['useGeolocation'] && !changes['useGeolocation'].firstChange) {
      const before = changes['useGeolocation'].previousValue;
      const current = changes['useGeolocation'].currentValue;

      if (!before && current) {
        this.centerOnUserLocation();
      }

      console.log('ngOnChanges: useGeolocation =', this.useGeolocation);
    }
  }

  /**
   * Abre el modal de valoraciones para la fuente indicada.
   * @param id ID de la fuente seleccionada
   */
  openModal(id: string): void {
    this.selectedSourceId = id;
  }

  /** Cierra el modal de valoraciones */
  closeModal(): void {
    this.selectedSourceId = null;
  }

  /** Inicializa el mapa Leaflet con capas base y clústeres de marcadores */
  loadDefaultMap(): void {
    this.map = L.map('map').setView([40.5, -3.7], 11);
    L.Marker.prototype.options.icon = this.defaultIcon;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.addLayer(this.osmCluster);
    this.map.addLayer(this.mySourcesCluster);

    this.loadMyWaterSources();
    this.loadOSMWaterSources();

    // Recargar fuentes OSM cuando el usuario se mueva en el mapa
    this.map.on('moveend', () => {
      const zoom = this.map.getZoom();
      if (zoom >= 13) {
        this.loadOSMWaterSources();
      }
    });
  }

  /** Centra el mapa en la ubicación del usuario y coloca un marcador */
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

  /** Carga fuentes aprobadas desde la base de datos y las agrega al mapa */
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
          .bindTooltip(tooltipText, { direction: 'top', offset: [0, -10], opacity: 0.9 })
          .on('click', () => this.openModal(f.id));

        this.mySourcesCluster.addLayer(marker);
      });
    });
  }

  /** Carga fuentes públicas desde OpenStreetMap en función de los límites visibles del mapa */
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

        const tooltipText = `
          <strong>${tags.name || 'Fuente pública'}</strong><br>
          ${tags.description ? `<strong>Descripción:</strong> ${tags.description}<br>` : ''}
          ${tags.operator ? `<strong>Operador:</strong> ${tags.operator}<br>` : ''}
          ${tags.access ? `<strong>Acceso:</strong> ${tags.access}<br>` : ''}
          ${tags.note ? `<strong>Nota:</strong> ${tags.note}<br>` : ''}
          <strong>Lat:</strong> ${lat.toFixed(6)}, <strong>Lon:</strong> ${lon.toFixed(6)}
        `;

        const marker = L.marker([lat, lon])
          .bindTooltip(tooltipText, { direction: 'top', offset: [0, -10], opacity: 0.9 })
          .on('click', () => this.handleOSMReview(el));

        this.osmCluster.addLayer(marker);
      });
    });
  }

  /**
   * Al hacer clic en una fuente OSM, comprueba si ya existe en la base de datos.
   * Si existe, abre el modal. Si no, la crea automáticamente y luego abre el modal.
   * @param osmSource Objeto de fuente OSM
   */
  handleOSMReview(osmSource: any): void {
    const osmId = osmSource.id;

    this.waterSourceService.getByOSMId(osmId).subscribe(existingSource => {
      if (existingSource) {
        this.openModal(existingSource.id);
      } else {
        const newSource: Partial<WaterSource> = {
          name: osmSource.tags.name || 'Fuente OSM sin nombre',
          latitude: osmSource.lat,
          longitude: osmSource.lon,
          type: 'other',
          is_osm: true,
          osm_id: osmId,
          status: 'approved'
        };

        this.waterSourceService.createSource(newSource).subscribe(saved => {
          this.openModal(saved.id);
        });
      }
    });
  }
}
