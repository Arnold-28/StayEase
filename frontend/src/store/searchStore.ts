import { create } from 'zustand';

export interface Filters {
  city?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  amenities?: string[];
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
}

export interface SearchState {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  clearFilters: () => void;
  updateFilter: (key: keyof Filters, value: any) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  updateFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
}));
