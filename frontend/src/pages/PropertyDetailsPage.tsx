import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Image, Star, MapPin, Users, Bed, Bath, ArrowLeft, Share2, Heart } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { propertyService } from '../services';

interface PropertyImage {
  url: string;
}

interface PropertyDetails {
  id: string;
  title: string;
  description?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  basePrice: number;
  bedrooms?: number;
  bathrooms?: number;
  guests?: number;
  amenities?: string[];
  totalRating?: number;
  reviewCount?: number;
  category?: string;
  images: PropertyImage[];
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
];

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [liked, setLiked] = useState(false);

  const [mobileIndex, setMobileIndex] = useState(0);
  const [mobileDirection, setMobileDirection] = useState(1);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxDirection, setLightboxDirection] = useState(1);

  const touchStartX = useRef<number | null>(null);
  const lightboxTouchStartX = useRef<number | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');
        const response = await propertyService.getById(id);
        setProperty(response.data);
      } catch {
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'auto'; };
    }
    document.body.style.overflow = 'auto';
  }, [isLightboxOpen]);

  const galleryImages = useMemo(() => {
    const apiImages = property?.images?.map((img) => img.url).filter(Boolean) || [];
    const merged = [...apiImages, ...FALLBACK_IMAGES];
    return merged.slice(0, Math.max(5, apiImages.length));
  }, [property]);

  /* Mobile carousel helpers */
  const nextMobile = () => { if (!galleryImages.length) return; setMobileDirection(1); setMobileIndex((p) => (p + 1) % galleryImages.length); };
  const prevMobile = () => { if (!galleryImages.length) return; setMobileDirection(-1); setMobileIndex((p) => (p - 1 + galleryImages.length) % galleryImages.length); };
  const onMobileTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.changedTouches[0].clientX; };
  const onMobileTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? nextMobile() : prevMobile();
    touchStartX.current = null;
  };

  /* Lightbox helpers */
  const openLightbox = (i: number) => { setLightboxIndex(i); setIsLightboxOpen(true); };
  const closeLightbox = () => setIsLightboxOpen(false);
  const nextLightbox = () => { if (!galleryImages.length) return; setLightboxDirection(1); setLightboxIndex((p) => (p + 1) % galleryImages.length); };
  const prevLightbox = () => { if (!galleryImages.length) return; setLightboxDirection(-1); setLightboxIndex((p) => (p - 1 + galleryImages.length) % galleryImages.length); };
  const onLightboxTouchStart = (e: React.TouchEvent) => { lightboxTouchStartX.current = e.changedTouches[0].clientX; };
  const onLightboxTouchEnd = (e: React.TouchEvent) => {
    if (lightboxTouchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - lightboxTouchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? nextLightbox() : prevLightbox();
    lightboxTouchStartX.current = null;
  };

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-8 md:px-12">
          <div className="shimmer h-[420px] rounded-xl" />
          <div className="mt-8 space-y-4">
            <div className="shimmer h-8 w-80 rounded" />
            <div className="shimmer h-5 w-48 rounded" />
          </div>
        </div>
      </div>
    );
  }

  /* Error state */
  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <X className="w-7 h-7 text-white/30" />
          </div>
          <p className="text-white/60 mb-6 text-lg">{error || 'Property not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-netflix !rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const locationText = [property.location || property.city, property.state, property.country].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-8 md:px-12 pb-16">
        {/* Back + actions bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm ${
                liked ? 'bg-[#E50914]/20 text-[#E50914]' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-[#E50914]' : ''}`} />
              Save
            </button>
          </div>
        </div>

        {/* ═══ Gallery ═══ */}
        <section className="mb-10">
          {/* Desktop grid */}
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-xl overflow-hidden">
            <button onClick={() => openLightbox(0)} className="col-span-2 row-span-2 overflow-hidden relative group">
              <motion.img src={galleryImages[0]} alt={`${property.title} 1`} loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
            {galleryImages.slice(1, 5).map((img, i) => (
              <button key={img + i} onClick={() => openLightbox(i + 1)} className="overflow-hidden relative group">
                <motion.img src={img} alt={`${property.title} ${i + 2}`} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>

          {/* Mobile carousel */}
          <div
            className="md:hidden relative rounded-xl overflow-hidden bg-netflix-card"
            onTouchStart={onMobileTouchStart}
            onTouchEnd={onMobileTouchEnd}
          >
            <div className="relative h-72">
              <AnimatePresence initial={false} mode="wait">
                <motion.img
                  key={mobileIndex}
                  src={galleryImages[mobileIndex]}
                  alt={`${property.title} ${mobileIndex + 1}`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ x: mobileDirection > 0 ? 80 : -80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: mobileDirection > 0 ? -80 : 80, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => openLightbox(mobileIndex)}
                />
              </AnimatePresence>
            </div>
            <button onClick={prevMobile}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full border border-white/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMobile}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full border border-white/10">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {galleryImages.slice(0, 5).map((_, i) => (
                <button key={i} onClick={() => { setMobileDirection(i > mobileIndex ? 1 : -1); setMobileIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === mobileIndex ? 'bg-white w-4' : 'bg-white/40'}`} />
              ))}
            </div>
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              {mobileIndex + 1} / {Math.min(galleryImages.length, 5)}
            </div>
          </div>

          {/* Show all photos */}
          <div className="mt-3 flex justify-end">
            <button onClick={() => openLightbox(0)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-all">
              <Image className="w-4 h-4" />
              Show all photos
            </button>
          </div>
        </section>

        {/* ═══ Property info ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title + meta */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                {property.category && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#E50914] bg-[#E50914]/10 px-2.5 py-0.5 rounded">
                    {property.category}
                  </span>
                )}
                {property.totalRating !== undefined && property.totalRating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-white/80">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {property.totalRating.toFixed(1)}
                    {property.reviewCount !== undefined && property.reviewCount > 0 && (
                      <span className="text-white/40">({property.reviewCount} reviews)</span>
                    )}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{property.title}</h1>
              <div className="flex items-center gap-1.5 text-white/50 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{locationText}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Users, value: `${property.guests || 0} guests`, label: 'Guests' },
                { icon: Bed, value: `${property.bedrooms || 0} bedrooms`, label: 'Bedrooms' },
                { icon: Bath, value: `${property.bathrooms || 0} bathrooms`, label: 'Baths' },
              ].map(({ icon: Icon, value }) => (
                <div key={value} className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                  <Icon className="w-5 h-5 text-[#E50914]" />
                  <span className="text-sm text-white/80">{value}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">About this place</h2>
                <p className="text-white/60 leading-relaxed text-sm">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5 text-sm text-white/70">
                      <div className="w-2 h-2 rounded-full bg-[#E50914]/60" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 glass-card rounded-2xl p-6 space-y-5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">${property.basePrice}</span>
                <span className="text-white/40 text-sm">/ night</span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <label className="text-xs text-white/40 block mb-1">CHECK-IN</label>
                    <input type="date" className="w-full bg-transparent text-white text-sm outline-none" />
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <label className="text-xs text-white/40 block mb-1">CHECK-OUT</label>
                    <input type="date" className="w-full bg-transparent text-white text-sm outline-none" />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <label className="text-xs text-white/40 block mb-1">GUESTS</label>
                  <select className="w-full bg-transparent text-white text-sm outline-none">
                    {Array.from({ length: property.guests || 4 }, (_, i) => (
                      <option key={i} value={i + 1} className="bg-[#232323]">{i + 1} guest{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="w-full btn-netflix !rounded-xl !py-3.5 text-base">
                Reserve
              </button>

              <p className="text-center text-xs text-white/30">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </main>

      {/* ═══ Lightbox ═══ */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 p-4 md:p-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            {/* Close */}
            <button onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium z-10">
              {lightboxIndex + 1} / {galleryImages.length}
            </div>

            <div
              className="h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onLightboxTouchStart}
              onTouchEnd={onLightboxTouchEnd}
            >
              <button onClick={prevLightbox}
                className="absolute left-4 md:left-8 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>

              <AnimatePresence initial={false} mode="wait">
                <motion.img
                  key={lightboxIndex}
                  src={galleryImages[lightboxIndex]}
                  alt={`${property.title} ${lightboxIndex + 1}`}
                  className="max-h-[85vh] max-w-full object-contain rounded-lg"
                  initial={{ x: lightboxDirection > 0 ? 100 : -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: lightboxDirection > 0 ? -100 : 100, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>

              <button onClick={nextLightbox}
                className="absolute right-4 md:right-8 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
