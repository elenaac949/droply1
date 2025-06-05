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
   * @param {string} type - Tipo de fuente (grifo, fuente ornamental, etc.).
   * @param {boolean} is_accessible - Si es accesible para personas con movilidad reducida.
   * @param {string} schedule - Horario de uso.
   * @param {string} country - País.
   * @param {string} city - Ciudad.
   * @param {string} postal_code - Código postal.
   * @param {string} address - Dirección textual.
   * @param {string} user_id - ID del usuario que la propuso.
   * @param {boolean} is_osm - Si proviene de OpenStreetMap.
   * @param {string} osm_id - ID de OSM.
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
   * Guarda una nueva fuente de agua en la base de datos.
   * @param {WaterSource} waterSource - Objeto fuente a guardar.
   * @returns {Promise}
   */
  static save(waterSource) {
    return db.execute(
      `INSERT INTO water_sources 
       (id, name, description, latitude, longitude, type, is_accessible, schedule, 
        country, city, postal_code, address, user_id, is_osm, osm_id, status)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        waterSource.id,
        waterSource.name,
        waterSource.description,
        waterSource.latitude,
        waterSource.longitude,
        waterSource.type,
        waterSource.is_accessible ?? false,
        waterSource.schedule,
        waterSource.country,
        waterSource.city,
        waterSource.postal_code,
        waterSource.address,
        waterSource.user_id ?? null,
        waterSource.is_osm ?? false,
        waterSource.osm_id ?? null,
        waterSource.status ?? 'approved'
      ]
    );
  }

  /**
   * Devuelve todas las fuentes con información del usuario que las creó.
   * @returns {Promise}
   */
  static fetchAll() {
    return db.execute(`
      SELECT 
        w.id, w.name, w.description, w.latitude, w.longitude,
        w.type, w.is_accessible, w.schedule, w.status, w.created_at,
        w.country, w.city, w.postal_code, w.address,
        u.username
      FROM water_sources w
      INNER JOIN users u ON w.user_id = u.id
      ORDER BY w.created_at DESC
    `);
  }

  /**
   * Busca una fuente por su ID.
   * @param {string} id - ID de la fuente.
   * @returns {Promise}
   */
  static findById(id) {
    return db.execute('SELECT * FROM water_sources WHERE id = ?', [id]);
  }

  /**
   * Devuelve todas las fuentes aprobadas (excepto las de OSM).
   * @returns {Promise}
   */
  static fetchApproved() {
    return db.execute(
      `SELECT id, name, latitude, longitude, type, is_accessible, description, schedule, status, created_at 
       FROM water_sources 
       WHERE status = ? AND (is_osm IS NULL OR is_osm = 0)`,
      ['approved']
    );
  }

  /**
   * Devuelve todas las fuentes pendientes de moderación.
   * @returns {Promise}
   */
  static fetchPending() {
    return db.execute(`
      SELECT 
        w.id, w.name, w.description, w.latitude, w.longitude,
        w.type, w.is_accessible, w.schedule, u.username, w.created_at,
        w.country, w.city, w.postal_code, w.address
      FROM water_sources w
      INNER JOIN users u ON w.user_id = u.id
      WHERE w.status = 'pending'
      ORDER BY w.created_at DESC
    `);
  }

  /**
   * Comprueba si ya existe una fuente en unas coordenadas casi iguales.
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise}
   */
  static existsAtCoordinates(latitude, longitude) {
    return db.execute(
      'SELECT COUNT(*) as count FROM water_sources WHERE ABS(latitude - ?) < 0.00001 AND ABS(longitude - ?) < 0.00001',
      [latitude, longitude]
    );
  }

  /**
   * Devuelve los datos básicos de una fuente sin reviews ni usuario.
   * @param {string} id - ID de la fuente.
   * @returns {Promise}
   */
  static getBasicById(id) {
    return db.execute('SELECT * FROM water_sources WHERE id = ?', [id]);
  }

  /**
   * Actualiza el estado ('approved', 'pending', 'rejected') de una fuente.
   * @param {string} id - ID de la fuente.
   * @param {string} status - Estado nuevo.
   * @returns {Promise}
   */
  static updateStatus(id, status) {
    return db.execute('UPDATE water_sources SET status = ? WHERE id = ?', [status, id]);
  }

  /**
   * Devuelve las valoraciones aprobadas asociadas a una fuente.
   * @param {string} waterSourceId - ID de la fuente.
   * @returns {Promise}
   */
  static getReviews(waterSourceId) {
    return db.execute(
      `SELECT r.rating, r.comment, r.created_at, u.username
       FROM reviews r
       INNER JOIN users u ON r.user_id = u.id
       WHERE r.water_source_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC`,
      [waterSourceId]
    );
  }

  /**
   * Elimina una fuente por su ID.
   * @param {string} id - ID de la fuente.
   * @returns {Promise}
   */
  static deleteById(id) {
    return db.execute('DELETE FROM water_sources WHERE id = ?', [id]);
  }

  /**
   * Actualiza todos los datos de una fuente.
   * @param {string} id - ID de la fuente.
   * @param {...any} campos - Nuevos valores para los campos.
   * @returns {Promise}
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
   * Busca una fuente por su ID de OpenStreetMap.
   * @param {string} osmId - ID de OSM.
   * @returns {Promise}
   */
  static findByOSMId(osmId) {
    return db.execute('SELECT * FROM water_sources WHERE osm_id = ?', [osmId]);
  }

  /* obtener la ultima fuente de agua teniendo en cuenta el usuairo y las coordendas */

  static async findLastByUser(user_id) {
  const query = `
    SELECT * FROM water_sources
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  try {
    const [rows] = await db.execute(query, [user_id]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  }
}




};
