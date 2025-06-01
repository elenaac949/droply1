const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

/**
 * Controlador para registrar un nuevo usuario.
 * 
 * Valida los datos de entrada, encripta la contraseña y guarda el usuario en la base de datos.
 * 
 * @route POST /auth/signup
 * @param {Request} req - Solicitud HTTP con los datos del usuario (username, email, password, etc.).
 * @param {Response} res - Respuesta HTTP.
 * @param {Function} next - Middleware de error.
 * @returns {JSON} Mensaje de confirmación.
 */
exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validación fallida.',
      errors: errors.array()
    });
  }

  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const userDetails = {
      username,
      email,
      password: hashedPassword,
      phone: req.body.phone || '',
      country: req.body.country || '',
      city: req.body.city || '',
      postal_code: req.body.postal_code || '',
      address: req.body.address || '',
      role: 'user'
    };

    await User.save(userDetails);

    res.status(201).json({ message: 'Usuario registrado correctamente' });

  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

/**
 * Controlador para iniciar sesión.
 * 
 * Verifica las credenciales y devuelve un token JWT con los datos del usuario.
 * 
 * @route POST /auth/login
 * @param {Request} req - Solicitud HTTP con email y contraseña.
 * @param {Response} res - Respuesta HTTP con el token JWT.
 * @param {Function} next - Middleware de error.
 * @returns {JSON} Objeto con token, userId, role y username.
 */
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validación fallida.',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;
  try {
    const [rows] = await User.find(email);
    if (rows.length === 0) {
      const error = new Error('Email o contraseña incorrectos.');
      error.statusCode = 401;
      throw error;
    }

    const user = rows[0];
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Email o contraseña incorrectos');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_PRIVATE_KEY,
      { expiresIn: '6h' }
    );

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
