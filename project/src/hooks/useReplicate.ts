import { useState, useCallback } from 'react';
import { replicateService } from '../services/replicate';
import type { GenerationRequest, GenerationResponse } from '../types/models';

export interface UseReplicateReturn {
  generateImage: (request: GenerationRequest) => Promise<GenerationResponse>;
  isGenerating: boolean;
  error: string | null;
}

export function useReplicate(): UseReplicateReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(async (request: GenerationRequest): Promise<GenerationResponse> => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log('🎨 Starting Replicate generation with request:', request);

      // Convert aspect ratio to dimensions
      const aspectRatioMap: Record<string, { width: number; height: number }> = {
        '1:1': { width: 1024, height: 1024 },
        '16:9': { width: 1344, height: 768 },
        '9:16': { width: 768, height: 1344 },
        '4:3': { width: 1152, height: 896 },
        '3:4': { width: 896, height: 1152 }
      };

      const dimensions = aspectRatioMap[request.aspectRatio] || { width: 1024, height: 1024 };

      const replicateRequest = {
        prompt: request.prompt,
        negative_prompt: request.negativePrompt,
        width: dimensions.width,
        height: dimensions.height,
        num_inference_steps: request.steps,
        guidance_scale: request.guidance,
        seed: Math.floor(Math.random() * 1000000)
      };

      // Start the generation
      const prediction = await replicateService.generateImage(replicateRequest);

      // Wait for completion
      const completedPrediction = await replicateService.waitForCompletion(prediction.id);

      if (completedPrediction.status === 'failed') {
        throw new Error(completedPrediction.error || 'Generation failed');
      }

      if (completedPrediction.status === 'succeeded' && completedPrediction.output) {
        return {
          id: prediction.id,
          status: 'completed',
          images: completedPrediction.output,
          metadata: {
            seed: replicateRequest.seed,
            actualSteps: request.steps,
            processingTime: 0 // Replicate doesn't provide this
          }
        };
      }

      throw new Error('Generation completed but no output received');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Replicate generation error:', err);
      
      return {
        id: '',
        status: 'failed',
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateImage,
    isGenerating,
    error
  };
}