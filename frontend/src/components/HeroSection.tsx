import React from 'react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {

  return (
    <section className="relative w-full h-[85vh] md:h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop&q=80"
          alt="Chikmagalur mountain ranges"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Netflix-style gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end pb-[15%] md:pb-[10%] px-4 sm:px-8 md:px-12 max-w-[1920px] mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="flex items-center gap-1.5 bg-[#E50914]/20 border border-[#E50914]/40 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
            <span className="text-xs font-semibold text-[#E50914] uppercase tracking-wider">
              Featured
            </span>
          </div>
          <span className="text-sm text-white/60">Top rated properties</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] mb-4 max-w-2xl"
        >
          Find Your
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-orange-500">
            Perfect Stay
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-lg text-white/70 max-w-lg mb-8 leading-relaxed"
        >
          Discover handpicked luxury villas, beachfront homes, and unique stays.
          Your next unforgettable experience is one click away.Chikmagalur is not just a destination — it’s an experience of nature, peace, and rejuvenation.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-white/50 rounded-full mt-1.5" />
        </div>
      </motion.div>
    </section>
  );
};
