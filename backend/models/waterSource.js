// models/waterSource.js
const db = require('../util/database');

module.exports = class WaterSource {
  constructor(name, description, latitude, longitude, type, is_accessible, schedule, created_by) {
    this.name = name;
    this.description = description;
    this.latitude = latitude;
    this.longitude = longitude;
    this.type = type;
    this.is_accessible = is_accessible;
    this.schedule = schedule;
    this.created_by = created_by;
  }

  static save(waterSource) {
    return db.execute(
      `INSERT INTO water_sources 
       (id, name, description, latitude, longitude, type, is_accessible, schedule, created_by)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        waterSource.name,
        waterSource.description,
        waterSource.latitude,
        waterSource.longitude,
        waterSource.type,
        waterSource.is_accessible,
        waterSource.schedule,
        waterSource.created_by
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

  static existsAtCoordinates(latitude, longitude) {
    return db.execute(
      'SELECT COUNT(*) as count FROM water_sources WHERE ABS(latitude - ?) < 0.00001 AND ABS(longitude - ?) < 0.00001',
      [latitude, longitude]
    );
  }
};
