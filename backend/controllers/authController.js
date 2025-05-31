const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validación fallida.',
      errors: errors.array()
    });
  }


  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;


  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const userDetails = {
      username: req.body.username,
      email: req.body.email,
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
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}


exports.login = async (req, res, next) => {
  // 1) Comprobar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validación fallida.',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;
  try {
    // Buscar usuario por email
    const [rows] = await User.find(email);
    if (rows.length === 0) {// Email no encontrado, pero devolvemos mensaje genérico
      const error = new Error('Email o contraseña incorrectos.');
      error.statusCode = 401;
      throw error;
    }

    const user = rows[0];

    // Verificar contraseña
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Email o contraseña incorrectos');
      error.statusCode = 401;
      throw error;
    }

    // 4) Generar JWT
    const token = jwt.sign(
      {
        userId: user.id,   // O el campo que uses como identificador
        role: user.role
      },
      process.env.JWT_PRIVATE_KEY, // Se guarda en una variable de entorno
      { expiresIn: '6h' }
    );

    // 5) Responder con token y datos
    res.status(200).json({
      token: token,       // Para autenticación
      userId: user.id,    // Para referencia rápida
      role: user.role,    // Para lógica de frontend
      username: user.username,  // Para mostrar en UI
    });

  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
