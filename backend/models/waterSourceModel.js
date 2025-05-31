// models/waterSource.js
const db = require('../util/database');

module.exports = class WaterSource {
  constructor(name, description, latitude, longitude, type, is_accessible, schedule, country, city, postal_code, address, user_id) {
    this.name = name;
    this.description = description;
    this.latitude = latitude;
    this.longitude = longitude;
    this.type = type;
    this.is_accessible = is_accessible;
    this.schedule = schedule;
    this.country = country;
    this.city = city;
    this.postal_code = postal_code;
    this.address = address;
    this.user_id = user_id;
  }

  static save(waterSource) {
    return db.execute(
      `INSERT INTO water_sources 
       (id, name, description, latitude, longitude, type, is_accessible, schedule, country, city, postal_code, address, user_id)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        waterSource.name,
        waterSource.description,
        waterSource.latitude,
        waterSource.longitude,
        waterSource.type,
        waterSource.is_accessible,
        waterSource.schedule,
        waterSource.country,
        waterSource.city,
        waterSource.postal_code,
        waterSource.address,
        waterSource.user_id
      ]
    );
  }

  static fetchAll() {
    return db.execute('SELECT * FROM water_sources');
  }

  static findById(id) {
    return db.execute('SELECT * FROM water_sources WHERE id = ?', [id]);
  }

  static fetchApproved() {
    return db.execute(
      `SELECT id, name, latitude, longitude, type, is_accessible, description, schedule, status, created_at 
       FROM water_sources WHERE status = ?`,
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
};