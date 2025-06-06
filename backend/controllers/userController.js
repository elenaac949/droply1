const User = require('../models/userModel');
const bcrypt = require('bcrypt');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

/**
 * Crea un nuevo usuario en la base de datos.
 * 
 * @route POST /users
 * @param {import('express').Request} req - Cuerpo con datos del usuario (username, email, password, etc.).
 * @param {import('express').Response} res - Respuesta HTTP con mensaje de éxito o error.
 */
exports.createUser = async (req, res) => {
  const {
    username, email, password,
    role, phone, country, city,
    postal_code, address, profile_picture
  } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
  }

  if (password.length < 7) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 7 caracteres' });
  }

  try {
    const [existingUser] = await User.find(email);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      phone,
      country,
      city,
      postal_code,
      address,
      profile_picture
    };

    await User.save(userData);
    res.status(201).json({ message: 'Usuario creado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

/**
 * Actualiza los datos de un usuario.
 * 
 * @route PUT /users/:id
 * @param {import('express').Request} req - Datos actualizados del usuario.
 * @param {import('express').Response} res - Confirmación de actualización.
 */
exports.updateUser = async (req, res) => {
  const {
    username, email, role, phone,
    country, city, postal_code, address, profile_picture
  } = req.body;
  const { id } = req.params;

  try {
    await User.update(id, {
      username,
      email,
      role,
      phone,
      country,
      city,
      postal_code,
      address,
      profile_picture
    });
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

/**
 * Verifica si un email ya está registrado.
 * 
 * @route GET /users/check-email?email=...
 * @param {import('express').Request} req - Query con el email.
 * @param {import('express').Response} res - { exists: boolean }
 */
exports.checkEmailExists = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ exists: false });
  }

  try {
    const [result] = await User.find(email);
    res.json({ exists: result.length > 0 });
  } catch (error) {
    console.error('Error al comprobar email:', error);
    res.status(500).json({ error: 'Error al comprobar el email' });
  }
};

/**
 * Obtiene la lista completa de usuarios.
 * 
 * @route GET /users
 * @param {import('express').Request} req 
 * @param {import('express').Response} res - Array de usuarios.
 */
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

/**
 * Elimina un usuario por su ID.
 * 
 * @route DELETE /users/:id
 * @param {import('express').Request} req - ID del usuario.
 * @param {import('express').Response} res - Mensaje de confirmación.
 */
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await User.deleteById(userId);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

/**
 * Obtiene un usuario por su ID.
 * 
 * @route GET /users/:id
 * @param {import('express').Request} req - ID del usuario.
 * @param {import('express').Response} res - Objeto del usuario o error 404.
 */
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await User.findById(id);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

/**
 * Verifica si la contraseña actual del usuario es correcta.
 * 
 * @route POST /users/:userId/verify-password
 * @param {import('express').Request} req - { currentPassword }
 * @param {import('express').Response} res - { valid: boolean }
 */
exports.verifyPassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword } = req.body;

  try {
    const [rows] = await User.findById(userId);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ valid: false });
    }

    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al verificar contraseña' });
  }
};

/**
 * Actualiza la contraseña de un usuario.
 * 
 * @route PATCH /users/:id/password
 * @param {import('express').Request} req - { currentPassword, newPassword }
 * @param {import('express').Response} res - Mensaje de éxito o error.
 */
exports.updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.params.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  try {
    const [rows] = await User.findById(userId);
    const user = rows[0];

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashedPassword);

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al cambiar la contraseña' });
  }
};

/**
 * Sube una imagen de perfil.
 * 
 * @route PUT /users/:id/profile-picture
 * @param {import('express').Request} req - Imagen en el cuerpo.
 * @param {import('express').Response} res - URL subida o error.
 */
exports.uploadProfilePicture = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No se ha subido ningún archivo' });
  }

  try {
    const [user] = await User.findById(id);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const relativePath = `/uploads/profile-pictures/${req.file.filename}`;
    await User.updateProfilePicture(id, relativePath);
    const fullUrl = `${req.protocol}://${req.get('host')}${relativePath}`;

    return res.status(200).json({
      success: true,
      message: 'Imagen de perfil actualizada',
      imageUrl: fullUrl
    });

  } catch (error) {
    console.error('Error detallado:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    return res.status(500).json({
      success: false,
      error: 'Error al procesar la imagen',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Elimina la imagen de perfil de un usuario.
 * 
 * @route DELETE /users/:id/profile-picture
 * @param {import('express').Request} req - ID del usuario.
 * @param {import('express').Response} res - Mensaje de confirmación.
 */
exports.deleteProfilePicture = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await User.findById(id);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

    const user = rows[0];

    if (user.profile_picture) {
      const filePath = path.join(__dirname, '..', user.profile_picture);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await User.deleteProfilePicture(id);
    res.json({ success: true, message: 'Foto de perfil eliminada' });
  } catch (err) {
    console.error('Error al eliminar la foto de perfil:', err);
    res.status(500).json({ error: 'Error al eliminar la imagen' });
  }
};
