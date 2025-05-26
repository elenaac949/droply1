const express = require('express');
const { body } = require('express-validator');

const waterSourceController = require('../controllers/waterSource');
const authMiddleware = require('../middlewares/auth'); // Asegúrate que existe

const router = express.Router();

// Ruta para crear una nueva fuente de agua
router.post(
  '/',
  authMiddleware,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('El nombre es obligatorio.'),
    body('latitude')
      .notEmpty()
      .withMessage('La latitud es obligatoria.')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitud inválida.'),
    body('longitude')
      .notEmpty()
      .withMessage('La longitud es obligatoria.')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitud inválida.')
  ],
  waterSourceController.createWaterSource
);

// Ruta para listar todas las fuentes de agua
router.get('/', waterSourceController.getAllWaterSources);

// Ruta para mostrar las fuentes aprobadas (para el mapa)
router.get('/approved', waterSourceController.getApprovedWaterSources);

module.exports = router;
