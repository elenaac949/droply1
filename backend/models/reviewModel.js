const db = require('../util/database');

module.exports = class Review {
  constructor(water_source_id, user_id, rating, comment) {
    this.water_source_id = water_source_id;
    this.user_id = user_id;
    this.rating = rating;
    this.comment = comment;
  }

  /* Crear valoraciones */
  static create(review) {
    return db.execute(
      `INSERT INTO reviews (id, water_source_id, user_id, rating, comment, status)
       VALUES (UUID(), ?, ?, ?, ?, 'pending')`,
      [review.water_source_id, review.user_id, review.rating, review.comment]
    );
  }

  /* Obtener valoraciones relacioonadas con una fuente de agua */

  static getByWaterSource(water_source_id) {
    return db.execute(
      `SELECT r.rating, r.comment, r.created_at, u.username
     FROM reviews r
     INNER JOIN users u ON r.user_id = u.id
     WHERE r.water_source_id = ? AND r.status = 'approved'
     ORDER BY r.created_at DESC`,
      [water_source_id]
    );
  }


  /* Obtener todas las valoraciones */
  static getAll() {
    return db.execute(`SELECT * FROM reviews ORDER BY created_at DESC`);
  }


  /* Obtener todas las valoraciones pendientes */
  static getPending() {
    return db.execute(`
    SELECT 
      r.id, 
      r.rating, 
      r.comment, 
      r.status, 
      r.created_at,
      u.username AS username,
      w.name AS source_name
    FROM reviews r
    INNER JOIN users u ON r.user_id = u.id
    INNER JOIN water_sources w ON r.water_source_id = w.id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
  `);
  }


  /* moderar */
  static moderate(id, status) {
    return db.execute(
      `UPDATE reviews SET status = ? WHERE id = ?`,
      [status, id]
    );
  }
};
