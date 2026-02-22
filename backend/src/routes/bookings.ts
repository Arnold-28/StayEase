// Booking Routes
import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { bookingSchemas } from '../schemas/validation.js';
import * as bookingService from '../services/bookingService.js';
import * as propertyService from '../services/propertyService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Check Availability
router.post(
  '/check-availability',
  asyncHandler(async (req, res) => {
    const { propertyId, checkInDate, checkOutDate } = req.body;

    if (!propertyId || !checkInDate || !checkOutDate) {
      throw new AppError(400, 'Missing required fields');
    }

    const isAvailable = await bookingService.checkAvailability(
      propertyId,
      new Date(checkInDate),
      new Date(checkOutDate)
    );

    res.json({ available: isAvailable });
  })
);

// Calculate Price
router.post(
  '/calculate-price',
  asyncHandler(async (req, res) => {
    const { propertyId, checkInDate, checkOutDate } = req.body;

    if (!propertyId || !checkInDate || !checkOutDate) {
      throw new AppError(400, 'Missing required fields');
    }

    const pricing = await bookingService.calculateBookingPrice(
      propertyId,
      new Date(checkInDate),
      new Date(checkOutDate)
    );

    res.json(pricing);
  })
);

// Create Booking
router.post(
  '/',
  authenticate,
  authorize(['GUEST']),
  validateRequest(bookingSchemas.create),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { propertyId, checkInDate, checkOutDate, guests, guestMessage } = req.body;

    const property = await propertyService.getPropertyById(propertyId);

    const booking = await bookingService.createBooking(req.user!.userId, property.ownerId, {
      propertyId,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      guests,
      guestMessage,
    });

    res.status(201).json(booking);
  })
);

// Get Booking
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const booking = await bookingService.getBookingById(req.params.id, req.user!.userId);
    res.json(booking);
  })
);

// Get User Bookings
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const bookings = await bookingService.userBookings(
      req.user!.userId,
      req.user!.role,
      req.query.status as string | undefined
    );

    res.json(bookings);
  })
);

// Cancel Booking
router.post(
  '/:id/cancel',
  authenticate,
  validateRequest(bookingSchemas.cancel),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user!.userId,
      req.body.cancellationReason
    );

    res.json(booking);
  })
);

export default router;
