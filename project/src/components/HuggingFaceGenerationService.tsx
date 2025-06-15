import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Download, RefreshCw, AlertCircle, CheckCircle, ExternalLink, Key, Loader2, Brain } from 'lucide-react';
import { useHuggingFace } from '../hooks/useHuggingFace';
import type { GenerationRequest } from '../types/models';

interface HuggingFaceGenerationServiceProps {
  onImageGenerated: (imageUrl: string) => void;
}

export const HuggingFaceGenerationService: React.FC<HuggingFaceGenerationServiceProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('SDXL Base');

  const { generateImage, isGenerating, error, isConfigured } = useHuggingFace();

  const availableModels = [
    { name: 'SDXL Base', id: 'stabilityai/stable-diffusion-xl-base-1.0', type: 'SDXL' },
    { name: 'Realistic Vision V6', id: 'stabilityai/stable-diffusion-2-1', type: 'SD 2.1' },
    { name: 'DreamShaper', id: 'Lykon/DreamShaper', type: 'SD 1.5' },
    { name: 'Waifu Diffusion', id: 'hakurei/waifu-diffusion', type: 'Anime' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    const request: GenerationRequest = {
      prompt,
      negativePrompt,
      model: selectedModel,
      steps: 25,
      guidance: 7.5,
      aspectRatio: '1:1',
      sampler: 'DPMSolverMultistep',
      qualityBoost: true,
      faceDetail: false,
      clipSkip: 1
    };

    try {
      const response = await generateImage(request);
      
      if (response.status === 'completed' && response.images && response.images.length > 0) {
        const imageUrl = response.images[0];
        setGeneratedImage(imageUrl);
        onImageGenerated(imageUrl);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `dreamflux_huggingface_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-neural-800/30 backdrop-blur-sm border border-neural-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Hugging Face + Civitai</h3>
        <div className="px-2 py-1 bg-orange-600/20 rounded-full text-xs text-orange-300">
          Real AI + Model Library
        </div>
      </div>
      
      <p className="text-sm text-neural-400 mb-6">
        Generate real AI images using Hugging Face Inference API with models inspired by Civitai's library. 
        Combines the power of Hugging Face infrastructure with popular community models.
      </p>

      {/* API Key Status */}
      {!isConfigured && (
        <div className="mb-6 p-4 bg-yellow-600/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-semibold text-yellow-300">API Key Required</h4>
          </div>
          <p className="text-xs text-yellow-200 mb-3">
            You need a Hugging Face API token. Get one free at huggingface.co
          </p>
          <motion.a
            href="https://huggingface.co/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 bg-orange-600/20 border border-orange-500/30 text-orange-300 rounded-lg hover:bg-orange-600/30 transition-all duration-300 text-sm w-fit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Get API Key</span>
            <ExternalLink className="w-3 h-3" />
          </motion.a>
        </div>
      )}

      {/* Model Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neural-300 mb-2">Model</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-orange-500 focus:outline-none"
        >
          {availableModels.map((model) => (
            <option key={model.id} value={model.name}>
              {model.name} ({model.type})
            </option>
          ))}
        </select>
        <p className="text-xs text-neural-500 mt-1">
          Models are automatically mapped to their Hugging Face equivalents
        </p>
      </div>

      {/* Generation Interface */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neural-300 mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A beautiful landscape with mountains and a lake, digital art, highly detailed"
            className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white placeholder-neural-400 resize-none focus:border-orange-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neural-300 mb-2">Negative Prompt (Optional)</label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="blurry, bad quality, distorted, ugly"
            className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white placeholder-neural-400 resize-none focus:border-red-500 focus:outline-none"
            rows={2}
          />
        </div>

        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || !isConfigured}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              <span>Generate with Hugging Face</span>
            </>
          )}
        </motion.button>

        {error && (
          <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={generatedImage}
                alt="Generated image"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neural-900/60 via-transparent to-transparent" />
              <div className="absolute top-2 right-2">
                <div className="px-2 py-1 bg-orange-600/80 text-orange-200 rounded-full text-xs font-medium">
                  Generated by Hugging Face
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <motion.button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-300 rounded-xl hover:bg-green-600/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </motion.button>
              
              <motion.button
                onClick={handleGenerate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600/20 border border-orange-500/30 text-orange-300 rounded-xl hover:bg-orange-600/30 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate New</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-orange-600/10 border border-orange-500/20 rounded-xl">
        <h4 className="text-sm font-semibold text-orange-300 mb-2">🤗 About Hugging Face + Civitai</h4>
        <ul className="text-xs text-neural-400 space-y-1">
          <li>• Uses Hugging Face Inference API with verified available models</li>
          <li>• Automatically maps popular Civitai models to HF equivalents</li>
          <li>• Free tier available with rate limits</li>
          <li>• High-quality results with professional infrastructure</li>
          <li>• Supports SDXL, SD 2.1, and specialized models</li>
          <li>• No local setup required - works immediately</li>
        </ul>
      </div>

      {/* Model Mapping Info */}
      <div className="mt-4 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">📋 Verified Model Mapping</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {availableModels.map((model, index) => (
            <div key={index} className="flex justify-between">
              <span className="text-neural-300">{model.name}:</span>
              <span className="text-blue-300">{model.type}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-neural-500 mt-2">
          All models have been verified to be available on Hugging Face. When you select a Civitai model in the main interface, it's automatically mapped to the best available equivalent.
        </p>
      </div>
    </div>
  );
};