import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Wind,
  Tv,
  Shield,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Mountain,
  UtensilsCrossed,
  Gamepad2,
  Navigation,
} from 'lucide-react';

export interface MealSection {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

export interface HomestayData {
  images: string[];
  title: string;
  subtitle: string;
  location: string;
  rating: number;
  reviewCount: number;
  hostName: string;
  hostImage: string;
  hostSince: string;
  isSuperhost: boolean;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  price: number;
  description: string;
  stayDetails?: string[];
  highlights: { icon: React.ReactNode; title: string; text: string }[];
  amenities: string[];
  meals?: MealSection[];
  activities?: string[];
  nearbyPlaces?: string[];
}

interface HomestayCardProps {
  homestay: HomestayData;
  reversed?: boolean;
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Fast WiFi': <Wifi className="w-5 h-5" />,
  'Free parking': <Car className="w-5 h-5" />,
  'Kitchen': <Utensils className="w-5 h-5" />,
  'Coffee maker': <Coffee className="w-5 h-5" />,
  'Air conditioning': <Wind className="w-5 h-5" />,
  'Smart TV': <Tv className="w-5 h-5" />,
  'Security cameras': <Shield className="w-5 h-5" />,
  'default': <Star className="w-5 h-5" />,
};

export const HomestayCard: React.FC<HomestayCardProps> = ({ homestay, reversed = false }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(false);

  const nextImage = () => setCurrentImage((i) => (i + 1) % homestay.images.length);
  const prevImage = () => setCurrentImage((i) => (i - 1 + homestay.images.length) % homestay.images.length);

  return (
    <section className="py-10 md:py-16 px-4 sm:px-8 md:px-12">
      <div className={`max-w-[1400px] mx-auto flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12`}>
        
        {/* ── Image Gallery ── */}
        <div className="lg:w-[55%] flex-shrink-0">
          {/* Main image */}
          <div className="relative rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setLightboxOpen(true)}>
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={homestay.images[0]}
                alt={homestay.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Overlay actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <Heart className={`w-4 h-4 ${liked ? 'text-[#E50914] fill-[#E50914]' : 'text-white'}`} />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <Share2 className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
              1 / {homestay.images.length}
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
            {homestay.images.slice(1, 5).map((img, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[calc(25%-6px)] rounded-xl overflow-hidden cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                onClick={() => { setCurrentImage(i + 1); setLightboxOpen(true); }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Description (Airbnb-style) ── */}
        <div className="lg:w-[45%] flex flex-col">
          {/* Title & location */}
          <div className="mb-5">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-bold text-white leading-tight"
            >
              {homestay.title}
            </motion.h2>
            <p className="text-white/50 text-sm mt-1">{homestay.subtitle}</p>
          </div>

          {/* Rating & location row */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#E50914] fill-[#E50914]" />
              <span className="text-white font-semibold text-sm">{homestay.rating}</span>
              <span className="text-white/40 text-sm">({homestay.reviewCount} reviews)</span>
            </div>
            <span className="text-white/20">·</span>
            {homestay.isSuperhost && (
              <>
                <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded-full">
                  ★ Superhost
                </span>
                <span className="text-white/20">·</span>
              </>
            )}
            <div className="flex items-center gap-1 text-white/50 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              {homestay.location}
            </div>
          </div>

          {/* Property specs bar */}
          <div className="flex flex-wrap gap-4 py-4 border-y border-white/10 mb-5">
            {[
              { icon: <Users className="w-4 h-4" />, label: `${homestay.guests} guests` },
              { icon: <Bed className="w-4 h-4" />, label: `${homestay.bedrooms} bedrooms` },
              { icon: <Bed className="w-4 h-4" />, label: `${homestay.beds} beds` },
              { icon: <Bath className="w-4 h-4" />, label: `${homestay.bathrooms} baths` },
            ].map((spec, i) => (
              <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
                {spec.icon}
                {spec.label}
              </div>
            ))}
          </div>

          {/* Host info */}
          <div className="flex items-center gap-3 mb-5">
            <img
              src={homestay.hostImage}
              alt={homestay.hostName}
              className="w-11 h-11 rounded-full object-cover border-2 border-white/10"
            />
            <div>
              <p className="text-white text-sm font-medium">Hosted by {homestay.hostName}</p>
              <p className="text-white/40 text-xs">{homestay.hostSince}</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4 mb-5">
            {homestay.highlights.map((h, i) => (
              <div key={i} className="flex gap-3">
                <div className="text-white/60 mt-0.5">{h.icon}</div>
                <div>
                  <p className="text-white text-sm font-medium">{h.title}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{h.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="border-t border-white/10 pt-5 mb-5">
            <p className="text-white/70 text-sm leading-relaxed">
              {homestay.description}
            </p>
          </div>

          {/* Stay Details */}
          {homestay.stayDetails && homestay.stayDetails.length > 0 && (
            <div className="border-t border-white/10 pt-5 mb-5">
              <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
                <Bed className="w-4 h-4 text-[#E50914]" />
                Stay Details
              </h3>
              <ul className="space-y-1.5">
                {homestay.stayDetails.map((item, i) => (
                  <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                    <span className="text-[#E50914] mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Meals Included */}
          {homestay.meals && homestay.meals.length > 0 && (
            <div className="border-t border-white/10 pt-5 mb-5">
              <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#E50914]" />
                Meals Included
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {homestay.meals.map((meal, mi) => (
                  <div key={mi} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="text-[#E50914]">{meal.icon}</div>
                      <h4 className="text-white font-medium text-sm">{meal.title}</h4>
                    </div>
                    <ul className="space-y-1">
                      {meal.items.map((item, ii) => (
                        <li key={ii} className="text-white/50 text-xs flex items-start gap-1.5">
                          <span className="text-white/30 mt-0.5">–</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {homestay.activities && homestay.activities.length > 0 && (
            <div className="border-t border-white/10 pt-5 mb-5">
              <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-[#E50914]" />
                Activities Included
              </h3>
              <div className="flex flex-wrap gap-2">
                {homestay.activities.map((activity, i) => (
                  <span
                    key={i}
                    className="bg-white/5 border border-white/10 text-white/70 text-xs px-3 py-1.5 rounded-full"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Places */}
          {homestay.nearbyPlaces && homestay.nearbyPlaces.length > 0 && (
            <div className="border-t border-white/10 pt-5 mb-5">
              <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#E50914]" />
                Closest Places to Visit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {homestay.nearbyPlaces.map((place, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/60 text-sm py-1">
                    <Mountain className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    {place}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          <div className="border-t border-white/10 pt-5 mb-6">
            <h3 className="text-white font-semibold text-base mb-3">What this place offers</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {homestay.amenities.map((amenity, i) => (
                <div key={i} className="flex items-center gap-2.5 text-white/60 text-sm">
                  {AMENITY_ICONS[amenity] || AMENITY_ICONS['default']}
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="mt-auto bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-white">${homestay.price}</span>
              <span className="text-white/40 text-sm"> / night</span>
            </div>
            <button className="btn-netflix !rounded-xl !px-6 !py-3 text-sm">
              Check Availability
            </button>
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
            <motion.div
              key={currentImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-5xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={homestay.images[currentImage]}
                alt={homestay.title}
                className="w-full max-h-[75vh] object-contain rounded-lg"
              />
              <p className="text-center text-white/50 text-sm mt-3">
                {currentImage + 1} / {homestay.images.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
