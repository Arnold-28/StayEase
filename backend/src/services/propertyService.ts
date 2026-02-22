// Property Management Service
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

export interface CreatePropertyInput {
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  amenities?: string[];
  basePrice: number;
  currency?: string;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  minNightStay?: number;
  maxNightStay?: number;
  bookingBuffer?: number;
}

export const createProperty = async (ownerId: string, input: CreatePropertyInput) => {
  try {
    const property = await prisma.property.create({
      data: {
        ownerId,
        title: input.title,
        description: input.description,
        category: input.category,
        location: input.location,
        city: input.city,
        state: input.state,
        country: input.country,
        zipCode: input.zipCode,
        latitude: input.latitude,
        longitude: input.longitude,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        guests: input.guests,
        amenities: input.amenities || [],
        basePrice: input.basePrice,
        currency: input.currency || 'USD',
        weeklyDiscount: input.weeklyDiscount || 0,
        monthlyDiscount: input.monthlyDiscount || 0,
        minNightStay: input.minNightStay || 1,
        maxNightStay: input.maxNightStay,
        bookingBuffer: input.bookingBuffer || 0,
        isActive: true,
        featured: false,
      },
      include: {
        images: true,
      },
    });

    logger.info(`Property created: ${property.id} by owner: ${ownerId}`);
    return property;
  } catch (error) {
    logger.error(`Property creation failed: ${error}`);
    throw new AppError(500, 'Failed to create property');
  }
};

export const getPropertyById = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          phone: true,
        },
      },
      images: {
        orderBy: { displayOrder: 'asc' },
      },
      reviews: {
        include: {
          guest: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      },
      bookings: {
        where: {
          status: {
            in: ['CONFIRMED', 'CHECKED_IN'],
          },
        },
        select: {
          checkInDate: true,
          checkOutDate: true,
        },
      },
    },
  });

  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  return property;
};

export const searchProperties = async (filters: any, limit: number = 20, offset: number = 0) => {
  const where: any = {
    isActive: true,
  };

  if (filters.city) {
    where.city = { contains: filters.city, mode: 'insensitive' };
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.guests) {
    where.guests = { gte: filters.guests };
  }

  if (filters.minPrice || filters.maxPrice) {
    where.basePrice = {};
    if (filters.minPrice) where.basePrice.gte = filters.minPrice;
    if (filters.maxPrice) where.basePrice.lte = filters.maxPrice;
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        images: {
          take: 1,
          orderBy: { displayOrder: 'asc' },
        },
        reviews: {
          select: { rating: true },
        },
      },
      skip: offset,
      take: limit,
      orderBy: filters.sortBy === 'price' ? { basePrice: 'asc' } : { createdAt: 'desc' },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    data: properties,
    total,
    page: Math.floor(offset / limit) + 1,
    pages: Math.ceil(total / limit),
  };
};

export const updateProperty = async (propertyId: string, ownerId: string, data: any) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  if (property.ownerId !== ownerId) {
    throw new AppError(403, 'You do not have permission to update this property');
  }

  try {
    const updated = await prisma.property.update({
      where: { id: propertyId },
      data,
      include: { images: true },
    });

    logger.info(`Property updated: ${propertyId}`);
    return updated;
  } catch (error) {
    logger.error(`Property update failed: ${error}`);
    throw new AppError(500, 'Failed to update property');
  }
};

export const deleteProperty = async (propertyId: string, ownerId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { bookings: true },
  });

  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  if (property.ownerId !== ownerId) {
    throw new AppError(403, 'You do not have permission to delete this property');
  }

  // Check for active bookings
  const activeBookings = property.bookings.filter((b: { status: string }) =>
    ['CONFIRMED', 'CHECKED_IN'].includes(b.status)
  );

  if (activeBookings.length > 0) {
    throw new AppError(409, 'Cannot delete property with active bookings');
  }

  try {
    await prisma.property.delete({
      where: { id: propertyId },
    });

    logger.info(`Property deleted: ${propertyId}`);
  } catch (error) {
    logger.error(`Property deletion failed: ${error}`);
    throw new AppError(500, 'Failed to delete property');
  }
};

export const getOwnerProperties = async (ownerId: string) => {
  return prisma.property.findMany({
    where: { ownerId },
    include: {
      images: {
        take: 1,
        orderBy: { displayOrder: 'asc' },
      },
      bookings: {
        select: { id: true, status: true },
      },
      reviews: {
        select: { rating: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const addUnavailableDate = async (propertyId: string, ownerId: string, date: Date, reason?: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  if (property.ownerId !== ownerId) {
    throw new AppError(403, 'You do not have permission to modify this property');
  }

  try {
    return await prisma.unavailableDate.create({
      data: {
        propertyId,
        date: new Date(date.toDateString()), // Reset time to 00:00:00
        reason,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new AppError(409, 'This date is already marked as unavailable');
    }
    throw new AppError(500, 'Failed to add unavailable date');
  }
};

export const removeUnavailableDate = async (propertyId: string, ownerId: string, date: Date) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, 'Property not found');
  }

  if (property.ownerId !== ownerId) {
    throw new AppError(403, 'You do not have permission to modify this property');
  }

  await prisma.unavailableDate.deleteMany({
    where: {
      propertyId,
      date: new Date(date.toDateString()),
    },
  });
};
