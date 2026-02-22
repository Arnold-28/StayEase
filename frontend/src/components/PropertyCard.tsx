import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Users, Bed, Play } from 'lucide-react';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  bedrooms: number;
  guests: number;
  rating?: number;
  reviews?: number;
  category?: string;
  onClick?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  title,
  location,
  price,
  image,
  bedrooms,
  guests,
  rating,
  reviews,
  category,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fallbackImg = 'image.png';

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="relative flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] cursor-pointer group"
    >
      {/* Card */}
      <motion.div
        animate={isHovered ? { scale: 1.05, y: -8 } : { scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="rounded-lg overflow-hidden bg-netflix-card shadow-lg shadow-black/40"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={imgError ? fallbackImg : image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />

          {/* Gradient overlay on hover */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            } bg-gradient-to-t from-black/80 via-transparent to-transparent`}
          />

          {/* Price badge */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
            ${price}<span className="text-white/60 text-xs font-normal">/night</span>
          </div>

          {/* Category badge */}
          {category && (
            <div className="absolute top-3 left-3 bg-[#E50914]/90 text-white px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
              {category}
            </div>
          )}

          {/* Hover play-like overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm truncate mb-1">{title}</h3>

          <div className="flex items-center gap-1 text-white/50 text-xs mb-2.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/50 text-xs">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {guests}
              </span>
              <span className="flex items-center gap-1">
                <Bed className="w-3 h-3" />
                {bedrooms}
              </span>
            </div>

            {rating !== undefined && rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-white text-xs font-semibold">{rating.toFixed(1)}</span>
                {reviews !== undefined && reviews > 0 && (
                  <span className="text-white/40 text-xs">({reviews})</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
