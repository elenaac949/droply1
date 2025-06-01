const Review = require('../models/reviewModel');

/**
 * Crea una nueva valoración (review) asociada a una fuente de agua.
 * El estado inicial será "pending" hasta que sea moderada.
 *
 * @route POST /reviews
 * @param {Request} req - Solicitud HTTP con water_source_id, rating y comment.
 * @param {Response} res - Respuesta con mensaje de confirmación.
 * @param {Function} next - Middleware para manejar errores.
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
 * @param {Request} req - Solicitud con el ID de la fuente como parámetro.
 * @param {Response} res - Lista de valoraciones aprobadas.
 * @param {Function} next - Middleware para manejar errores.
 */
exports.getReviewsByWaterSource = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await Review.getByWaterSource(id); // Filtrado por status = 'approved'
    res.status(200).json(rows);
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

/**
 * Obtiene todas las valoraciones (reviews), independientemente de su estado.
 *
 * @route GET /reviews
 * @param {Request} req - Solicitud HTTP.
 * @param {Response} res - Lista de todas las valoraciones.
 * @param {Function} next - Middleware para manejar errores.
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
 * Cambia el estado de una valoración (review) a 'approved' o 'rejected'.
 *
 * @route PATCH /reviews/:id
 * @param {Request} req - Solicitud con ID de la review como parámetro y nuevo estado en el body.
 * @param {Response} res - Mensaje de estado actualizado.
 * @param {Function} next - Middleware para manejar errores.
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
 * Obtiene todas las valoraciones pendientes de aprobación.
 *
 * @route GET /reviews/pending
 * @param {Request} req - Solicitud HTTP.
 * @param {Response} res - Lista de valoraciones con estado 'pending'.
 * @param {Function} next - Middleware para manejar errores.
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
