const express = require('express');
const { body } = require('express-validator');

const waterSourceController = require('../controllers/waterSourceController');
const authMiddleware = require('../middlewares/authMiddleware'); 

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
/* poner el pending antes para que express no malinterprete las rutas */

router.get('/pending', authMiddleware, waterSourceController.getPendingSources);
// Ruta para mostrar las fuentes aprobadas (para el mapa)
router.get('/approved', waterSourceController.getApprovedWaterSources);

/* actualizar el estado de la fuente */
router.put('/:id/status', authMiddleware, waterSourceController.updateStatus);

/* actualizar la fuente de agua */
router.put('/:id', authMiddleware, waterSourceController.updateWaterSource);


/* borrar fuente de agua */
router.delete('/:id', authMiddleware, waterSourceController.deleteWaterSource);
/* obtener una fuente de agua por su id*/
router.get('/:id', waterSourceController.getById);



module.exports = router;
