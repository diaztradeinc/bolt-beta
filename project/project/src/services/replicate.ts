interface ReplicateGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  model?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

interface ReplicateResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
  urls?: {
    get: string;
    cancel: string;
  };
}

export class ReplicateService {
  private static instance: ReplicateService;
  private proxyUrl: string;

  constructor() {
    // Use the Supabase Edge Function as a proxy to avoid CORS issues
    this.proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/replicate-proxy`;
  }

  static getInstance(): ReplicateService {
    if (!ReplicateService.instance) {
      ReplicateService.instance = new ReplicateService();
    }
    return ReplicateService.instance;
  }

  async generateImage(request: ReplicateGenerationRequest): Promise<ReplicateResponse> {
    if (!this.proxyUrl) {
      throw new Error('Supabase URL not configured. Please check your .env file');
    }

    try {
      console.log('🎨 Starting Replicate image generation via proxy:', request);

      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          negative_prompt: request.negative_prompt || 'blurry, bad quality, distorted',
          width: request.width || 1024,
          height: request.height || 1024,
          num_inference_steps: request.num_inference_steps || 25,
          guidance_scale: request.guidance_scale || 7.5,
          seed: request.seed,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Proxy API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ Replicate prediction created via proxy:', result.id);
      
      return result;
    } catch (error) {
      console.error('❌ Replicate generation failed:', error);
      throw error;
    }
  }

  async getPrediction(id: string): Promise<ReplicateResponse> {
    if (!this.proxyUrl) {
      throw new Error('Supabase URL not configured');
    }

    try {
      const response = await fetch(`${this.proxyUrl}?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get prediction: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get prediction:', error);
      throw error;
    }
  }

  async waitForCompletion(id: string, maxWaitTime: number = 60000): Promise<ReplicateResponse> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const prediction = await this.getPrediction(id);
      
      if (prediction.status === 'succeeded' || prediction.status === 'failed') {
        return prediction;
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Generation timed out');
  }
}

export const replicateService = ReplicateService.getInstance();