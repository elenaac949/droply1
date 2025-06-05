import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { OsmService } from '../../../services/osm.service';
import { HttpClient } from '@angular/common/http';
import { ReviewsComponent } from '../../reviews/reviews.component';
import { CommonModule } from '@angular/common';
import { WaterSource, WaterSourceService } from '../../../services/water-source.service';

/**
 * @component MapComponent
 * 
 * Componente responsable de mostrar un mapa con fuentes de agua.
 * Integra datos tanto desde OpenStreetMap como desde la base de datos interna,
 * permitiendo filtrado y visualización agrupada mediante clusters.
 */
@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, ReviewsComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit, OnChanges {

  /**
   * @input useGeolocation Indica si el mapa debe centrarse en la ubicación del usuario.
   */
  @Input() useGeolocation = false;

  /**
   * @input filters Objeto de filtros aplicados desde el componente padre.
   * @property type Tipo de fuente de agua (por ejemplo, 'drinking').
   * @property accessible Si la fuente es accesible (true/false).
   */
  @Input() filters: { type?: string; accessible?: boolean } = {};

  /** Icono de ubicación del usuario */
  userIcon = L.icon({
    iconUrl: 'assets/icons/localizacion.png',
    iconSize: [40, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  /** Icono para fuentes desde base de datos */
  dbSourceIcon = L.icon({
    iconUrl: 'assets/icons/gota.png',
    iconSize: [40, 41],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  /** Icono por defecto para marcadores */
  defaultIcon = L.icon({
    iconUrl: 'assets/icons/marker-icon.png',
    shadowUrl: 'assets/icons/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  /** Mapa de Leaflet */
  map!: L.Map;

  /** Marcador del usuario (geolocalización) */
  userMarker?: L.Marker;

  /** Cluster de fuentes desde OpenStreetMap */
  osmCluster = L.markerClusterGroup();

  /** Cluster de fuentes desde la base de datos */
  mySourcesCluster = L.markerClusterGroup();

  /** ID de la fuente seleccionada (para abrir modal de reseñas) */
  selectedSourceId: string | null = null;

  constructor(
    private osmService: OsmService,
    private waterSourceService: WaterSourceService
  ) { }

  /**
   * @method ngAfterViewInit
   * Inicializa el mapa al cargar el componente.
   */
  ngAfterViewInit(): void {
    this.loadDefaultMap();
  }

  /**
   * @method ngOnChanges
   * Responde a cambios en los inputs (`useGeolocation` y `filters`).
   * 
   * @param changes Cambios en los inputs del componente
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['useGeolocation'] && !changes['useGeolocation'].firstChange) {
      if (changes['useGeolocation'].currentValue) {
        this.centerOnUserLocation();
      }
    }

    if (changes['filters'] && !changes['filters'].firstChange) {
      this.loadMyWaterSources();
    }
  }

  /**
   * @method openModal
   * Abre el modal de reseñas para la fuente seleccionada.
   * 
   * @param id ID de la fuente de agua
   */
  openModal(id: string): void {
    this.selectedSourceId = id;
  }

  /**
   * @method closeModal
   * Cierra el modal de reseñas.
   */
  closeModal(): void {
    this.selectedSourceId = null;
  }

  /**
   * @method loadDefaultMap
   * Configura el mapa base, añade capas y carga las fuentes iniciales.
   */
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

    this.map.on('moveend', () => {
      if (this.map.getZoom() >= 13) {
        this.loadOSMWaterSources();
      }
    });
  }

  /**
   * @method centerOnUserLocation
   * Centra el mapa en la posición geográfica del usuario.
   */
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

  /**
   * @method loadMyWaterSources
   * Carga las fuentes de la base de datos que están aprobadas.
   * Aplica los filtros de tipo y accesibilidad si están definidos.
   */
  loadMyWaterSources(): void {
    this.mySourcesCluster.clearLayers();

    this.waterSourceService.getApprovedSources().subscribe((data: WaterSource[]) => {
      const filtered = data.filter(f => {
        const matchType = !this.filters.type || f.type === this.filters.type;

        const accessibleValue = f.is_accessible; // puede ser 0, 1 o null
        const filterValue = this.filters.accessible; // true, false o undefined

        const matchAccess =
          filterValue === undefined ||
          (filterValue === true && accessibleValue === 1) ||
          (filterValue === false && accessibleValue === 0);

        return matchType && matchAccess;
      });

      filtered.forEach(f => {
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
        ${f.description || 'Descripción: Desconocida'}<br>
        Tipo: ${typeMap[f.type] || 'Desconocido'}<br>
        Accesible: ${f.is_accessible === 1
            ? 'Sí'
            : f.is_accessible === 0
              ? 'No'
              : 'Desconocido'
          }<br>
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

  /**
   * @method loadOSMWaterSources
   * Carga fuentes de agua desde OpenStreetMap según los límites visibles del mapa.
   */
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
   * @method handleOSMReview
   * Al hacer clic en una fuente OSM, intenta encontrarla en la base de datos.
   * Si no existe, la crea automáticamente.
   * 
   * @param osmSource Fuente de agua desde OpenStreetMap
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
