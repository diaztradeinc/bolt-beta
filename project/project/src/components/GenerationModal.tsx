import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Trash2, 
  RotateCcw, 
  Zap, 
  ArrowUp, 
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Share2,
  Heart,
  Eye,
  Shield,
  Brain
} from 'lucide-react';
import { useHuggingFace } from '../hooks/useHuggingFace';
import { useComfyUI } from '../hooks/useComfyUI';
import type { GenerationRequest, GenerationResponse } from '../types/models';

interface GeneratedImage {
  id: string;
  url: string;
  seed: number;
  processingTime: number;
  timestamp: number;
}

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: GenerationRequest;
  onEvolve: (imageUrl: string) => void;
  onImageGenerated?: (imageUrl: string) => void;
  selectedEmbedding?: any;
  selectedLora?: any;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  onClose,
  request,
  onEvolve,
  onImageGenerated,
  selectedEmbedding,
  selectedLora
}) => {
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<string>('Ready to generate...');
  const [selectedService, setSelectedService] = useState<'huggingface' | 'comfyui'>('huggingface');

  const { generateImage: generateWithHF, isGenerating: hfGenerating, error: hfError, isConfigured: hfConfigured } = useHuggingFace();
  const { generateImage: generateWithComfyUI, isGenerating: comfyGenerating, isConnected, error: comfyError } = useComfyUI();

  const isGenerating = hfGenerating || comfyGenerating;
  const currentError = error || hfError || comfyError;

  // Auto-select best available service
  useEffect(() => {
    if (isConnected) {
      setSelectedService('comfyui');
    } else if (hfConfigured) {
      setSelectedService('huggingface');
    }
  }, [isConnected, hfConfigured]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImage(null);
      setError(null);
      setGenerationStage('Ready to generate...');
      startGeneration();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentImage(null);
      setError(null);
      setGenerationStage('Ready to generate...');
    }
  }, [isOpen]);

  const startGeneration = async () => {
    if (!request.prompt.trim()) {
      setError('Please enter a prompt for image generation.');
      return;
    }

    try {
      setError(null);
      setCurrentImage(null);
      
      let response: GenerationResponse;
      
      if (selectedService === 'comfyui' && isConnected) {
        setGenerationStage('Starting generation with ComfyUI...');
        response = await generateWithComfyUI(request);
      } else if (selectedService === 'huggingface' && hfConfigured) {
        setGenerationStage('Starting generation with Hugging Face...');
        console.log('🎯 Passing embeddings and LoRAs to Hugging Face:', {
          embedding: selectedEmbedding?.name || 'None',
          lora: selectedLora?.name || 'None'
        });
        response = await generateWithHF(request, selectedEmbedding, selectedLora);
      } else {
        throw new Error('No generation service available. Please configure Hugging Face API key or connect ComfyUI.');
      }

      if (response.status === 'failed') {
        setError(response.error || 'Generation failed');
        setGenerationStage('Generation failed');
      } else if (response.status === 'completed' && response.images && response.images.length > 0) {
        const mockImage: GeneratedImage = {
          id: response.id,
          url: response.images[0],
          seed: response.metadata?.seed || Math.floor(Math.random() * 1000000),
          processingTime: response.metadata?.processingTime || 15.2,
          timestamp: Date.now()
        };
        setCurrentImage(mockImage);
        setGenerationStage('Generation complete');
        
        // Add to recent images
        if (onImageGenerated) {
          onImageGenerated(response.images[0]);
        }
      } else if (response.status === 'queued') {
        setGenerationStage('Generation queued successfully');
        // For ComfyUI, we'd listen for WebSocket events here
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      setGenerationStage('Generation failed');
      console.error('Image generation error:', err);
    }
  };

  const handleRegenerate = () => {
    startGeneration();
  };

  const handleUpscale = async () => {
    if (!currentImage) return;
    
    setGenerationStage('Upscaling image...');
    
    // Create upscale request with higher resolution
    const upscaleRequest = {
      ...request,
      prompt: `${request.prompt}, high resolution, detailed, 4k, upscaled`,
      steps: Math.min(request.steps + 10, 50)
    };

    try {
      let response: GenerationResponse;
      
      if (selectedService === 'comfyui' && isConnected) {
        response = await generateWithComfyUI(upscaleRequest);
      } else {
        response = await generateWithHF(upscaleRequest, selectedEmbedding, selectedLora);
      }
      
      if (response.status === 'completed') {
        console.log('✅ Upscale completed');
        setGenerationStage('Upscale completed');
      }
    } catch (err) {
      setError('Failed to start upscaling');
      console.error('Upscale error:', err);
    }
  };

  const handleSave = () => {
    if (!currentImage) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = `dreamflux_${currentImage.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = () => {
    setCurrentImage(null);
    setError(null);
    setGenerationStage('Ready to generate...');
  };

  const handleEvolve = () => {
    if (!currentImage) return;
    onEvolve(currentImage.url);
    onClose();
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(request.prompt);
  };

  // Helper function to check if error is NSFW-related
  const isNSFWError = (errorMessage: string) => {
    return errorMessage.toLowerCase().includes('nsfw content detected') || 
           errorMessage.toLowerCase().includes('not safe for work');
  };

  // Helper function to get appropriate error display
  const getErrorDisplay = (errorMessage: string) => {
    if (isNSFWError(errorMessage)) {
      return {
        icon: Shield,
        title: 'Content Policy Violation',
        message: 'NSFW content detected. Please revise your prompt to remove any explicit, violent, or inappropriate terms.',
        suggestions: [
          'Remove any explicit or adult content references',
          'Avoid violent or disturbing imagery descriptions',
          'Use more general, family-friendly terms',
          'Consider using ComfyUI locally for unrestricted generation'
        ]
      };
    }
    
    return {
      icon: AlertCircle,
      title: 'Generation Failed',
      message: errorMessage,
      suggestions: []
    };
  };

  if (!isOpen) return null;

  const errorDisplay = currentError ? getErrorDisplay(currentError) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="bg-neural-900/95 backdrop-blur-xl rounded-3xl w-[900px] max-h-[90vh] text-white relative border border-neural-700/50 flex flex-col overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neural-700/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyber-pink-600 to-cyber-pink-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-cyber-pink-300 bg-clip-text text-transparent">
                  Dream Generation
                </h2>
                <p className="text-sm text-neural-400">
                  {isGenerating ? generationStage : currentImage ? 'Generation Complete' : 'Ready to Generate'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Service Selection */}
              <div className="flex bg-neural-800/60 rounded-xl border border-neural-700/50 overflow-hidden">
                <motion.button
                  onClick={() => setSelectedService('huggingface')}
                  disabled={!hfConfigured}
                  className={`px-3 py-2 text-xs font-medium transition-all duration-300 flex items-center gap-1 ${
                    selectedService === 'huggingface'
                      ? 'bg-orange-600 text-white'
                      : 'text-neural-400 hover:text-white disabled:opacity-50'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain className="w-3 h-3" />
                  <span>Hugging Face</span>
                </motion.button>
                <motion.button
                  onClick={() => setSelectedService('comfyui')}
                  disabled={!isConnected}
                  className={`px-3 py-2 text-xs font-medium transition-all duration-300 flex items-center gap-1 ${
                    selectedService === 'comfyui'
                      ? 'bg-green-600 text-white'
                      : 'text-neural-400 hover:text-white disabled:opacity-50'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Zap className="w-3 h-3" />
                  <span>ComfyUI</span>
                </motion.button>
              </div>

              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                selectedService === 'comfyui' 
                  ? (isConnected ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300')
                  : (hfConfigured ? 'bg-orange-600/20 text-orange-300' : 'bg-red-600/20 text-red-300')
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  selectedService === 'comfyui' 
                    ? (isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400')
                    : (hfConfigured ? 'bg-orange-400 animate-pulse' : 'bg-red-400')
                }`} />
                {selectedService === 'comfyui' 
                  ? (isConnected ? 'ComfyUI Connected' : 'ComfyUI Disconnected')
                  : (hfConfigured ? 'Hugging Face Ready' : 'HF Not Configured')
                }
              </div>
              
              <motion.button 
                onClick={onClose} 
                className="text-neural-400 hover:text-cyber-pink-400 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Image Display */}
            <div className="flex-1 p-6 flex flex-col overflow-y-auto">
              <div className="flex-1 bg-neural-800/30 rounded-2xl border border-neural-700/50 overflow-hidden relative min-h-[400px]">
                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 mx-auto mb-4"
                      >
                        <Loader2 className="w-full h-full text-cyber-pink-400" />
                      </motion.div>
                      <p className="text-lg font-semibold text-white mb-2">{generationStage}</p>
                      <p className="text-sm text-neural-400">
                        {selectedService === 'comfyui' ? 'Processing with ComfyUI...' : 'Processing with Hugging Face...'}
                      </p>
                      {selectedService === 'huggingface' && (selectedEmbedding || selectedLora) && (
                        <div className="mt-4 text-xs text-neural-500">
                          <p>Applying enhancements:</p>
                          {selectedEmbedding && <p>• Embedding: {selectedEmbedding.name}</p>}
                          {selectedLora && <p>• LoRA: {selectedLora.name}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : currentImage ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={currentImage.url}
                      alt="Generated image"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neural-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Image Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 bg-neural-900/80 backdrop-blur-sm rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-neural-300">Seed: <span className="text-white font-mono">{currentImage.seed}</span></span>
                          <span className="text-neural-300">Time: <span className="text-white">{currentImage.processingTime.toFixed(1)}s</span></span>
                          <span className="text-neural-300">Service: <span className="text-white">{selectedService === 'comfyui' ? 'ComfyUI' : 'Hugging Face'}</span></span>
                          {selectedService === 'huggingface' && (selectedEmbedding || selectedLora) && (
                            <span className="text-neural-300">Enhanced: <span className="text-cyber-pink-400">Yes</span></span>
                          )}
                        </div>
                        <motion.button
                          onClick={handleCopyPrompt}
                          className="flex items-center gap-1 px-2 py-1 bg-cyber-pink-600/20 border border-cyber-pink-500/30 text-cyber-pink-300 rounded-lg hover:bg-cyber-pink-600/30 transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Copy className="w-3 h-3" />
                          <span className="text-xs">Copy Prompt</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ) : errorDisplay ? (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                      <errorDisplay.icon className={`w-16 h-16 mx-auto mb-4 ${isNSFWError(currentError!) ? 'text-orange-400' : 'text-red-400'}`} />
                      <p className={`text-lg font-semibold mb-2 ${isNSFWError(currentError!) ? 'text-orange-400' : 'text-red-400'}`}>
                        {errorDisplay.title}
                      </p>
                      <p className="text-sm text-neural-400 mb-4 leading-relaxed">
                        {errorDisplay.message}
                      </p>
                      
                      {errorDisplay.suggestions.length > 0 && (
                        <div className="mb-6 text-left">
                          <p className="text-sm font-medium text-white mb-2">Suggestions:</p>
                          <ul className="text-xs text-neural-300 space-y-1">
                            {errorDisplay.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-cyber-pink-400 mt-1">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <motion.button
                        onClick={handleRegenerate}
                        className="px-6 py-2 bg-cyber-pink-600 text-white rounded-xl hover:bg-cyber-pink-500 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Try Again
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-16 h-16 text-neural-600 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-neutral-400">
                        Ready to Generate
                      </p>
                      <p className="text-sm text-neural-400 mt-2">
                        Using {selectedService === 'comfyui' ? 'ComfyUI' : 'Hugging Face'} for generation
                      </p>
                      {selectedService === 'huggingface' && (selectedEmbedding || selectedLora) && (
                        <div className="mt-4 text-xs text-neural-500">
                          <p>Enhancements ready:</p>
                          {selectedEmbedding && <p>• Embedding: {selectedEmbedding.name}</p>}
                          {selectedLora && <p>• LoRA: {selectedLora.name}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls Panel */}
            <div className="w-80 p-6 border-l border-neural-700/50 flex flex-col overflow-y-auto">
              {/* Generation Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Generation Settings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neural-400">Model:</span>
                    <span className="text-white font-medium">{request.model || 'SDXL'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neural-400">Steps:</span>
                    <span className="text-white">{request.steps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neural-400">Guidance:</span>
                    <span className="text-white">{request.guidance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neural-400">Sampler:</span>
                    <span className="text-white">{request.sampler}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neural-400">Aspect Ratio:</span>
                    <span className="text-white">{request.aspectRatio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neural-400">Service:</span>
                    <span className={selectedService === 'comfyui' ? 'text-green-400' : 'text-orange-400'}>
                      {selectedService === 'comfyui' ? 'ComfyUI' : 'Hugging Face'}
                    </span>
                  </div>
                  {selectedEmbedding && (
                    <div className="flex justify-between">
                      <span className="text-neural-400">Embedding:</span>
                      <span className="text-purple-400 text-xs">{selectedEmbedding.name}</span>
                    </div>
                  )}
                  {selectedLora && (
                    <div className="flex justify-between">
                      <span className="text-neural-400">LoRA:</span>
                      <span className="text-green-400 text-xs">{selectedLora.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Display */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Prompt</h3>
                <div className="bg-neural-800/50 rounded-xl p-3 border border-neural-700/50">
                  <p className="text-sm text-neural-300 leading-relaxed">
                    {request.prompt}
                  </p>
                  {request.negativePrompt && (
                    <div className="mt-3 pt-3 border-t border-neural-700/50">
                      <p className="text-xs text-red-400 mb-1">Negative Prompt:</p>
                      <p className="text-xs text-neural-400 leading-relaxed">
                        {request.negativePrompt}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {currentError && (
                <div className="mb-6">
                  <div className={`border rounded-xl p-3 ${
                    isNSFWError(currentError) 
                      ? 'bg-orange-600/10 border-orange-500/30' 
                      : 'bg-red-600/10 border-red-500/30'
                  }`}>
                    <div className="flex items-start gap-2">
                      {isNSFWError(currentError) ? (
                        <Shield className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className={`text-sm font-medium mb-1 ${
                          isNSFWError(currentError) ? 'text-orange-300' : 'text-red-300'
                        }`}>
                          {isNSFWError(currentError) ? 'Content Policy Violation' : 'Generation Error'}
                        </p>
                        <p className="text-xs text-neural-400 leading-relaxed">
                          {isNSFWError(currentError) 
                            ? 'Please revise your prompt to comply with content policies.'
                            : currentError
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="space-y-3">
                  {/* Primary Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white font-semibold rounded-xl hover:from-cyber-pink-500 hover:to-cyber-pink-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-sm">Regenerate</span>
                    </motion.button>

                    <motion.button
                      onClick={handleUpscale}
                      disabled={!currentImage || isGenerating}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-neon-blue-600 to-neon-blue-500 text-white font-semibold rounded-xl hover:from-neon-blue-500 hover:to-neon-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowUp className="w-4 h-4" />
                      <span className="text-sm">Upscale</span>
                    </motion.button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      onClick={handleSave}
                      disabled={!currentImage}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600/20 border border-green-500/30 text-green-300 rounded-xl hover:bg-green-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Save</span>
                    </motion.button>

                    <motion.button
                      onClick={handleDelete}
                      disabled={!currentImage}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Delete</span>
                    </motion.button>
                  </div>

                  {/* Evolve Button */}
                  <motion.button
                    onClick={handleEvolve}
                    disabled={!currentImage}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Evolve Image</span>
                  </motion.button>

                  {/* Additional Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      disabled={!currentImage}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-neural-800/60 border border-neural-700/50 text-neural-300 rounded-xl hover:bg-neural-700/60 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 className="w-3 h-3" />
                      <span className="text-xs">Share</span>
                    </motion.button>

                    <motion.button
                      disabled={!currentImage}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-neural-800/60 border border-neural-700/50 text-neural-300 rounded-xl hover:bg-neural-700/60 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Heart className="w-3 h-3" />
                      <span className="text-xs">Favorite</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};