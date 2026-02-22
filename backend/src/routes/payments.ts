// Payment Routes
import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { paymentLimiter } from '../middleware/security.js';
import * as paymentService from '../services/paymentService.js';
import * as bookingService from '../services/bookingService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Create Stripe Payment Intent
router.post(
  '/stripe/create-intent',
  authenticate,
  paymentLimiter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
      throw new AppError(400, 'Booking ID required');
    }

    const booking = await bookingService.getBookingById(bookingId, req.user!.userId);

    if (booking.status !== 'PENDING_PAYMENT') {
      throw new AppError(409, 'Booking is not awaiting payment');
    }

    const { clientSecret, paymentIntentId } = await paymentService.createStripePaymentIntent(
      bookingId,
      booking.total,
      booking.currency
    );

    res.json({ clientSecret, paymentIntentId });
  })
);

// Confirm Stripe Payment
router.post(
  '/stripe/confirm',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { bookingId, paymentIntentId } = req.body;

    if (!bookingId || !paymentIntentId) {
      throw new AppError(400, 'Booking ID and Payment Intent ID required');
    }

    const booking = await bookingService.getBookingById(bookingId, req.user!.userId);

    const isConfirmed = await paymentService.confirmStripePayment(paymentIntentId);

    if (!isConfirmed) {
      throw new AppError(400, 'Payment not confirmed');
    }

    const payment = await paymentService.recordPayment(
      bookingId,
      booking.total,
      booking.currency,
      'CARD',
      'STRIPE',
      paymentIntentId,
      paymentIntentId
    );

    // Confirm booking
    await bookingService.confirmBooking(bookingId);

    res.json({ payment, message: 'Payment completed and booking confirmed' });
  })
);

// Create Razorpay Order
router.post(
  '/razorpay/create-order',
  authenticate,
  paymentLimiter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
      throw new AppError(400, 'Booking ID required');
    }

    const booking = await bookingService.getBookingById(bookingId, req.user!.userId);

    if (booking.status !== 'PENDING_PAYMENT') {
      throw new AppError(409, 'Booking is not awaiting payment');
    }

    const { orderId, amount } = await paymentService.createRazorpayOrder(
      bookingId,
      booking.total,
      booking.currency,
      booking.guest.email
    );

    res.json({ orderId, amount });
  })
);

// Verify Razorpay Payment
router.post(
  '/razorpay/verify',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { bookingId, paymentId, orderId, signature } = req.body;

    if (!bookingId || !paymentId || !orderId || !signature) {
      throw new AppError(400, 'Missing payment verification data');
    }

    const isValid = paymentService.verifyRazorpaySignature(orderId, paymentId, signature);

    if (!isValid) {
      throw new AppError(400, 'Invalid payment signature');
    }

    const booking = await bookingService.getBookingById(bookingId, req.user!.userId);

    const payment = await paymentService.recordPayment(
      bookingId,
      booking.total,
      booking.currency,
      'CARD',
      'RAZORPAY',
      paymentId,
      orderId
    );

    // Confirm booking
    await bookingService.confirmBooking(bookingId);

    res.json({ payment, message: 'Payment verified and booking confirmed' });
  })
);

// Get Payment
router.get(
  '/:bookingId',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const payment = await paymentService.getPayment(req.params.bookingId);

    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    res.json(payment);
  })
);

// Request Refund
router.post(
  '/:bookingId/refund',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { reason } = req.body;

    if (!reason) {
      throw new AppError(400, 'Refund reason required');
    }

    const booking = await bookingService.getBookingById(req.params.bookingId, req.user!.userId);

    // Only guest can request refund
    if (booking.guestId !== req.user!.userId) {
      throw new AppError(403, 'Only the guest can request a refund');
    }

    const refund = await paymentService.refundPayment(req.params.bookingId, reason);

    res.json(refund);
  })
);

export default router;
