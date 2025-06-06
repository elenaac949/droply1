const express = require('express');
const { body } = require('express-validator');

const waterSourceController = require('../controllers/waterSourceController');
const authMiddleware = require('../middlewares/authMiddleware'); 

const router = express.Router();

/**
 * @route POST /water-sources/
 * @desc Crea una nueva fuente de agua.
 * @access Privado (requiere autenticación)
 * @validación:
 *  - name obligatorio
 *  - latitude y longitude con valores válidos
 */
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

/**
 * @route GET /water-sources/pending
 * @desc Obtiene todas las fuentes con estado "pending".
 * @access Privado (requiere autenticación)
 */
router.get('/pending', authMiddleware, waterSourceController.getPendingSources);

/**
 * @route GET /water-sources/approved
 * @desc Devuelve solo las fuentes con estado "approved" (para mostrar en el mapa).
 * @access Público
 */
router.get('/approved', waterSourceController.getApprovedWaterSources);

/**
 * @route GET /water-sources/osm/:osmId
 * @desc Devuelve una fuente según su ID de OpenStreetMap.
 * @access Público
 */
router.get('/osm/:osmId', waterSourceController.getByOSMId);

/**
 * @route GET /water-sources/latest/by-user
 * @desc Obtener la última fuente por usuario autenticado.
 * @access Privado (requiere autenticación)
 */
router.get(
  '/latest/by-user',
  authMiddleware,
  waterSourceController.getLastByUser
);

/**
 * @route GET /water-sources/
 * @desc Devuelve todas las fuentes con información de usuario.
 * @access Público
 */
router.get('/', waterSourceController.getAllWaterSources);

/**
 * @route PUT /water-sources/:id/status
 * @desc Actualiza el estado de una fuente ('pending', 'approved', 'rejected').
 * @access Privado (requiere autenticación)
 */
router.put('/:id/status', authMiddleware, waterSourceController.updateStatus);

/**
 * @route PUT /water-sources/:id
 * @desc Actualiza los datos de una fuente de agua.
 * @access Privado (requiere autenticación)
 */
router.put('/:id', authMiddleware, waterSourceController.updateWaterSource);

/**
 * @route DELETE /water-sources/:id
 * @desc Elimina una fuente de agua por su ID.
 * @access Privado (requiere autenticación)
 */
router.delete('/:id', authMiddleware, waterSourceController.deleteWaterSource);

/**
 * @route GET /water-sources/:id
 * @desc Obtiene una fuente por su ID.
 * @access Público
 */
router.get('/:id', waterSourceController.getById);

module.exports = router;
