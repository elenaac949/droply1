const db = require('../util/database');

/**
 * Modelo Review - representa una valoración hecha por un usuario sobre una fuente de agua.
 */
module.exports = class Review {
  /**
   * Constructor para crear una instancia de Review.
   * @param {string} water_source_id - ID de la fuente de agua.
   * @param {string} user_id - ID del usuario que hace la valoración.
   * @param {number} rating - Valor numérico (1-5).
   * @param {string} comment - Comentario textual del usuario.
   */
  constructor(water_source_id, user_id, rating, comment) {
    this.water_source_id = water_source_id;
    this.user_id = user_id;
    this.rating = rating;
    this.comment = comment;
  }

  /**
   * Inserta una nueva valoración en la base de datos con estado inicial 'pending'.
   * @param {Review} review - Instancia con los datos de la valoración.
   * @returns {Promise} Resultado de la ejecución del INSERT.
   */
  static create(review) {
    return db.execute(
      `INSERT INTO reviews (id, water_source_id, user_id, rating, comment, status)
       VALUES (UUID(), ?, ?, ?, ?, 'pending')`,
      [review.water_source_id, review.user_id, review.rating, review.comment]
    );
  }

  /**
   * Obtiene todas las valoraciones aprobadas para una fuente concreta.
   * @param {string} water_source_id - ID de la fuente de agua.
   * @returns {Promise} Lista de valoraciones con username y fecha.
   */
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

  /**
   * Devuelve todas las valoraciones registradas, sin filtrar.
   * @returns {Promise} Lista de todas las valoraciones.
   */
  static getAll() {
    return db.execute(`SELECT * FROM reviews ORDER BY created_at DESC`);
  }

  /**
   * Devuelve todas las valoraciones con estado 'pending', incluyendo nombre del usuario y fuente.
   * @returns {Promise} Lista de valoraciones pendientes.
   */
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

  /**
   * Actualiza el estado de una valoración ('approved' o 'rejected').
   * @param {string} id - ID de la valoración.
   * @param {string} status - Nuevo estado.
   * @returns {Promise} Resultado de la actualización.
   */
  static moderate(id, status) {
    return db.execute(
      `UPDATE reviews SET status = ? WHERE id = ?`,
      [status, id]
    );
  }
};
