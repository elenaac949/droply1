// models/waterSource.js
const db = require('../util/database');

module.exports = class WaterSource {
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

  static save(waterSource) {
    return db.execute(
      `INSERT INTO water_sources 
     (id, name, description, latitude, longitude, type, is_accessible, schedule, 
      country, city, postal_code, address, user_id, is_osm, osm_id, status)
     VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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


  /* Obtener todas las fuentes de agua con el username de quien lo ha creado */
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


  static findById(id) {
    return db.execute('SELECT * FROM water_sources WHERE id = ?', [id]);
  }

  static fetchApproved() {
  return db.execute(
    `SELECT id, name, latitude, longitude, type, is_accessible, description, schedule, status, created_at 
     FROM water_sources 
     WHERE status = ? AND (is_osm IS NULL OR is_osm = 0)`,
    ['approved']
  );
}


  static fetchPending() {
    return db.execute(`
    SELECT 
      w.id,
      w.name,
      w.description,
      w.latitude,
      w.longitude,
      w.type,
      w.is_accessible,
      w.schedule,
      u.username,
      w.created_at,
      w.country,
      w.city,
      w.postal_code,
      w.address
    FROM water_sources w
    INNER JOIN users u ON w.user_id = u.id
    WHERE w.status = 'pending'
    ORDER BY w.created_at DESC
  `);
  }

  static existsAtCoordinates(latitude, longitude) {
    return db.execute(
      'SELECT COUNT(*) as count FROM water_sources WHERE ABS(latitude - ?) < 0.00001 AND ABS(longitude - ?) < 0.00001',
      [latitude, longitude]
    );
  }

  // Nueva función para obtener fuente con información básica (sin usuario ni reviews)
  static getBasicById(id) {
    return db.execute(
      'SELECT * FROM water_sources WHERE id = ?',
      [id]
    );
  }

  // Función para actualizar el estado de una fuente
  static updateStatus(id, status) {
    return db.execute(
      'UPDATE water_sources SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  // Función para obtener reviews de una fuente
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

  /* Borrar fuente concreta */
  static deleteById(id) {
    return db.execute('DELETE FROM water_sources WHERE id = ?', [id]);
  }

  /* actualizar la fuente de agia */
  static updateFull(id, name, description, latitude, longitude, type, is_accessible, schedule, country, city, postal_code, address) {
    return db.execute(`
    UPDATE water_sources 
    SET name = ?, description = ?, latitude = ?, longitude = ?, type = ?, is_accessible = ?, schedule = ?, 
        country = ?, city = ?, postal_code = ?, address = ?
    WHERE id = ?
  `, [name, description, latitude, longitude, type, is_accessible, schedule, country, city, postal_code, address, id]);
  }

  /* encontrar la fuente si es del osm */
  static findByOSMId(osmId) {
    return db.execute('SELECT * FROM water_sources WHERE osm_id = ?', [osmId]);
  }

};