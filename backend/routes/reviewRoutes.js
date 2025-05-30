const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, reviewController.createReview);
router.get('/source/:id', reviewController.getReviewsByWaterSource);
router.get('/', reviewController.getAllReviews);
router.put('/:id/moderate', authMiddleware, reviewController.moderateReview); 

module.exports = router;
