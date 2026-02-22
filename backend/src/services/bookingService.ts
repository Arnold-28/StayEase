// Booking Service with Availability Validation
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface CreateBookingInput {
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  guestMessage?: string;
}

export const checkAvailability = async (propertyId: string, checkIn: Date, checkOut: Date): Promise<boolean> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  // Check minimum night stay
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  if (nights < property.minNightStay) {
    throw new AppError(400, `Minimum ${property.minNightStay} nights required`);
  }

  if (property.maxNightStay && nights > property.maxNightStay) {
    throw new AppError(400, `Maximum ${property.maxNightStay} nights allowed`);
  }

  // Check for conflicting bookings
  const conflicts = await prisma.booking.findFirst({
    where: {
      propertyId,
      status: {
        in: ['CONFIRMED', 'CHECKED_IN'],
      },
      OR: [
        {
          checkInDate: { lt: checkOut },
          checkOutDate: { gt: checkIn },
        },
      ],
    },
  });

  if (conflicts) {
    return false;
  }

  // Check unavailable dates
  const unavailableDates = await prisma.unavailableDate.findMany({
    where: {
      propertyId,
      date: {
        gte: new Date(checkIn.toDateString()),
        lt: new Date(checkOut.toDateString()),
      },
    },
  });

  return unavailableDates.length === 0;
};

export const calculateBookingPrice = async (
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<{ nights: number; pricePerNight: number; subtotal: number; tax: number; serviceFee: number; total: number }> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  let pricePerNight = property.basePrice;

  // Apply weekly discount
  if (nights >= 7 && property.weeklyDiscount) {
    pricePerNight *= 1 - property.weeklyDiscount / 100;
  }

  // Apply monthly discount
  if (nights >= 30 && property.monthlyDiscount) {
    pricePerNight *= 1 - property.monthlyDiscount / 100;
  }

  const subtotal = pricePerNight * nights;
  const tax = subtotal * 0.1; // 10% tax
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + tax + serviceFee;

  return {
    nights,
    pricePerNight,
    subtotal,
    tax,
    serviceFee,
    total,
  };
};

export const createBooking = async (guestId: string, ownerId: string, input: CreateBookingInput) => {
  // Validate property
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
  });

  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  // Validate availability
  const isAvailable = await checkAvailability(input.propertyId, input.checkInDate, input.checkOutDate);
  if (!isAvailable) {
    throw new AppError(409, 'Property is not available for selected dates');
  }

  // Calculate price
  const pricing = await calculateBookingPrice(input.propertyId, input.checkInDate, input.checkOutDate);

  // Validate guest count
  if (input.guests > property.guests) {
    throw new AppError(400, `Property can accommodate maximum ${property.guests} guests`);
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        propertyId: input.propertyId,
        guestId,
        ownerId,
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        nights: pricing.nights,
        guests: input.guests,
        pricePerNight: pricing.pricePerNight,
        subtotal: pricing.subtotal,
        tax: pricing.tax,
        serviceFee: pricing.serviceFee,
        total: pricing.total,
        currency: property.currency,
        status: 'PENDING_PAYMENT',
        reservationCode: `RES-${uuidv4().slice(0, 8).toUpperCase()}`,
        guestMessage: input.guestMessage,
      },
      include: {
        property: true,
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Booking created: ${booking.id}`);
    return booking;
  } catch (error) {
    logger.error(`Booking creation failed: ${error}`);
    throw new AppError(500, 'Failed to create booking');
  }
};

export const getBookingById = async (bookingId: string, userId?: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: {
        include: {
          images: { take: 5 },
        },
      },
      guest: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      qrCode: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  // Check authorization
  if (userId && booking.guestId !== userId && booking.ownerId !== userId) {
    throw new AppError(403, 'You do not have permission to view this booking');
  }

  return booking;
};

export const userBookings = async (userId: string, role: string, status?: string) => {
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (role === 'GUEST') {
    where.guestId = userId;
  } else if (role === 'OWNER') {
    where.ownerId = userId;
  }

  return prisma.booking.findMany({
    where,
    include: {
      property: {
        select: {
          id: true,
          title: true,
          city: true,
          basePrice: true,
          images: { take: 1 },
        },
      },
      guest: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const confirmBooking = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  if (booking.status !== 'PENDING_PAYMENT') {
    throw new AppError(409, 'Booking cannot be confirmed from current status');
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' },
    include: { property: true, guest: true },
  });
};

export const cancelBooking = async (bookingId: string, userId: string, cancellationReason: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  // Only guest or owner can cancel
  if (booking.guestId !== userId && booking.ownerId !== userId) {
    throw new AppError(403, 'You do not have permission to cancel this booking');
  }

  // Cannot cancel completed bookings
  if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
    throw new AppError(409, 'Cannot cancel booking with current status');
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      cancellationReason,
      cancelledAt: new Date(),
    },
    include: { property: true },
  });
};
