const db = require('../util/database');

class Photo {
  constructor(data) {
    this.id = data.id;
    this.water_source_id = data.water_source_id;
    this.review_id = data.review_id;
    this.user_id = data.user_id;
    this.url = data.url;
    this.status = data.status || 'pending';
    this.created_at = data.created_at;
  }

  // Crear una nueva foto
  static async save(data) {
  const query = `
    INSERT INTO photos (
      id, water_source_id, review_id, user_id,
      url, status, created_at
    )
    VALUES (UUID(), ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    data.water_source_id || null,
    data.review_id || null,
    data.user_id,
    data.url,
    data.status || 'pending'
  ];

  try {
    await db.execute(query, values);
    return true;
  } catch (error) {
    throw error;
  }
}


  // Encontrar foto por ID
  static async findById(id) {
    const query = `
      SELECT p.*, 
             u.username as user_name,
             ws.name as water_source_name,
             r.title as review_title
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

  // Obtener todas las fotos con filtros opcionales
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, 
             u.username as user_name,
             ws.name as water_source_name,
             r.title as review_title
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
    
    if (filters.status) {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    try {
      const [rows] = await db.execute(query, params);
      return rows.map(row => new Photo(row));
    } catch (error) {
      throw error;
    }
  }

  // Obtener fotos por fuente de agua
  static async findByWaterSource(waterSourceId) {
    return await this.findAll({ water_source_id: waterSourceId, status: 'approved' });
  }

  // Obtener fotos por review
  static async findByReview(reviewId) {
    return await this.findAll({ review_id: reviewId, status: 'approved' });
  }

  // Obtener fotos por usuario
  static async findByUser(userId) {
    return await this.findAll({ user_id: userId });
  }

  // Actualizar estado de la foto
  static async updateStatus(id, status) {
    const query = 'UPDATE photos SET status = ? WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [status, id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Foto no encontrada');
      }
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Eliminar foto
  static async delete(id) {
    const query = 'DELETE FROM photos WHERE id = ?';
    
    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Contar fotos por usuario
  static async countByUser(userId) {
    const query = 'SELECT COUNT(*) as count FROM photos WHERE user_id = ?';
    
    try {
      const [rows] = await db.execute(query, [userId]);
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Obtener fotos pendientes de moderación
  static async getPendingPhotos() {
    return await this.findAll({ status: 'pending' });
  }
}

module.exports = Photo;