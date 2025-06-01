const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @route POST /reviews/
 * @desc Crea una nueva valoración (estado inicial: pending).
 * @access Privado (requiere autenticación)
 */
router.post('/', authMiddleware, reviewController.createReview);

/**
 * @route GET /reviews/source/:id
 * @desc Obtiene todas las valoraciones aprobadas de una fuente específica.
 * @access Público
 */
router.get('/source/:id', reviewController.getReviewsByWaterSource);

/**
 * @route GET /reviews/
 * @desc Obtiene todas las valoraciones (usado en panel admin).
 * @access Público o protegido según implementación futura
 */
router.get('/', reviewController.getAllReviews);

/**
 * @route GET /reviews/pending
 * @desc Devuelve todas las valoraciones en estado 'pending' (pendientes de moderación).
 * @access Público o protegido según implementación futura
 */
router.get('/pending', reviewController.getPending);

/**
 * @route PUT /reviews/:id/moderate
 * @desc Modera una valoración: cambia su estado a 'approved' o 'rejected'.
 * @access Privado (requiere autenticación, idealmente admin)
 */
router.put('/:id/moderate', authMiddleware, reviewController.moderateReview);

module.exports = router;
