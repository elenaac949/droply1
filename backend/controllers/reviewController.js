const Review = require('../models/reviewModel');

/**
 * Crea una nueva valoración (review) asociada a una fuente de agua.
 * 
 * El estado inicial será `"pending"` hasta que sea moderada por un administrador.
 *
 * @route POST /reviews
 * @param {import('express').Request} req - Solicitud HTTP con `water_source_id`, `rating` y `comment`.
 * @param {import('express').Response} res - Respuesta HTTP con mensaje de confirmación.
 * @param {Function} next - Middleware de error.
 * @returns {void}
 */
exports.createReview = async (req, res, next) => {
  const { water_source_id, rating, comment } = req.body;
  const user_id = req.user.id;

  try {
    await Review.create({ water_source_id, user_id, rating, comment });
    res.status(201).json({ message: 'Valoración enviada para moderación' });
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

/**
 * Obtiene las valoraciones aprobadas de una fuente de agua específica.
 *
 * @route GET /reviews/source/:id
 * @param {import('express').Request} req - Solicitud con `id` de la fuente en los parámetros.
 * @param {import('express').Response} res - Lista de valoraciones aprobadas (`status = "approved"`).
 * @param {Function} next - Middleware de error.
 * @returns {void}
 */
exports.getReviewsByWaterSource = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await Review.getByWaterSource(id);
    res.status(200).json(rows);
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

/**
 * Obtiene todas las valoraciones, sin importar su estado.
 *
 * @route GET /reviews
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Lista completa de valoraciones.
 * @param {Function} next - Middleware de error.
 * @returns {void}
 */
exports.getAllReviews = async (req, res, next) => {
  try {
    const [rows] = await Review.getAll();
    res.status(200).json(rows);
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

/**
 * Cambia el estado de una valoración a `"approved"` o `"rejected"`.
 *
 * @route PATCH /reviews/:id
 * @param {import('express').Request} req - Solicitud con `id` de la review como parámetro y `status` en el body.
 * @param {import('express').Response} res - Respuesta con mensaje de éxito.
 * @param {Function} next - Middleware de error.
 * @returns {void}
 */
exports.moderateReview = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Estado no válido' });
  }

  try {
    await Review.moderate(id, status);
    res.status(200).json({ message: 'Estado actualizado correctamente' });
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

/**
 * Obtiene todas las valoraciones pendientes de moderación.
 *
 * @route GET /reviews/pending
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Lista de valoraciones con estado `"pending"`.
 * @param {Function} next - Middleware de error.
 * @returns {void}
 */
exports.getPending = async (req, res, next) => {
  try {
    const [rows] = await Review.getPending();
    res.status(200).json(rows);
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};
