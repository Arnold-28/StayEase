// Input validation schemas using Joi
import Joi from 'joi';

export const authSchemas = {
  register: Joi.object().keys({
    email: Joi.string().email().required().lowercase().trim(),
    username: Joi.string().alphanum().min(3).max(30).required().trim(),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|;:'",.<>?/`~])/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
    firstName: Joi.string().max(100).required().trim(),
    lastName: Joi.string().max(100).required().trim(),
    phone: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).optional(),
    role: Joi.string().valid('GUEST', 'OWNER').default('GUEST'),
  }),

  login: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),

  updatePassword: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|;:'",.<>?/`~])/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      }),
  }),

  forgotPassword: Joi.object().keys({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object().keys({
    token: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp('^[a-zA-Z0-9@$!%*?&]{8,}$'))
      .required(),
  }),
};

export const propertySchemas = {
  create: Joi.object().keys({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(5000).required(),
    category: Joi.string()
      .valid('APARTMENT', 'HOUSE', 'VILLA', 'COTTAGE', 'CONDO')
      .required(),
    location: Joi.string().max(255).required(),
    city: Joi.string().max(100).required(),
    state: Joi.string().max(100).required(),
    country: Joi.string().max(100).required(),
    zipCode: Joi.string().pattern(/^[0-9a-zA-Z\s-]{2,20}$/).required(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    bedrooms: Joi.number().min(1).required(),
    bathrooms: Joi.number().min(1).required(),
    guests: Joi.number().min(1).required(),
    amenities: Joi.array().items(Joi.string()).optional(),
    basePrice: Joi.number().min(0).required(),
    currency: Joi.string().default('USD'),
    weeklyDiscount: Joi.number().min(0).max(100).optional(),
    monthlyDiscount: Joi.number().min(0).max(100).optional(),
    minNightStay: Joi.number().min(1).default(1),
    maxNightStay: Joi.number().min(1).optional(),
    bookingBuffer: Joi.number().min(0).default(0),
  }),

  update: Joi.object().keys({
    title: Joi.string().max(200).optional(),
    description: Joi.string().max(5000).optional(),
    category: Joi.string().valid('APARTMENT', 'HOUSE', 'VILLA', 'COTTAGE', 'CONDO').optional(),
    basePrice: Joi.number().min(0).optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    isActive: Joi.boolean().optional(),
    featured: Joi.boolean().optional(),
  }),

  search: Joi.object().keys({
    city: Joi.string().optional(),
    checkInDate: Joi.date().iso().optional(),
    checkOutDate: Joi.date().iso().optional(),
    guests: Joi.number().min(1).optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    category: Joi.string().optional(),
    amenities: Joi.array().items(Joi.string()).optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sortBy: Joi.string().valid('price', 'rating', 'newest', 'popular').default('popular'),
  }),
};

export const bookingSchemas = {
  create: Joi.object().keys({
    propertyId: Joi.string().required(),
    checkInDate: Joi.date().iso().required(),
    checkOutDate: Joi.date().iso().required(),
    guests: Joi.number().min(1).required(),
    guestMessage: Joi.string().max(500).optional(),
  }),

  search: Joi.object().keys({
    status: Joi.string()
      .valid('PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED')
      .optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
  }),

  cancel: Joi.object().keys({
    cancellationReason: Joi.string().max(500).required(),
  }),
};

export const reviewSchemas = {
  create: Joi.object().keys({
    propertyId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    cleanliness: Joi.number().min(1).max(5).optional(),
    accuracy: Joi.number().min(1).max(5).optional(),
    communication: Joi.number().min(1).max(5).optional(),
    location: Joi.number().min(1).max(5).optional(),
    value: Joi.number().min(1).max(5).optional(),
    comment: Joi.string().max(1000).optional(),
  }),
};

export const validate = (data: any, schema: Joi.ObjectSchema) => {
  return schema.validate(data, { abortEarly: false, stripUnknown: true });
};
