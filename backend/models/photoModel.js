const db = require('../util/database');

/**
 * Clase que representa una foto dentro del sistema.
 * Incluye métodos estáticos para guardar, buscar y eliminar fotos desde la base de datos.
 */
class Photo {
  constructor(data) {
    this.id = data.id;
    this.water_source_id = data.water_source_id;
    this.review_id = data.review_id;
    this.user_id = data.user_id;
    this.url = data.url;
    this.created_at = data.created_at;
  }

  /**
   * Guarda una nueva foto en la base de datos.
   * @param {Object} data - Datos de la foto.
   * @returns {Promise<boolean>}
   */
  static async save(data) {
    const query = `
      INSERT INTO photos (
        id, water_source_id, review_id, user_id,
        url, created_at
      )
      VALUES (UUID(), ?, ?, ?, ?, NOW())
    `;

    const values = [
      data.water_source_id || null,
      data.review_id || null,
      data.user_id,
      data.url
    ];

    try {
      await db.execute(query, values);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca una foto por su ID.
   * @param {string} id - ID de la foto.
   * @returns {Promise<Photo|null>}
   */
  static async findById(id) {
    const query = `
      SELECT p.*, 
             u.username as user_name,
             ws.name as water_source_name,
             r.comment as review_comment
      FROM photos p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN water_sources ws ON p.water_source_id = ws.id
      LEFT JOIN reviews r ON p.review_id = r.id
      WHERE p.id = ?
    `;

    try {
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new Photo(rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Devuelve todas las fotos con filtros opcionales.
   * @param {Object} filters - Filtros: water_source_id, review_id, user_id, limit.
   * @returns {Promise<Photo[]>}
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, 
             u.username as user_name,
             ws.name as water_source_name,
             r.comment as review_comment
      FROM photos p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN water_sources ws ON p.water_source_id = ws.id
      LEFT JOIN reviews r ON p.review_id = r.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.water_source_id) {
      query += ' AND p.water_source_id = ?';
      params.push(filters.water_source_id);
    }

    if (filters.review_id) {
      query += ' AND p.review_id = ?';
      params.push(filters.review_id);
    }

    if (filters.user_id) {
      query += ' AND p.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    query += ' ORDER BY p.created_at DESC';

    try {
      const [rows] = await db.execute(query, params);
      return rows.map(row => new Photo(row));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todas las fotos relacionadas con una fuente de agua.
   * @param {string} waterSourceId - ID de la fuente.
   * @returns {Promise<Photo[]>}
   */
  static async findByWaterSource(waterSourceId) {
    const query = `
      SELECT p.*, 
             u.username as user_name,
             ws.name as water_source_name,
             r.comment as review_comment
      FROM photos p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN water_sources ws ON p.water_source_id = ws.id
      LEFT JOIN reviews r ON p.review_id = r.id
      WHERE p.water_source_id = ?
      ORDER BY p.created_at DESC
    `;

    try {
      const [rows] = await db.execute(query, [waterSourceId]);
      return rows.map(row => new Photo(row));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todas las fotos relacionadas con una reseña.
   * @param {string} reviewId - ID de la review.
   * @returns {Promise<Photo[]>}
   */
  static async findByReview(reviewId) {
    return await this.findAll({ review_id: reviewId });
  }

  /**
   * Obtiene todas las fotos subidas por un usuario.
   * @param {string} userId - ID del usuario.
   * @returns {Promise<Photo[]>}
   */
  static async findByUser(userId) {
    return await this.findAll({ user_id: userId });
  }

  /**
   * Elimina una foto por su ID.
   * @param {string} id - ID de la foto.
   * @returns {Promise<boolean>} - True si se eliminó.
   */
  static async delete(id) {
    const query = 'DELETE FROM photos WHERE id = ?';

    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cuenta cuántas fotos ha subido un usuario.
   * @param {string} userId - ID del usuario.
   * @returns {Promise<number>} - Número de fotos.
   */
  static async countByUser(userId) {
    const query = 'SELECT COUNT(*) as count FROM photos WHERE user_id = ?';

    try {
      const [rows] = await db.execute(query, [userId]);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Photo;
