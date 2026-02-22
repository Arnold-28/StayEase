// QR Code Routes
import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth.js';
import * as qrCodeService from '../services/qrCodeService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Generate QR Code for Booking
router.post(
  '/:bookingId/generate',
  authenticate,
  authorize(['OWNER', 'GUEST']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { paymentIntentId } = req.body;
    const qrCode = await qrCodeService.generateBookingQRCode(req.params.bookingId, paymentIntentId);
    res.status(201).json(qrCode);
  })
);

// Get QR Code
router.get(
  '/:bookingId',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const qrCode = await qrCodeService.getBookingQRCode(req.params.bookingId);
    res.json(qrCode);
  })
);

// Verify QR Code (For check-in at property)
router.post(
  '/verify',
  authenticate,
  authorize(['OWNER']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { qrString } = req.body;

    if (!qrString) {
      throw new AppError(400, 'QR string required');
    }

    const result = await qrCodeService.verifyBookingQRCode(qrString);
    res.json(result);
  })
);

// Get QR Statistics (For Owner Dashboard)
router.get(
  '/statistics',
  authenticate,
  authorize(['OWNER']),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const stats = await qrCodeService.getQRCodeStatistics(req.user!.userId);
    res.json(stats);
  })
);

export default router;
