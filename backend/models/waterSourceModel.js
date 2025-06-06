const db = require('../util/database');

/**
 * Modelo WaterSource - representa una fuente de agua pública.
 */
module.exports = class WaterSource {
  /**
   * Constructor de fuente de agua.
   * @param {string} name - Nombre de la fuente.
   * @param {string} description - Descripción adicional.
   * @param {number} latitude - Coordenada de latitud.
   * @param {number} longitude - Coordenada de longitud.
   * @param {string} type - Tipo de fuente.
   * @param {boolean} is_accessible - Accesibilidad.
   * @param {string} schedule - Horario.
   * @param {string} country - País.
   * @param {string} city - Ciudad.
   * @param {string} postal_code - Código postal.
   * @param {string} address - Dirección.
   * @param {string} user_id - ID del usuario.
   * @param {boolean} is_osm - Si proviene de OSM.
   * @param {string} osm_id - ID OSM.
   */
  constructor(name, description, latitude, longitude, type, is_accessible, schedule, country, city, postal_code, address, user_id, is_osm, osm_id) {
    this.name = name ?? null;
    this.description = description ?? null;
    this.latitude = latitude;
    this.longitude = longitude;
    this.type = type;
    this.is_accessible = is_accessible ?? null;
    this.schedule = schedule ?? null;
    this.country = country ?? null;
    this.city = city ?? null;
    this.postal_code = postal_code ?? null;
    this.address = address ?? null;
    this.user_id = user_id ?? null;
    this.is_osm = is_osm ?? false;
    this.osm_id = osm_id ?? null;
  }

  /**
   * Guarda una nueva fuente de agua.
   * @param {WaterSource} waterSource - Datos de la fuente.
   * @returns {Promise<string>} ID de la fuente.
   */
  static async save(waterSource) {
    const query = `
      INSERT INTO water_sources 
        (name, description, latitude, longitude, type, is_accessible, schedule,
         country, city, postal_code, address, user_id, is_osm, osm_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      waterSource.name ?? null,
      waterSource.description ?? null,
      parseFloat(waterSource.latitude ?? 0),
      parseFloat(waterSource.longitude ?? 0),
      waterSource.type ?? null,
      waterSource.is_accessible ?? false,
      waterSource.schedule ?? null,
      waterSource.country ?? null,
      waterSource.city ?? null,
      waterSource.postal_code ?? null,
      waterSource.address ?? null,
      waterSource.user_id ?? null,
      waterSource.is_osm ?? false,
      waterSource.osm_id ?? null,
      waterSource.status ?? 'pending'
    ];

    await db.execute(query, values);

    const [rows] = await db.execute(`
      SELECT id FROM water_sources 
      WHERE latitude = ? AND longitude = ? AND user_id = ?
      ORDER BY created_at DESC LIMIT 1
    `, [
      parseFloat(waterSource.latitude ?? 0), 
      parseFloat(waterSource.longitude ?? 0),
      waterSource.user_id
    ]);

    if (rows.length === 0) throw new Error('No se pudo recuperar el ID');
    return rows[0].id;
  }

  /**
   * Verifica si ya existe una fuente en las coordenadas.
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<any>}
   */
  static async existsAtCoordinates(latitude, longitude) {
    return db.execute(
      `SELECT COUNT(*) as count FROM water_sources WHERE ABS(latitude - ?) < 0.0001 AND ABS(longitude - ?) < 0.0001`,
      [parseFloat(latitude), parseFloat(longitude)]
    );
  }

  /**
   * Devuelve todas las fuentes.
   * @returns {Promise<any>}
   */
  static fetchAll() {
    return db.execute(`
      SELECT w.*, u.username 
      FROM water_sources w
      INNER JOIN users u ON w.user_id = u.id
      ORDER BY w.created_at DESC
    `);
  }

  /**
   * Busca una fuente por su ID.
   * @param {string} id 
   * @returns {Promise<any>}
   */
  static findById(id) {
    return db.execute('SELECT * FROM water_sources WHERE id = ?', [id]);
  }

  /**
   * Fuentes aprobadas que no son OSM.
   * @returns {Promise<any>}
   */
  static fetchApproved() {
    return db.execute(`
      SELECT id, name, latitude, longitude, type, is_accessible, description, schedule, status, created_at 
      FROM water_sources 
      WHERE status = ? AND (is_osm IS NULL OR is_osm = 0)
    `, ['approved']);
  }

  /**
   * Fuentes en estado pendiente.
   * @returns {Promise<any>}
   */
  static fetchPending() {
    return db.execute(`
      SELECT w.*, u.username 
      FROM water_sources w
      INNER JOIN users u ON w.user_id = u.id
      WHERE w.status = 'pending'
      ORDER BY w.created_at DESC
    `);
  }

  /**
   * Obtiene solo los datos básicos de una fuente.
   * @param {string} id 
   * @returns {Promise<any>}
   */
  static getBasicById(id) {
    return db.execute('SELECT * FROM water_sources WHERE id = ?', [id]);
  }

  /**
   * Actualiza el estado de una fuente.
   * @param {string} id 
   * @param {string} status 
   * @returns {Promise<any>}
   */
  static updateStatus(id, status) {
    return db.execute('UPDATE water_sources SET status = ? WHERE id = ?', [status, id]);
  }

  /**
   * Devuelve las valoraciones aprobadas de una fuente.
   * @param {string} waterSourceId 
   * @returns {Promise<any>}
   */
  static getReviews(waterSourceId) {
    return db.execute(`
      SELECT r.rating, r.comment, r.created_at, u.username
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.water_source_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
    `, [waterSourceId]);
  }

  /**
   * Elimina una fuente por ID.
   * @param {string} id 
   * @returns {Promise<any>}
   */
  static deleteById(id) {
    return db.execute('DELETE FROM water_sources WHERE id = ?', [id]);
  }

  /**
   * Actualiza los datos completos de una fuente.
   * @returns {Promise<any>}
   */
  static updateFull(id, name, description, latitude, longitude, type, is_accessible, schedule, country, city, postal_code, address) {
    return db.execute(`
      UPDATE water_sources 
      SET name = ?, description = ?, latitude = ?, longitude = ?, type = ?, is_accessible = ?, schedule = ?, 
          country = ?, city = ?, postal_code = ?, address = ?
      WHERE id = ?`,
      [name, description, latitude, longitude, type, is_accessible, schedule, country, city, postal_code, address, id]
    );
  }

  /**
   * Busca una fuente por su OSM ID.
   * @param {string} osmId 
   * @returns {Promise<any>}
   */
  static findByOSMId(osmId) {
    return db.execute('SELECT * FROM water_sources WHERE osm_id = ?', [osmId]);
  }

  /**
   * Devuelve la última fuente creada por el usuario.
   * @param {string} user_id 
   * @returns {Promise<any>}
   */
  static async findLastByUser(user_id) {
    const query = `
      SELECT * FROM water_sources
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [user_id]);
    return rows.length > 0 ? rows[0] : null;
  }
};
