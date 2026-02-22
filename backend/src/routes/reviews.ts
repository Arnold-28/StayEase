// Review Routes
import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { reviewSchemas } from '../schemas/validation.js';
import * as reviewService from '../services/reviewService.js';

const router = Router();

// Create Review
router.post(
  '/',
  authenticate,
  authorize(['GUEST']),
  validateRequest(reviewSchemas.create),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const review = await reviewService.createReview(req.user!.userId, req.body);
    res.status(201).json(review);
  })
);

// Get Property Reviews
router.get(
  '/property/:propertyId',
  asyncHandler(async (req, res) => {
    const reviews = await reviewService.getPropertyReviews(
      req.params.propertyId,
      Number(req.query.limit) || 10
    );

    res.json(reviews);
  })
);

// Delete Review
router.delete(
  '/:id',
  authenticate,
  authorize(['GUEST']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await reviewService.deleteReview(req.params.id, req.user!.userId);
    res.json({ message: 'Review deleted successfully' });
  })
);

export default router;
