import { useState, useEffect, useCallback } from 'react';
import { comfyUIService } from '../services/comfyui';
import type { GenerationRequest, GenerationResponse, VideoGenerationRequest } from '../types/models';

export interface UseComfyUIReturn {
  isConnected: boolean;
  isGenerating: boolean;
  queue: any[];
  systemStats: any;
  connect: () => Promise<void>;
  disconnect: () => void;
  generateImage: (request: GenerationRequest) => Promise<GenerationResponse>;
  generateVideo: (request: VideoGenerationRequest) => Promise<GenerationResponse>;
  getQueue: () => Promise<void>;
  getSystemStats: () => Promise<void>;
  error: string | null;
}

export function useComfyUI(): UseComfyUIReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      await comfyUIService.connect();
      setIsConnected(true);
      
      // Set up event listeners
      comfyUIService.addEventListener('status', (data: any) => {
        if (data.status) {
          setQueue(data.status.exec_info?.queue_remaining || []);
        }
      });

      comfyUIService.addEventListener('progress', (data: any) => {
        // Handle progress updates
        console.log('Generation progress:', data);
      });

      comfyUIService.addEventListener('executed', (data: any) => {
        // Handle completion
        console.log('Node executed:', data);
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to ComfyUI');
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    comfyUIService.disconnect();
    setIsConnected(false);
  }, []);

  const generateImage = useCallback(async (request: GenerationRequest): Promise<GenerationResponse> => {
    try {
      setError(null);
      setIsGenerating(true);
      
      const response = await comfyUIService.generateImage(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      return {
        id: '',
        status: 'failed',
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateVideo = useCallback(async (request: VideoGenerationRequest): Promise<GenerationResponse> => {
    try {
      setError(null);
      setIsGenerating(true);
      
      console.log('Starting video generation with request:', request);
      const response = await comfyUIService.generateVideo(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate video';
      setError(errorMessage);
      return {
        id: '',
        status: 'failed',
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const getQueue = useCallback(async () => {
    try {
      const queueData = await comfyUIService.getQueue();
      setQueue(queueData.queue_running || []);
    } catch (err) {
      console.error('Failed to get queue:', err);
    }
  }, []);

  const getSystemStats = useCallback(async () => {
    try {
      const stats = await comfyUIService.getSystemStats();
      setSystemStats(stats);
    } catch (err) {
      console.error('Failed to get system stats:', err);
    }
  }, []);

  useEffect(() => {
    // Auto-connect on mount
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isGenerating,
    queue,
    systemStats,
    connect,
    disconnect,
    generateImage,
    generateVideo,
    getQueue,
    getSystemStats,
    error
  };
}