// models/waterSource.js
const db = require('../util/database');

module.exports = class WaterSource {
    constructor(name, description, latitude, longitude, created_by) {
        this.name = name;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.created_by = created_by;
    }

    static save(waterSource) {
        return db.execute(
            `INSERT INTO water_sources (id, name, description, latitude, longitude, created_by) 
             VALUES (UUID(), ?, ?, ?, ?, ?)`,
            [
                waterSource.name,
                waterSource.description,
                waterSource.latitude,
                waterSource.longitude,
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
};
