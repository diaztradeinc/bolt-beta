import type { CivitaiModel, CivitaiModelVersion } from '../types/models';

const CIVITAI_API_BASE = '/api/civitai';

export class CivitaiService {
  private static instance: CivitaiService;
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private apiKey?: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_CIVITAI_API_KEY;
  }

  static getInstance(): CivitaiService {
    if (!CivitaiService.instance) {
      CivitaiService.instance = new CivitaiService();
    }
    return CivitaiService.instance;
  }

  private async fetchWithCache<T>(url: string, cacheKey: string, ttl: number = 300000): Promise<T> {
    const now = Date.now();
    
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > now) {
      return this.cache.get(cacheKey);
    }

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, { 
        headers,
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      this.cacheExpiry.set(cacheKey, now + ttl);
      
      return data;
    } catch (error) {
      console.error('Civitai API error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please check your internet connection and try again.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to Civitai API. Please check your internet connection or try again later.');
        } else if (error.message.includes('CORS')) {
          throw new Error('Cross-origin request blocked. Please ensure the proxy is configured correctly.');
        }
      }
      
      throw error;
    }
  }

  async searchModels(params: {
    query?: string;
    tag?: string;
    username?: string;
    types?: string[];
    sort?: 'Highest Rated' | 'Most Downloaded' | 'Newest';
    period?: 'AllTime' | 'Year' | 'Month' | 'Week' | 'Day';
    rating?: number;
    favorites?: boolean;
    hidden?: boolean;
    primaryFileOnly?: boolean;
    allowNoCredit?: boolean;
    allowDerivatives?: boolean;
    allowDifferentLicenses?: boolean;
    allowCommercialUse?: boolean;
    nsfw?: boolean;
    limit?: number;
    page?: number;
    baseModels?: string[];
  } = {}): Promise<{ items: CivitaiModel[]; metadata: any }> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          // Fix: Append each array element as a separate parameter
          value.forEach(item => {
            searchParams.append(key, item.toString());
          });
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const cacheKey = `models_${searchParams.toString()}`;
    return this.fetchWithCache(`${CIVITAI_API_BASE}/models?${searchParams}`, cacheKey);
  }

  async getModelById(id: number): Promise<CivitaiModel> {
    const cacheKey = `model_${id}`;
    return this.fetchWithCache(`${CIVITAI_API_BASE}/models/${id}`, cacheKey);
  }

  async getModelVersionById(id: number): Promise<CivitaiModelVersion> {
    const cacheKey = `version_${id}`;
    return this.fetchWithCache(`${CIVITAI_API_BASE}/model-versions/${id}`, cacheKey);
  }

  async getModelsByTab(tab: string, limit: number = 60): Promise<CivitaiModel[]> {
    // Updated base model mapping with only recognized API values
    const baseModelMap: Record<string, string[]> = {
      'SD1.5': ['SD 1.5'],
      'SDXL': ['SDXL 1.0'],
      'Flux': ['Flux.1 D', 'Flux.1 S'],
      'SD3.5': ['SD 3.5'],
      'Pony': ['Pony'],
      'SD2.1': ['SD 2.1'],
      'Other': ['Other']
    };

    const baseModels = baseModelMap[tab];
    if (!baseModels) return [];

    try {
      const searchParams: any = {
        types: ['Checkpoint'],
        sort: 'Most Downloaded',
        limit,
        primaryFileOnly: true,
        baseModels,
        nsfw: true // Enable NSFW content
      };

      const response = await this.searchModels(searchParams);

      // Additional filtering to ensure we get the right models
      return response.items.filter(model => 
        model.modelVersions.some(version => 
          baseModels.some(baseModel => 
            version.baseModel.includes(baseModel)
          )
        )
      );
    } catch (error) {
      console.error(`Failed to get models for ${tab}:`, error);
      
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Failed to get models for ${tab}: ${error.message}`);
      }
      throw new Error(`Failed to get models for ${tab}: Unknown error occurred`);
    }
  }

  async getVideoModels(limit: number = 60): Promise<CivitaiModel[]> {
    try {
      // Search for video generation models
      const searchParams: any = {
        query: 'video generation wan2.1 animatediff',
        types: ['Checkpoint', 'LORA'],
        sort: 'Most Downloaded',
        limit,
        primaryFileOnly: true,
        nsfw: true // Enable NSFW content
      };

      console.log('Fetching video models with params:', searchParams);
      const response = await this.searchModels(searchParams);
      
      // Filter for video-related models
      const videoModels = response.items.filter(model => {
        const name = model.name.toLowerCase();
        const description = model.description?.toLowerCase() || '';
        const tags = model.tags?.map(tag => tag.toLowerCase()) || [];
        
        return (
          name.includes('video') ||
          name.includes('animatediff') ||
          name.includes('wan2') ||
          name.includes('animate') ||
          description.includes('video') ||
          description.includes('animation') ||
          tags.some(tag => 
            tag.includes('video') || 
            tag.includes('animation') || 
            tag.includes('animatediff')
          )
        );
      });

      console.log(`Found ${videoModels.length} video models`);
      return videoModels;
    } catch (error) {
      console.error('Failed to get video models:', error);
      
      // Fallback: try a broader search
      try {
        console.log('Trying fallback for video models...');
        const fallbackParams: any = {
          query: 'animatediff',
          sort: 'Most Downloaded',
          limit: 30,
          primaryFileOnly: true,
          nsfw: true // Enable NSFW content
        };

        const fallbackResponse = await this.searchModels(fallbackParams);
        console.log(`Fallback found ${fallbackResponse.items.length} video models`);
        return fallbackResponse.items;
      } catch (fallbackError) {
        console.error('Fallback also failed for video models:', fallbackError);
        return [];
      }
    }
  }

  async getPopularModelsForTab(tab: string): Promise<CivitaiModel[]> {
    return this.getModelsByTab(tab, 60); // Ensure 60 models
  }

  async searchModelsForTab(query: string, tab: string, isLora: boolean = false): Promise<CivitaiModel[]> {
    // Updated base model mapping with only recognized API values
    const baseModelMap: Record<string, string[]> = {
      'SD1.5': ['SD 1.5'],
      'SDXL': ['SDXL 1.0'],
      'Flux': ['Flux.1 D', 'Flux.1 S'],
      'SD3.5': ['SD 3.5'],
      'Pony': ['Pony'],
      'SD2.1': ['SD 2.1'],
      'Other': ['Other']
    };

    const baseModels = baseModelMap[tab];
    if (!baseModels) return [];

    try {
      const searchParams: any = {
        query,
        types: [isLora ? 'LORA' : 'Checkpoint'],
        sort: 'Most Downloaded',
        limit: 60, // Ensure 60 results
        primaryFileOnly: true,
        nsfw: true // Enable NSFW content
      };

      // For LoRA models, be more flexible with base model filtering
      if (!isLora || tab !== 'Flux') {
        searchParams.baseModels = baseModels;
      }

      const response = await this.searchModels(searchParams);

      return response.items.filter(model => 
        model.modelVersions.some(version => 
          baseModels.some(baseModel => 
            version.baseModel.includes(baseModel)
          )
        )
      );
    } catch (error) {
      console.error(`Failed to search ${isLora ? 'LoRA' : 'checkpoint'} models for ${tab}:`, error);
      
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Failed to search ${isLora ? 'LoRA' : 'checkpoint'} models for ${tab}: ${error.message}`);
      }
      throw new Error(`Failed to search ${isLora ? 'LoRA' : 'checkpoint'} models for ${tab}: Unknown error occurred`);
    }
  }

  async searchVideoModels(query: string): Promise<CivitaiModel[]> {
    try {
      const searchParams: any = {
        query: `${query} video animation animatediff`,
        types: ['Checkpoint', 'LORA'],
        sort: 'Most Downloaded',
        limit: 60,
        primaryFileOnly: true,
        nsfw: true // Enable NSFW content
      };

      const response = await this.searchModels(searchParams);

      // Filter for video-related models
      return response.items.filter(model => {
        const name = model.name.toLowerCase();
        const description = model.description?.toLowerCase() || '';
        const tags = model.tags?.map(tag => tag.toLowerCase()) || [];
        
        return (
          name.includes('video') ||
          name.includes('animatediff') ||
          name.includes('wan2') ||
          name.includes('animate') ||
          description.includes('video') ||
          description.includes('animation') ||
          tags.some(tag => 
            tag.includes('video') || 
            tag.includes('animation') || 
            tag.includes('animatediff')
          )
        );
      });
    } catch (error) {
      console.error('Failed to search video models:', error);
      
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Failed to search video models: ${error.message}`);
      }
      throw new Error('Failed to search video models: Unknown error occurred');
    }
  }

  async getEmbeddingModelsForTab(tab: string): Promise<CivitaiModel[]> {
    // Updated base model mapping with only recognized API values
    const baseModelMap: Record<string, string[]> = {
      'SD1.5': ['SD 1.5'],
      'SDXL': ['SDXL 1.0'],
      'Flux': ['Flux.1 D', 'Flux.1 S'],
      'SD3.5': ['SD 3.5'],
      'Pony': ['Pony'],
      'SD2.1': ['SD 2.1'],
      'Other': ['Other']
    };

    const baseModels = baseModelMap[tab];
    if (!baseModels) return [];

    try {
      // Get TextualInversion (embedding) models
      const generalParams: any = {
        types: ['TextualInversion'],
        sort: 'Most Downloaded',
        limit: 60,
        primaryFileOnly: true,
        nsfw: true // Enable NSFW content
      };

      // For most tabs, include base model filtering
      if (tab !== 'Flux') {
        generalParams.baseModels = baseModels;
      }

      console.log(`Fetching embedding models for ${tab} with params:`, generalParams);
      const response = await this.searchModels(generalParams);
      
      const filteredModels = response.items.filter(model => 
        model.modelVersions.some(version => 
          baseModels.some(baseModel => 
            version.baseModel.includes(baseModel)
          )
        )
      );

      console.log(`Found ${filteredModels.length} embedding models for ${tab}`);
      return filteredModels;
    } catch (error) {
      console.error(`Failed to get embedding models for ${tab}:`, error);
      
      // Fallback: try without base model filtering
      try {
        console.log(`Trying fallback for embedding models ${tab}...`);
        const fallbackParams: any = {
          types: ['TextualInversion'],
          sort: 'Most Downloaded',
          limit: 60,
          primaryFileOnly: true,
          nsfw: true // Enable NSFW content
        };

        const fallbackResponse = await this.searchModels(fallbackParams);
        
        // Filter by base model after fetching
        const fallbackFiltered = fallbackResponse.items.filter(model => 
          model.modelVersions.some(version => 
            baseModels.some(baseModel => 
              version.baseModel.includes(baseModel)
            )
          )
        );

        console.log(`Fallback found ${fallbackFiltered.length} embedding models for ${tab}`);
        return fallbackFiltered;
      } catch (fallbackError) {
        console.error(`Fallback also failed for embedding models ${tab}:`, fallbackError);
        return [];
      }
    }
  }

  async searchEmbeddingModelsForTab(query: string, tab: string): Promise<CivitaiModel[]> {
    // Updated base model mapping with only recognized API values
    const baseModelMap: Record<string, string[]> = {
      'SD1.5': ['SD 1.5'],
      'SDXL': ['SDXL 1.0'],
      'Flux': ['Flux.1 D', 'Flux.1 S'],
      'SD3.5': ['SD 3.5'],
      'Pony': ['Pony'],
      'SD2.1': ['SD 2.1'],
      'Other': ['Other']
    };

    const baseModels = baseModelMap[tab];
    if (!baseModels) return [];

    try {
      const searchParams: any = {
        query,
        types: ['TextualInversion'],
        sort: 'Most Downloaded',
        limit: 60, // Ensure 60 results
        primaryFileOnly: true,
        baseModels,
        nsfw: true // Enable NSFW content
      };

      const response = await this.searchModels(searchParams);

      return response.items.filter(model => 
        model.modelVersions.some(version => 
          baseModels.some(baseModel => 
            version.baseModel.includes(baseModel)
          )
        )
      );
    } catch (error) {
      console.error(`Failed to search embedding models for ${tab}:`, error);
      
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Failed to search embedding models for ${tab}: ${error.message}`);
      }
      throw new Error(`Failed to search embedding models for ${tab}: Unknown error occurred`);
    }
  }

  async getLoraModelsForTab(tab: string): Promise<CivitaiModel[]> {
    // Updated base model mapping with only recognized API values
    const baseModelMap: Record<string, string[]> = {
      'SD1.5': ['SD 1.5'],
      'SDXL': ['SDXL 1.0'],
      'Flux': ['Flux.1 D', 'Flux.1 S'],
      'SD3.5': ['SD 3.5'],
      'Pony': ['Pony'],
      'SD2.1': ['SD 2.1'],
      'Other': ['Other']
    };

    const baseModels = baseModelMap[tab];
    if (!baseModels) return [];

    try {
      // First, try to get general LoRA models
      const generalParams: any = {
        types: ['LORA'],
        sort: 'Most Downloaded',
        limit: 60,
        primaryFileOnly: true,
        nsfw: true // Enable NSFW content
      };

      // For most tabs, include base model filtering
      if (tab !== 'Flux') {
        generalParams.baseModels = baseModels;
      }

      console.log(`Fetching LoRA models for ${tab} with params:`, generalParams);
      const response = await this.searchModels(generalParams);
      
      const filteredModels = response.items.filter(model => 
        model.modelVersions.some(version => 
          baseModels.some(baseModel => 
            version.baseModel.includes(baseModel)
          )
        )
      );

      console.log(`Found ${filteredModels.length} LoRA models for ${tab}`);
      return filteredModels;
    } catch (error) {
      console.error(`Failed to get LoRA models for ${tab}:`, error);
      
      // Fallback: try without base model filtering
      try {
        console.log(`Trying fallback for LoRA models ${tab}...`);
        const fallbackParams: any = {
          types: ['LORA'],
          sort: 'Most Downloaded',
          limit: 60,
          primaryFileOnly: true,
          nsfw: true // Enable NSFW content
        };

        const fallbackResponse = await this.searchModels(fallbackParams);
        
        // Filter by base model after fetching
        const fallbackFiltered = fallbackResponse.items.filter(model => 
          model.modelVersions.some(version => 
            baseModels.some(baseModel => 
              version.baseModel.includes(baseModel)
            )
          )
        );

        console.log(`Fallback found ${fallbackFiltered.length} LoRA models for ${tab}`);
        return fallbackFiltered;
      } catch (fallbackError) {
        console.error(`Fallback also failed for LoRA models ${tab}:`, fallbackError);
        return [];
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const civitaiService = CivitaiService.getInstance();