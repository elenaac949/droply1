const Review = require('../models/reviewModel');

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

/* exports.getReviewsByWaterSource = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await Review.getByWaterSource(id);
    res.status(200).json(rows);
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
}; */
exports.getReviewsByWaterSource = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await Review.getByWaterSource(id); // ya filtra por status='approved'
    res.status(200).json(rows);
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const [rows] = await Review.getAll();
    res.status(200).json(rows);
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

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
