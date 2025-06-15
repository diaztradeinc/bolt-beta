import { useState, useEffect, useCallback } from 'react';
import { civitaiService } from '../services/civitai';
import type { CivitaiModel } from '../types/models';

export interface UseCivitaiReturn {
  models: CivitaiModel[];
  embeddingModels: CivitaiModel[];
  loraModels: CivitaiModel[];
  videoModels: CivitaiModel[];
  loading: boolean;
  error: string | null;
  searchModels: (query: string, tab: string, selectorType: 'model' | 'embedding' | 'lora' | 'video') => Promise<void>;
  getPopularModels: (tab: string) => Promise<void>;
  getEmbeddingModels: (tab: string) => Promise<void>;
  getLoraModels: (tab: string) => Promise<void>;
  getVideoModels: () => Promise<void>;
  clearCache: () => void;
}

export function useCivitai(): UseCivitaiReturn {
  const [models, setModels] = useState<CivitaiModel[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<CivitaiModel[]>([]);
  const [loraModels, setLoraModels] = useState<CivitaiModel[]>([]);
  const [videoModels, setVideoModels] = useState<CivitaiModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchModels = useCallback(async (query: string, tab: string, selectorType: 'model' | 'embedding' | 'lora' | 'video') => {
    try {
      setLoading(true);
      setError(null);
      
      let results: CivitaiModel[] = [];
      
      switch (selectorType) {
        case 'model':
          results = await civitaiService.searchModelsForTab(query, tab, false);
          setModels(results);
          break;
        case 'embedding':
          results = await civitaiService.searchEmbeddingModelsForTab(query, tab);
          setEmbeddingModels(results);
          break;
        case 'lora':
          results = await civitaiService.searchModelsForTab(query, tab, true);
          setLoraModels(results);
          break;
        case 'video':
          results = await civitaiService.searchVideoModels(query);
          setVideoModels(results);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search models');
      // Clear the appropriate models array on error
      switch (selectorType) {
        case 'model':
          setModels([]);
          break;
        case 'embedding':
          setEmbeddingModels([]);
          break;
        case 'lora':
          setLoraModels([]);
          break;
        case 'video':
          setVideoModels([]);
          break;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getPopularModels = useCallback(async (tab: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const popularModels = await civitaiService.getPopularModelsForTab(tab);
      setModels(popularModels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get popular models');
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmbeddingModels = useCallback(async (tab: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const embeddings = await civitaiService.getEmbeddingModelsForTab(tab);
      setEmbeddingModels(embeddings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get embedding models');
      setEmbeddingModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getLoraModels = useCallback(async (tab: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const loras = await civitaiService.getLoraModelsForTab(tab);
      setLoraModels(loras);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get LoRA models');
      setLoraModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getVideoModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const videos = await civitaiService.getVideoModels();
      setVideoModels(videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get video models');
      setVideoModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    civitaiService.clearCache();
  }, []);

  return {
    models,
    embeddingModels,
    loraModels,
    videoModels,
    loading,
    error,
    searchModels,
    getPopularModels,
    getEmbeddingModels,
    getLoraModels,
    getVideoModels,
    clearCache
  };
}