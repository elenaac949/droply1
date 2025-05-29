const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

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
            username: username,
            email: email,
            password: hashedPassword
        }

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
    // 2) Buscar usuario por email
    const [rows] = await User.find(email);
    if (rows.length === 0) {// Email no encontrado, pero devolvemos mensaje genérico
      const error = new Error('Email o contraseña incorrectos.');
      error.statusCode = 401;
      throw error;
    }

    const user = rows[0];

    // 3) Verificar contraseña
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Email o contraseña incorrectos');
      error.statusCode = 401;
      throw error;
    }

    // 4) Generar JWT
    const token = jwt.sign(
      {
        email: user.email,
        userId: user.id   // O el campo que uses como identificador
      },
      process.env.JWT_PRIVATE_KEY, // Se guarda en una variable de entorno
      { expiresIn: '6h' }
    );

    // 5) Responder con token y datos
    res.status(200).json({
      token: token,
      userId: user.id
    });

  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
