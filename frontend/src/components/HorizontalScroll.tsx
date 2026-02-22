import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ title, subtitle, children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-6 md:py-8">
      {/* Header */}
      <div className="px-4 sm:px-8 md:px-12 mb-4">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-end gap-3"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
          {subtitle && (
            <span className="text-sm text-white/40 hidden sm:inline">{subtitle}</span>
          )}
          <div className="flex-1" />
          <span className="text-xs text-[#E50914] hover:text-[#f6121d] cursor-pointer font-medium transition-colors">
            Explore All &rsaquo;
          </span>
        </motion.div>
      </div>

      {/* Scroll container */}
      <div className="relative group">
        <div
          ref={scrollRef}
          className="netflix-row"
        >
          {children}
        </div>

        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-8 w-12 md:w-16 z-10
              bg-gradient-to-r from-[#141414] to-transparent
              flex items-center justify-start pl-2
              opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/80 hover:border-white/20 transition-all">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-8 w-12 md:w-16 z-10
              bg-gradient-to-l from-[#141414] to-transparent
              flex items-center justify-end pr-2
              opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/80 hover:border-white/20 transition-all">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>
        )}
      </div>
    </section>
  );
};
