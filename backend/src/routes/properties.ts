// Property Routes
import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth.js';
import { validateRequest, validateQuery } from '../middleware/validation.js';
import { propertySchemas } from '../schemas/validation.js';
import * as propertyService from '../services/propertyService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Create Property (Owner only)
router.post(
  '/',
  authenticate,
  authorize(['OWNER']),
  validateRequest(propertySchemas.create),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const property = await propertyService.createProperty(req.user!.userId, req.body);
    res.status(201).json(property);
  })
);

// Search Properties (Public)
router.get(
  '/search',
  validateQuery(propertySchemas.search),
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const result = await propertyService.searchProperties(req.query, limit, offset);
    res.json(result);
  })
);

// Get ALL Properties (Public - with pagination)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const result = await propertyService.searchProperties({}, limit, offset);
    res.json(result);
  })
);

// Get Property Details
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const property = await propertyService.getPropertyById(req.params.id);
    res.json(property);
  })
);

// Get Owner's Properties
router.get(
  '/owner/:ownerId/properties',
  asyncHandler(async (req, res) => {
    const properties = await propertyService.getOwnerProperties(req.params.ownerId);
    res.json(properties);
  })
);

// Update Property
router.patch(
  '/:id',
  authenticate,
  authorize(['OWNER']),
  validateRequest(propertySchemas.update),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const property = await propertyService.updateProperty(
      req.params.id,
      req.user!.userId,
      req.body
    );
    res.json(property);
  })
);

// Delete Property
router.delete(
  '/:id',
  authenticate,
  authorize(['OWNER']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await propertyService.deleteProperty(req.params.id, req.user!.userId);
    res.json({ message: 'Property deleted successfully' });
  })
);

// Add Unavailable Date
router.post(
  '/:id/unavailable-dates',
  authenticate,
  authorize(['OWNER']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { date, reason } = req.body;

    if (!date) {
      throw new AppError(400, 'Date is required');
    }

    const unavailableDate = await propertyService.addUnavailableDate(
      req.params.id,
      req.user!.userId,
      new Date(date),
      reason
    );

    res.status(201).json(unavailableDate);
  })
);

// Remove Unavailable Date
router.delete(
  '/:id/unavailable-dates/:date',
  authenticate,
  authorize(['OWNER']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await propertyService.removeUnavailableDate(
      req.params.id,
      req.user!.userId,
      new Date(req.params.date)
    );

    res.json({ message: 'Unavailable date removed' });
  })
);

export default router;
