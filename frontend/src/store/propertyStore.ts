import { create } from 'zustand';
import type { GalleryItem } from '../components/GallerySection';

const STORAGE_KEY = 'stayease_custom_tiles';

const loadFromStorage = (): GalleryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items: GalleryItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

interface PropertyStore {
  customTiles: GalleryItem[];
  addTile: (tile: GalleryItem) => void;
  removeTile: (index: number) => void;
  updateTile: (index: number, tile: GalleryItem) => void;
  loadTiles: () => void;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  customTiles: [],

  loadTiles: () => {
    set({ customTiles: loadFromStorage() });
  },

  addTile: (tile) => {
    const updated = [...get().customTiles, tile];
    saveToStorage(updated);
    set({ customTiles: updated });
  },

  removeTile: (index) => {
    const updated = get().customTiles.filter((_, i) => i !== index);
    saveToStorage(updated);
    set({ customTiles: updated });
  },

  updateTile: (index, tile) => {
    const updated = [...get().customTiles];
    updated[index] = tile;
    saveToStorage(updated);
    set({ customTiles: updated });
  },
}));
