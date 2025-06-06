const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

/**
 * Controlador para registrar un nuevo usuario.
 * 
 * Este controlador:
 * - Valida los datos recibidos mediante express-validator.
 * - Encripta la contraseña usando bcrypt.
 * - Guarda el nuevo usuario en la base de datos con rol 'user'.
 * 
 * @route POST /auth/signup
 * @param {import('express').Request} req - Solicitud HTTP con los datos del usuario (username, email, password, etc.).
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {Function} next - Función middleware para manejo de errores.
 * @returns {void}
 */
exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  // Si hay errores de validación, se devuelve un 422
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validación fallida.',
      errors: errors.array()
    });
  }

  const { username, email, password } = req.body;

  try {
    // Encriptar la contraseña con 12 rondas de hashing
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear objeto con los datos del usuario
    const userDetails = {
      username,
      email,
      password: hashedPassword,
      phone: req.body.phone || '',
      country: req.body.country || '',
      city: req.body.city || '',
      postal_code: req.body.postal_code || '',
      address: req.body.address || '',
      role: 'user' // Todos los usuarios nuevos son "user" por defecto
    };

    // Guardar en base de datos
    await User.save(userDetails);

    res.status(201).json({ message: 'Usuario registrado correctamente' });

  } catch (err) {
    // Si no se ha definido un statusCode, se asigna 500
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Controlador para iniciar sesión.
 * 
 * Este controlador:
 * - Verifica que el email exista en la base de datos.
 * - Compara la contraseña enviada con la almacenada.
 * - Si es válida, genera y devuelve un JWT con la información del usuario.
 * 
 * @route POST /auth/login
 * @param {import('express').Request} req - Solicitud HTTP con email y contraseña.
 * @param {import('express').Response} res - Respuesta HTTP con el token JWT.
 * @param {Function} next - Función middleware para manejo de errores.
 * @returns {void}
 */
exports.login = async (req, res, next) => {
  const errors = validationResult(req);

  // Validación de campos requeridos
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validación fallida.',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  try {
    // Buscar el usuario por email
    const [rows] = await User.find(email);

    if (rows.length === 0) {
      const error = new Error('Email o contraseña incorrectos.');
      error.statusCode = 401;
      throw error;
    }

    const user = rows[0];

    // Comprobar que la contraseña sea correcta
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Email o contraseña incorrectos');
      error.statusCode = 401;
      throw error;
    }

    // Generar token JWT con una duración de 6 horas
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_PRIVATE_KEY,
      { expiresIn: '6h' }
    );

    // Devolver token y datos del usuario
    res.status(200).json({
      token,
      userId: user.id,
      role: user.role,
      username: user.username,
    });

  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
