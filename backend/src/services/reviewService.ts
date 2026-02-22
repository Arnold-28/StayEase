// Review Service
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

export interface CreateReviewInput {
  propertyId: string;
  rating: number;
  cleanliness?: number;
  accuracy?: number;
  communication?: number;
  location?: number;
  value?: number;
  comment?: string;
}

export const createReview = async (guestId: string, input: CreateReviewInput) => {
  // Check if guest has completed booking
  const completedBooking = await prisma.booking.findFirst({
    where: {
      propertyId: input.propertyId,
      guestId,
      status: 'COMPLETED',
    },
  });

  if (!completedBooking) {
    throw new AppError(400, 'You can only review properties after completing a stay');
  }

  // Check if already reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      propertyId_guestId: {
        propertyId: input.propertyId,
        guestId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(409, 'You have already reviewed this property');
  }

  try {
    const review = await prisma.review.create({
      data: {
        propertyId: input.propertyId,
        guestId,
        rating: input.rating,
        cleanliness: input.cleanliness,
        accuracy: input.accuracy,
        communication: input.communication,
        location: input.location,
        value: input.value,
        comment: input.comment,
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    // Update property rating
    await updatePropertyRating(input.propertyId);

    logger.info(`Review created: ${review.id}`);
    return review;
  } catch (error) {
    logger.error(`Review creation failed: ${error}`);
    throw new AppError(500, 'Failed to create review');
  }
};

export const updatePropertyRating = async (propertyId: string) => {
  const reviews = await prisma.review.findMany({
    where: { propertyId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return;
  }

  const avgRating =
    reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) /
    reviews.length;

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      totalRating: Math.round(avgRating * 100) / 100,
      reviewCount: reviews.length,
    },
  });
};

export const getPropertyReviews = async (propertyId: string, limit: number = 10) => {
  return prisma.review.findMany({
    where: { propertyId },
    include: {
      guest: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

export const deleteReview = async (reviewId: string, userId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(404, 'Review not found');
  }

  if (review.guestId !== userId) {
    throw new AppError(403, 'You can only delete your own reviews');
  }

  try {
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Update property rating
    await updatePropertyRating(review.propertyId);

    logger.info(`Review deleted: ${reviewId}`);
  } catch (error) {
    logger.error(`Review deletion failed: ${error}`);
    throw new AppError(500, 'Failed to delete review');
  }
};
