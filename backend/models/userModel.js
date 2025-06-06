const db = require('../util/database');

/**
 * Modelo User - gestiona operaciones relacionadas con los usuarios.
 */
module.exports = class User {
  /**
   * Constructor de usuario.
   * @param {string} username - Nombre de usuario.
   * @param {string} email - Correo electrónico.
   * @param {string} password - Contraseña encriptada.
   * @param {string} [role='user'] - Rol del usuario (por defecto 'user').
   * @param {string} [phone] - Teléfono.
   * @param {string} [country] - País.
   * @param {string} [city] - Ciudad.
   * @param {string} [postal_code] - Código postal.
   * @param {string} [address] - Dirección.
   * @param {string} [profile_picture] - URL de la foto de perfil.
   */
  constructor(username, email, password, role = 'user', phone = '', country = '', city = '', postal_code = '', address = '', profile_picture = '') {
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
    this.phone = phone;
    this.country = country;
    this.city = city;
    this.postal_code = postal_code;
    this.address = address;
    this.profile_picture = profile_picture;
  }

  /**
   * Busca un usuario por su email.
   * @param {string} email - Email del usuario a buscar.
   * @returns {Promise} Resultado de la búsqueda.
   */
  static find(email) {
    return db.execute('SELECT * FROM users WHERE email = ?', [email]);
  }

  /**
   * Guarda un nuevo usuario en la base de datos.
   * @param {User} user - Objeto con los datos del usuario.
   * @returns {Promise} Resultado de la inserción.
   */
  static save(user) {
    return db.execute(
      `INSERT INTO users 
      (username, email, password, role, phone, country, city, postal_code, address, profile_picture) 
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        user.username,
        user.email,
        user.password,
        user.role || 'user',
        user.phone || '',
        user.country || '',
        user.city || '',
        user.postal_code || '',
        user.address || '',
        user.profile_picture || ''
      ]
    );
  }

  /**
   * Devuelve todos los usuarios con rol 'user'.
   * @returns {Promise} Lista de usuarios.
   */
  static findAll() {
    return db.execute(`
      SELECT 
        id, username, email, role,
        phone, country, city, postal_code, address, profile_picture
      FROM users
      WHERE role = "user"
    `);
  }

  /**
   * Elimina un usuario por su ID.
   * @param {string} id - ID del usuario a eliminar.
   * @returns {Promise} Resultado de la eliminación.
   */
  static deleteById(id) {
    return db.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  /**
   * Actualiza los datos de un usuario.
   * @param {string} id - ID del usuario a actualizar.
   * @param {object} data - Datos actualizados del usuario.
   * @returns {Promise} Resultado de la actualización.
   */
  static update(id, data) {
    return db.execute(
      `UPDATE users 
       SET username = ?, email = ?, role = ?, phone = ?, country = ?, city = ?, postal_code = ?, address = ?, profile_picture = ?
       WHERE id = ?`,
      [
        data.username,
        data.email,
        data.role || 'user',
        data.phone || '',
        data.country || '',
        data.city || '',
        data.postal_code || '',
        data.address || '',
        id
      ]
    );
  }

  /**
   * Actualiza solo la foto de perfil del usuario.
   * @param {string} id - ID del usuario.
   * @param {string} profilePicturePath - Ruta relativa de la imagen.
   * @returns {Promise} Resultado de la actualización.
   */
  static updateProfilePicture(id, profilePicturePath) {
    return db.execute(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [profilePicturePath, id]
    );
  }

  /**
   * Elimina la foto de perfil de un usuario (la deja como NULL).
   * @param {string} id - ID del usuario.
   * @returns {Promise} Resultado de la actualización.
   */
  static deleteProfilePicture(id) {
    return db.execute('UPDATE users SET profile_picture = NULL WHERE id = ?', [id]);
  }

  /**
   * Busca un usuario por su ID.
   * @param {string} id - ID del usuario.
   * @returns {Promise} Usuario encontrado.
   */
  static findById(id) {
    return db.execute('SELECT * FROM users WHERE id = ?', [id]);
  }

  /**
   * Actualiza la contraseña de un usuario.
   * @param {string} userId - ID del usuario.
   * @param {string} hashedPassword - Nueva contraseña encriptada.
   * @returns {Promise} Resultado de la actualización.
   */
  static async updatePassword(userId, hashedPassword) {
    return db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
  }
};
