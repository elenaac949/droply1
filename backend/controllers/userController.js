const User = require('../models/userModel');
const bcrypt = require('bcrypt');


/* Crear un nuevo usuario */
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
    // Verificar si el email ya existe
    const [existingUser] = await User.find(email);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hashear contraseña y guardar
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

/* editar un usuario */
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
/* comporbar que el email eciste */
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

/* Obtener todos los usuarios */
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

/* Borrar usuario */
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await User.deleteById(userId);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};

/* Obtener usuario por id */

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

