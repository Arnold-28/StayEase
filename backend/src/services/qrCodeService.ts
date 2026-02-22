// QR Code Booking Service
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { generateQR, parseAndVerifyQR, QRPayload } from '../utils/qrcode.js';

const prisma = new PrismaClient();

export const generateBookingQRCode = async (bookingId: string, paymentIntentId?: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // QR valid for 30 days

    const payload: QRPayload = {
      bookingId,
      paymentIntentId,
      expiryDate: expiryDate.toISOString(),
      generatedAt: new Date().toISOString(),
    };

    const { qrString, imageUrl } = await generateQR(payload);

    // Extract signature from QR string
    const parsed = JSON.parse(qrString);
    const signature = parsed.signature;

    const qrCode = await prisma.qRCode.create({
      data: {
        bookingId,
        qrString,
        paymentIntentId,
        expiryDate,
        signature,
      },
    });

    logger.info(`QR code generated for booking: ${bookingId}`);

    return {
      qrCodeId: qrCode.id,
      qrString,
      imageUrl,
      expiryDate,
    };
  } catch (error) {
    logger.error(`QR code generation failed: ${error}`);
    throw new AppError(500, 'Failed to generate QR code');
  }
};

export const getBookingQRCode = async (bookingId: string) => {
  const qrCode = await prisma.qRCode.findUnique({
    where: { bookingId },
  });

  if (!qrCode) {
    throw new AppError(404, 'QR code not found');
  }

  return {
    qrCodeId: qrCode.id,
    qrString: qrCode.qrString,
    isVerified: qrCode.isVerified,
    verifiedAt: qrCode.verifiedAt,
    expiryDate: qrCode.expiryDate,
  };
};

export const verifyBookingQRCode = async (qrString: string) => {
  const verification = parseAndVerifyQR(qrString);

  if (!verification.valid) {
    throw new AppError(400, 'Invalid or expired QR code');
  }

  const data = verification.data as QRPayload;

  // Find the booking and QR code
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: {
      qrCode: true,
      property: true,
      guest: true,
    },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  // Check if QR already verified
  if (booking.qrCode?.isVerified) {
    throw new AppError(409, 'QR code already verified and used');
  }

  try {
    // Mark QR as verified
    const verifiedQR = await prisma.qRCode.update({
      where: { bookingId: data.bookingId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    logger.info(`QR code verified for booking: ${data.bookingId}`);

    return {
      valid: true,
      booking: {
        id: booking.id,
        reservationCode: booking.reservationCode,
        propertyTitle: booking.property.title,
        propertyLocation: booking.property.location,
        guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        nights: booking.nights,
        guests: booking.guests,
        status: booking.status,
      },
      verifiedAt: verifiedQR.verifiedAt,
    };
  } catch (error) {
    logger.error(`QR verification failed: ${error}`);
    throw new AppError(500, 'Failed to verify QR code');
  }
};

export const getQRCodeStatistics = async (ownerId: string) => {
  const qrCodes = await prisma.qRCode.findMany({
    where: {
      booking: {
        ownerId,
      },
    },
    include: {
      booking: true,
    },
  });

  return {
    total: qrCodes.length,
    verified: qrCodes.filter((qr: { isVerified: boolean }) => qr.isVerified).length,
    pending: qrCodes.filter((qr: { isVerified: boolean }) => !qr.isVerified).length,
    expired: qrCodes.filter((qr: { expiryDate: Date }) => qr.expiryDate < new Date()).length,
  };
};
