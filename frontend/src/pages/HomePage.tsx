import React, { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { GallerySection } from '../components/GallerySection';
import type { GalleryItem } from '../components/GallerySection';
import { useAuthStore } from '../store/authStore';
import { usePropertyStore } from '../store/propertyStore';

/* ── Gallery — one tile per homestay ── */
const GALLERY_ITEMS: GalleryItem[] = [
  {
    mainImage: '/images/prestige-nature-main.jpg',
    images: [
      '/images/prestige-1.jpg',
      '/images/prestige-2.jpg',
      '/images/prestige-3.jpg',
      '/images/prestige-4.jpg',
    ],
    title: 'Prestige Nature Homestay',
    description: 'In the midst of nature — Chikmagalur, Karnataka',
    location: 'Chikmagalur, Karnataka, India',
    guests: 12,
    bedrooms: 4,
    bathrooms: 4,
    price: 999,
    priceNote: 'For discounts, contact the host directly. Payment is done by negotiation.',
    hostName: 'Sudheeksh Kharvi',
    hostPhone: '8431956616',
    longDescription:
      'Prestige Nature Homestay is nestled in the midst of nature. It offers guests a serene environment with lush green surroundings, making it an ideal getaway from the hustle and bustle of city life. The homestay provides comfortable accommodation options and delicious home-cooked meals prepared with love and local flavours.',
    stayDetails: [
    
      'Premium Classic Rooms (without AC)',
      'Premium Couple Rooms — 4 rooms (without AC)',
      '24-hour hot water facility',
      'Power backup',
      'Completely sanitized rooms',
    ],
    meals: [
      {
        title: 'Dinner',
        items: [
          'Chapati or Akki Rotti',
          'Veg / Non-Veg Curry (Chicken)',
          'Ghee Rice / Veg Biryani & White Rice',
          'Rasam', 'Veg Palya', 'Veg Salad',
          'Curd', 'Pickle', 'Papad',
        ],
      },
      {
        title: 'Breakfast',
        items: [
          'Idli / Poori / Akki Rotti',
          'Rice item — Pulav / Lemon Rice or Chow Chow Bath',
        ],
      },
      {
        title: 'Evening Snacks',
        items: ['Malnad Style Pakoda / Bajji with Coffee'],
      },
    ],
    activities: ['Carrom', 'Chess', 'Cards', 'Campfire 🔥'],
    nearbyPlaces: [
      'Mullayanagiri Hills (Highest Peak of Karnataka)',
      'Jhari Falls', 'Bababudangiri',
      'Honnamana Halla Falls', 'Manikyadhara Falls',
      'Kemmanagundi Hills', 'Hebbe Falls',
      'Deviramma Temple', 'Coffee Museum',
      'Muthodi Forest Safari', 'Bandekal Gudda',
      'Nirvaneshwara Math', 'Belur & Halebeedu Temple',
      'Hirekolale Lake', 'Ayyankere Lake', 'Kallatgiri Falls',
    ],
    amenities: ['Free parking', 'Kitchen', 'Coffee maker', 'Fast WiFi'],
  },
  {
    mainImage: '/images/nature-view-main.jpg',
    images: [
      '/images/nature-view-1.jpg',
      '/images/nature-view-2.jpg',
      '/images/nature-view-3.jpg',
      '/images/nature-view-4.jpg',
    ],
    title: 'Nature View Homestay',
    description: 'In the midst of nature — Chikmagalur, Karnataka',
    location: 'Chikmagalur, Karnataka, India',
    guests: 12,
    bedrooms: 4,
    bathrooms: 4,
    price: 999,
    priceNote: 'For discounts, contact the host directly. Payment is done by negotiation.',
    hostName: 'Sudheeksh Kharvi',
    hostPhone: '8431956616',
    longDescription:
      'Nature View Homestay is nestled in the midst of nature. It offers guests a serene environment with lush green surroundings, making it an ideal getaway from the hustle and bustle of city life. The homestay provides comfortable accommodation options and delicious home-cooked meals prepared with love and local flavours.',
    stayDetails: [
      'Premium Classic Rooms (without AC)',
      'Premium Couple Rooms — 4 rooms (without AC)',
      '24-hour hot water facility',
      'Power backup',
      'Completely sanitized rooms',
    ],
    meals: [
      {
        title: 'Dinner',
        items: [
          'Chapati or Akki Rotti',
          'Veg / Non-Veg Curry (Chicken)',
          'Ghee Rice / Veg Biryani & White Rice',
          'Rasam', 'Veg Palya', 'Veg Salad',
          'Curd', 'Pickle', 'Papad',
        ],
      },
      {
        title: 'Breakfast',
        items: [
          'Idli / Poori / Akki Rotti',
          'Rice item — Pulav / Lemon Rice or Chow Chow Bath',
        ],
      },
      {
        title: 'Evening Snacks',
        items: ['Malnad Style Pakoda / Bajji with Coffee'],
      },
    ],
    activities: ['Carrom', 'Chess', 'Cards', 'Campfire 🔥'],
    nearbyPlaces: [
      'Mullayanagiri Hills (Highest Peak of Karnataka)',
      'Jhari Falls', 'Bababudangiri',
      'Honnamana Halla Falls', 'Manikyadhara Falls',
      'Kemmanagundi Hills', 'Hebbe Falls',
      'Deviramma Temple', 'Coffee Museum',
      'Muthodi Forest Safari', 'Bandekal Gudda',
      'Nirvaneshwara Math', 'Belur & Halebeedu Temple',
      'Hirekolale Lake', 'Ayyankere Lake', 'Kallatgiri Falls',
    ],
    amenities: ['Free parking', 'Kitchen', 'Coffee maker', 'Fast WiFi'],
  },
];

export const HomePage: React.FC = () => {
  const { initializeAuth } = useAuthStore();
  const { customTiles, loadTiles } = usePropertyStore();

  useEffect(() => {
    initializeAuth();
    loadTiles();
  }, []);

  const allItems = [...GALLERY_ITEMS, ...customTiles];

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      <HeroSection />

      {/* ── Single Gallery for both homestays ── */}
      <div className="max-w-[1400px] mx-auto">
        <GallerySection
          heading="📸 Our Homestays — Gallery"
          subtitle="A glimpse of our handpicked stays in Chikmagalur"
          items={allItems}
        />
      </div>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/5 mt-12">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">About</h3>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Community</h3>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Become a Host</a></li>
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Community Forum</a></li>
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Referrals</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Safety</a></li>
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Terms</a></li>
                <li><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-2xl font-black text-[#E50914]/60">STAYEASE</span>
            <p className="text-xs text-white/30">&copy; 2026 StayEase. All rights reserved.</p>
          </div>
          <div className="text-center mt-6 pt-4 border-t border-white/5">
            <p className="text-xs text-white/40">
              Developed by <span className="text-white/60 font-medium">Arnold</span> &middot;{' '}
              <a href="mailto:arnolddsilva43@gmail.com" className="text-[#E50914]/60 hover:text-[#E50914] transition-colors">
                arnolddsilva43@gmail.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
