import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, Users, Bed, Bath, UtensilsCrossed, Mountain, Gamepad2, MessageSquarePlus, Send, Phone, User, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface GalleryItem {
  mainImage: string;
  images: string[];
  title: string;
  description: string;
  /* Extended detail fields shown on click */
  location?: string;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  price?: number;
  priceNote?: string;
  hostName?: string;
  hostPhone?: string;
  longDescription?: string;
  stayDetails?: string[];
  meals?: { title: string; items: string[] }[];
  activities?: string[];
  nearbyPlaces?: string[];
  amenities?: string[];
}

interface GallerySectionProps {
  heading: string;
  subtitle?: string;
  items: GalleryItem[];
}

/* ── Star-picker sub-component ── */
const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)} className="focus:outline-none">
        <Star className={`w-5 h-5 transition-colors ${s <= value ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
      </button>
    ))}
  </div>
);

export const GallerySection: React.FC<GallerySectionProps> = ({
  heading,
  subtitle,
  items,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex !== null ? items[selectedIndex] : null;

  /* ── Reviews state (keyed by item index) ── */
  const [reviewsMap, setReviewsMap] = useState<Record<number, Review[]>>({});
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  /* ── Image slideshow state ── */
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const openSlideshow = (startIndex: number) => {
    setSlideIndex(startIndex);
    setSlideshowOpen(true);
  };

  const allImages = selected ? [selected.mainImage, ...selected.images] : [];
  const nextSlide = () => setSlideIndex((i) => (i + 1) % allImages.length);
  const prevSlide = () => setSlideIndex((i) => (i - 1 + allImages.length) % allImages.length);

  const currentReviews = selectedIndex !== null ? reviewsMap[selectedIndex] ?? [] : [];
  const avgRating = currentReviews.length > 0
    ? Math.round((currentReviews.reduce((s, r) => s + r.rating, 0) / currentReviews.length) * 100) / 100
    : null;

  const handleSubmitReview = () => {
    if (selectedIndex === null || !reviewForm.name.trim() || !reviewForm.comment.trim()) return;
    const newReview: Review = {
      id: crypto.randomUUID(),
      name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    };
    setReviewsMap((prev) => ({
      ...prev,
      [selectedIndex]: [...(prev[selectedIndex] ?? []), newReview],
    }));
    setReviewForm({ name: '', rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  return (
    <section className="py-10 md:py-14">
      {/* Section header */}
      <div className="px-4 sm:px-8 md:px-12 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white">{heading}</h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-white/50 mt-1">{subtitle}</p>
          )}
        </motion.div>
      </div>

      {/* Gallery grid */}
      <div className="px-4 sm:px-8 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-xl overflow-hidden cursor-pointer bg-netflix-card shadow-lg shadow-black/40"
              onClick={() => setSelectedIndex(index)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                {/* Main image */}
                <img
                  src={item.mainImage}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <h3 className="text-white font-semibold text-base md:text-lg mb-1 drop-shadow-lg">
                  {item.title}
                </h3>
                <p className="text-white/70 text-xs md:text-sm leading-relaxed line-clamp-2 drop-shadow-md">
                  {item.description}
                </p>
              </div>
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#E50914]/50 transition-colors duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Detail overlay (shown on click) ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-start justify-center overflow-y-auto py-8 px-4"
            onClick={() => setSelectedIndex(null)}
          >
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative max-w-3xl w-full bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Main image + 4 secondary thumbnails */}
              <div className="aspect-[16/9] overflow-hidden cursor-pointer" onClick={() => openSlideshow(0)}>
                <img
                  src={selected.mainImage}
                  alt={selected.title}
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              {selected.images.length > 0 && (
                <div className="grid grid-cols-4 gap-[2px]">
                  {selected.images.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden cursor-pointer"
                      onClick={() => openSlideshow(i + 1)}
                    >
                      <img
                        src={img}
                        alt={`${selected.title} ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 hover:brightness-110"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Fullscreen image slideshow ── */}
              <AnimatePresence>
                {slideshowOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-lg flex items-center justify-center"
                    onClick={() => setSlideshowOpen(false)}
                  >
                    {/* Close */}
                    <button
                      onClick={() => setSlideshowOpen(false)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Counter */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
                      {slideIndex + 1} / {allImages.length}
                    </div>

                    {/* Prev */}
                    <button
                      onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                      className="absolute left-3 md:left-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    {/* Image */}
                    <motion.img
                      key={slideIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      src={allImages[slideIndex]}
                      alt={`${selected.title} ${slideIndex + 1}`}
                      className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Next */}
                    <button
                      onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                      className="absolute right-3 md:right-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setSlideIndex(i); }}
                          className={`w-2 h-2 rounded-full transition-colors ${i === slideIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Title + location + rating */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{selected.title}</h2>
                  {selected.location && (
                    <div className="flex items-center gap-1.5 text-white/50 text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      {selected.location}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {avgRating !== null && (
                      <span className="flex items-center gap-1 text-white">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {avgRating}
                        <span className="text-white/40">({currentReviews.length} {currentReviews.length === 1 ? 'review' : 'reviews'})</span>
                      </span>
                    )}
                    {!avgRating && (
                      <span className="text-white/40 text-sm">No reviews yet</span>
                    )}
                    {selected.guests && <span className="flex items-center gap-1 text-white/50"><Users className="w-4 h-4" />{selected.guests} guests</span>}
                    {selected.bedrooms && <span className="flex items-center gap-1 text-white/50"><Bed className="w-4 h-4" />{selected.bedrooms} bedrooms</span>}
                    {selected.bathrooms && <span className="flex items-center gap-1 text-white/50"><Bath className="w-4 h-4" />{selected.bathrooms} baths</span>}
                  </div>
                </div>

                {/* Price */}
                {selected.price && (
                  <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                    <p className="text-white/50 text-xs mb-1">Starting from</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">₹{selected.price.toLocaleString('en-IN')}</span>
                      <span className="text-white/40 text-sm"> / night</span>
                    </div>
                    {selected.priceNote && (
                      <p className="text-white/50 text-xs mt-1.5">{selected.priceNote}</p>
                    )}
                  </div>
                )}

                {/* Host & Contact */}
                {selected.hostName && (
                  <div className="bg-[#E50914]/5 border border-[#E50914]/20 rounded-xl px-5 py-4">
                    <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#E50914]" /> Your Host
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#E50914]/20 flex items-center justify-center text-[#E50914] font-bold text-sm">
                          {selected.hostName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium text-sm">{selected.hostName}</span>
                      </div>
                      {selected.hostPhone && (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${selected.hostPhone}`}
                            className="flex items-center gap-1.5 bg-[#E50914] hover:bg-[#ff1a25] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit"
                          >
                            <Phone className="w-4 h-4" />
                            {selected.hostPhone}
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(selected.hostPhone!);
                              setCopiedPhone(true);
                              setTimeout(() => setCopiedPhone(false), 2000);
                            }}
                            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium px-3 py-2 rounded-lg transition-all"
                            title="Copy to clipboard"
                          >
                            {copiedPhone ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedPhone ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Long description */}
                {selected.longDescription && (
                  <p className="text-white/70 text-sm leading-relaxed">{selected.longDescription}</p>
                )}

                {/* Stay details */}
                {selected.stayDetails && selected.stayDetails.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold text-base mb-2 flex items-center gap-2">
                      <Bed className="w-4 h-4 text-[#E50914]" /> Stay Details
                    </h3>
                    <ul className="space-y-1">
                      {selected.stayDetails.map((d, i) => (
                        <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                          <span className="text-[#E50914] mt-0.5">•</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Meals */}
                {selected.meals && selected.meals.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold text-base mb-3 flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-[#E50914]" /> Meals Included
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selected.meals.map((meal, mi) => (
                        <div key={mi} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                          <h4 className="text-white font-medium text-sm mb-2">{meal.title}</h4>
                          <ul className="space-y-0.5">
                            {meal.items.map((item, ii) => (
                              <li key={ii} className="text-white/50 text-xs">– {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activities */}
                {selected.activities && selected.activities.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold text-base mb-2 flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-[#E50914]" /> Activities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.activities.map((a, i) => (
                        <span key={i} className="bg-white/5 border border-white/10 text-white/70 text-xs px-3 py-1.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nearby places */}
                {selected.nearbyPlaces && selected.nearbyPlaces.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold text-base mb-2 flex items-center gap-2">
                      <Mountain className="w-4 h-4 text-[#E50914]" /> Nearby Places
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                      {selected.nearbyPlaces.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-white/60 text-sm py-0.5">
                          <Mountain className="w-3.5 h-3.5 text-white/30 flex-shrink-0" /> {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {selected.amenities && selected.amenities.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold text-base mb-2">What this place offers</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.amenities.map((a, i) => (
                        <span key={i} className="bg-white/5 border border-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Reviews Section ── */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-base flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#E50914]" /> Guest Reviews
                      {currentReviews.length > 0 && (
                        <span className="text-white/40 text-sm font-normal">({currentReviews.length})</span>
                      )}
                    </h3>
                    {!showReviewForm && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="flex items-center gap-1.5 text-sm text-[#E50914] hover:text-[#ff1a25] transition-colors font-medium"
                      >
                        <MessageSquarePlus className="w-4 h-4" />
                        Write a Review
                      </button>
                    )}
                  </div>

                  {/* Write Review Form */}
                  <AnimatePresence>
                    {showReviewForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 space-y-4">
                          <h4 className="text-white font-medium text-sm">Share your experience</h4>

                          <div>
                            <label className="text-white/50 text-xs block mb-1.5">Your Name</label>
                            <input
                              type="text"
                              value={reviewForm.name}
                              onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                              placeholder="Enter your name"
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E50914]/50 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="text-white/50 text-xs block mb-1.5">Rating</label>
                            <StarPicker
                              value={reviewForm.rating}
                              onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))}
                            />
                          </div>

                          <div>
                            <label className="text-white/50 text-xs block mb-1.5">Your Review</label>
                            <textarea
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                              placeholder="Tell others about your stay..."
                              rows={3}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E50914]/50 transition-colors resize-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleSubmitReview}
                              disabled={!reviewForm.name.trim() || !reviewForm.comment.trim()}
                              className="flex items-center gap-1.5 bg-[#E50914] hover:bg-[#ff1a25] disabled:bg-white/10 disabled:text-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Submit Review
                            </button>
                            <button
                              onClick={() => { setShowReviewForm(false); setReviewForm({ name: '', rating: 5, comment: '' }); }}
                              className="text-white/50 hover:text-white/70 text-sm px-4 py-2 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Existing Reviews */}
                  {currentReviews.length === 0 && !showReviewForm && (
                    <p className="text-white/30 text-sm">No reviews yet. Be the first to share your experience!</p>
                  )}
                  {currentReviews.length > 0 && (
                    <div className="space-y-3">
                      {currentReviews.map((review) => (
                        <div key={review.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#E50914]/20 flex items-center justify-center text-[#E50914] text-xs font-bold">
                                {review.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-white text-sm font-medium">{review.name}</span>
                                <span className="text-white/30 text-xs ml-2">{review.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-white/60 text-sm leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
