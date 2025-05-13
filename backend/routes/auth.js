const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.post(
  '/signup',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('El nombre de usuario es obligatorio.'),

    body('email')
      .isEmail()
      .withMessage('Por favor introduce un correo válido.')
      .custom(async (email) => {
        const [existingUsers] = await User.find(email);
        if (existingUsers.length > 0) {
          return Promise.reject('Este correo ya existe.');
        }
      })
      .normalizeEmail(),

    body('password')
      .trim()
      .isLength({ min: 7 })
      .withMessage('La contraseña debe tener al menos 7 caracteres.')
  ],
  authController.signup
);

module.exports = router;
