import { useState, useCallback } from 'react';
import { huggingFaceService } from '../services/huggingface';
import type { GenerationRequest, GenerationResponse } from '../types/models';

export interface UseHuggingFaceReturn {
  generateImage: (request: GenerationRequest, selectedEmbedding?: any, selectedLora?: any) => Promise<GenerationResponse>;
  isGenerating: boolean;
  error: string | null;
  isConfigured: boolean;
}

export function useHuggingFace(): UseHuggingFaceReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(async (
    request: GenerationRequest, 
    selectedEmbedding?: any, 
    selectedLora?: any
  ): Promise<GenerationResponse> => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log('🤗 Starting Hugging Face generation with request:', request);
      console.log('🎯 Selected embedding:', selectedEmbedding?.name || 'None');
      console.log('🎨 Selected LoRA:', selectedLora?.name || 'None');

      // Convert aspect ratio to dimensions (with limits for free tier)
      const aspectRatioMap: Record<string, { width: number; height: number }> = {
        '1:1': { width: 512, height: 512 },
        '16:9': { width: 768, height: 432 },
        '9:16': { width: 432, height: 768 },
        '4:3': { width: 640, height: 480 },
        '3:4': { width: 480, height: 640 }
      };

      const dimensions = aspectRatioMap[request.aspectRatio] || { width: 512, height: 512 };

      // Generate image using Hugging Face with Civitai model mapping and embeddings/LoRAs
      const imageBlob = await huggingFaceService.generateImageWithCivitaiModel(
        request.prompt,
        request.model || 'SDXL',
        'SDXL', // Default base model
        {
          negative_prompt: request.negativePrompt,
          steps: Math.min(request.steps || 20, 50), // Limit steps for free tier
          guidance: request.guidance,
          width: dimensions.width,
          height: dimensions.height,
          seed: Math.floor(Math.random() * 1000000),
          selectedEmbedding,
          selectedLora
        }
      );

      // Convert blob to URL
      const imageUrl = URL.createObjectURL(imageBlob);

      console.log('✅ Hugging Face generation completed with embeddings/LoRAs applied');

      return {
        id: `hf_${Date.now()}`,
        status: 'completed',
        images: [imageUrl],
        metadata: {
          seed: Math.floor(Math.random() * 1000000),
          actualSteps: Math.min(request.steps || 20, 50),
          processingTime: 0 // Hugging Face doesn't provide this
        }
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Hugging Face generation error:', err);
      
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
    error,
    isConfigured: huggingFaceService.isConfigured()
  };
}