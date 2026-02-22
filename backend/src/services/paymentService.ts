// Payment Processing Service
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../utils/config.js';
import logger from '../utils/logger.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

let stripe: Stripe;
let razorpay: any;

// Initialize payment providers
if (config.stripe.secretKey) {
  stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2023-10-16' } as any);
}

if (config.razorpay.keyId && config.razorpay.keySecret) {
  razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

export interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  currency: string;
  method: 'CARD' | 'WALLET' | 'BANK_TRANSFER';
  provider: 'STRIPE' | 'RAZORPAY';
}

export const createStripePaymentIntent = async (
  bookingId: string,
  amount: number,
  currency: string
): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  if (!stripe) {
    throw new AppError(500, 'Stripe not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        bookingId,
        platform: 'stayease',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret || '',
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    logger.error(`Stripe payment intent creation failed: ${error}`);
    throw new AppError(500, 'Failed to create payment intent');
  }
};

export const createRazorpayOrder = async (
  bookingId: string,
  amount: number,
  currency: string,
  customerEmail: string
): Promise<{ orderId: string; amount: number }> => {
  if (!razorpay) {
    throw new AppError(500, 'Razorpay not configured');
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Amount in paise
      currency: currency,
      receipt: bookingId,
      customer_notify: 1,
      notes: {
        bookingId,
        customerEmail,
        platform: 'stayease',
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
    };
  } catch (error) {
    logger.error(`Razorpay order creation failed: ${error}`);
    throw new AppError(500, 'Failed to create payment order');
  }
};

export const confirmStripePayment = async (paymentIntentId: string): Promise<boolean> => {
  if (!stripe) {
    throw new AppError(500, 'Stripe not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    logger.error(`Stripe payment confirmation failed: ${error}`);
    throw new AppError(500, 'Failed to confirm payment');
  }
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  if (!config.razorpay.keySecret) {
    throw new AppError(500, 'Razorpay not configured');
  }

  const hmac = crypto.createHmac('sha256', config.razorpay.keySecret);
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
};

export const recordPayment = async (
  bookingId: string,
  amount: number,
  currency: string,
  method: 'CARD' | 'WALLET' | 'BANK_TRANSFER',
  provider: 'STRIPE' | 'RAZORPAY',
  transactionId: string,
  paymentIntentId?: string
) => {
  try {
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency,
        method,
        provider,
        transactionId,
        paymentIntentId,
        status: 'COMPLETED',
      },
    });

    logger.info(`Payment recorded: ${payment.id} for booking: ${bookingId}`);
    return payment;
  } catch (error) {
    logger.error(`Payment recording failed: ${error}`);
    throw new AppError(500, 'Failed to record payment');
  }
};

export const getPayment = async (bookingId: string) => {
  return prisma.payment.findUnique({
    where: { bookingId },
  });
};

export const refundPayment = async (bookingId: string, reason: string) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    if (payment.provider === 'STRIPE' && payment.transactionId) {
      await stripe.refunds.create({
        payment_intent: payment.transactionId,
        reason: 'requested_by_customer',
        metadata: { refundRequest: reason },
      });
    } else if (payment.provider === 'RAZORPAY' && payment.transactionId) {
      await razorpay.payments.refund(payment.transactionId, {
        notes: {
          reason,
          bookingId,
        },
      });
    }

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        bookingId,
        amount: payment.amount,
        reason,
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });

    // Update payment status
    await prisma.payment.update({
      where: { bookingId },
      data: { status: 'REFUNDED' },
    });

    logger.info(`Refund processed: ${refund.id} for booking: ${bookingId}`);
    return refund;
  } catch (error) {
    logger.error(`Refund processing failed: ${error}`);
    throw new AppError(500, 'Failed to process refund');
  }
};

export const getRefund = async (bookingId: string) => {
  return prisma.refund.findUnique({
    where: { bookingId },
  });
};
