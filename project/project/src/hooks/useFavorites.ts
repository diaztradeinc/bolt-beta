import { useState, useEffect, useCallback } from 'react';
import type { CivitaiModel } from '../types/models';

export interface FavoriteItem {
  id: number;
  model: CivitaiModel;
  type: 'model' | 'embedding' | 'lora';
  tab: string;
  addedAt: number;
}

export interface UseFavoritesReturn {
  favorites: FavoriteItem[];
  addToFavorites: (model: CivitaiModel, type: 'model' | 'embedding' | 'lora', tab: string) => void;
  removeFromFavorites: (modelId: number, type: 'model' | 'embedding' | 'lora') => void;
  isFavorite: (modelId: number, type: 'model' | 'embedding' | 'lora') => boolean;
  getFavoritesByType: (type: 'model' | 'embedding' | 'lora') => FavoriteItem[];
  getFavoritesByTab: (tab: string, type?: 'model' | 'embedding' | 'lora') => FavoriteItem[];
  clearFavorites: () => void;
  exportFavorites: () => string;
  importFavorites: (data: string) => boolean;
}

const STORAGE_KEY = 'dreamflux_favorites';

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }, [favorites]);

  const addToFavorites = useCallback((model: CivitaiModel, type: 'model' | 'embedding' | 'lora', tab: string) => {
    setFavorites(prev => {
      // Check if already exists
      const exists = prev.some(fav => fav.id === model.id && fav.type === type);
      if (exists) return prev;

      const newFavorite: FavoriteItem = {
        id: model.id,
        model,
        type,
        tab,
        addedAt: Date.now()
      };

      return [...prev, newFavorite];
    });
  }, []);

  const removeFromFavorites = useCallback((modelId: number, type: 'model' | 'embedding' | 'lora') => {
    setFavorites(prev => prev.filter(fav => !(fav.id === modelId && fav.type === type)));
  }, []);

  const isFavorite = useCallback((modelId: number, type: 'model' | 'embedding' | 'lora') => {
    return favorites.some(fav => fav.id === modelId && fav.type === type);
  }, [favorites]);

  const getFavoritesByType = useCallback((type: 'model' | 'embedding' | 'lora') => {
    return favorites.filter(fav => fav.type === type);
  }, [favorites]);

  const getFavoritesByTab = useCallback((tab: string, type?: 'model' | 'embedding' | 'lora') => {
    return favorites.filter(fav => {
      const matchesTab = fav.tab === tab;
      const matchesType = type ? fav.type === type : true;
      return matchesTab && matchesType;
    });
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  const exportFavorites = useCallback(() => {
    return JSON.stringify(favorites, null, 2);
  }, [favorites]);

  const importFavorites = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        setFavorites(parsed);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import favorites:', error);
      return false;
    }
  }, []);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesByType,
    getFavoritesByTab,
    clearFavorites,
    exportFavorites,
    importFavorites
  };
}