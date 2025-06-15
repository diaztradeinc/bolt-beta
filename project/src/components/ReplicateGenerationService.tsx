import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Download, RefreshCw, AlertCircle, CheckCircle, ExternalLink, Key, Loader2 } from 'lucide-react';
import { useReplicate } from '../hooks/useReplicate';
import type { GenerationRequest } from '../types/models';

interface ReplicateGenerationServiceProps {
  onImageGenerated: (imageUrl: string) => void;
}

export const ReplicateGenerationService: React.FC<ReplicateGenerationServiceProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const { generateImage, isGenerating, error } = useReplicate();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    const request: GenerationRequest = {
      prompt,
      negativePrompt,
      model: 'SDXL',
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
      link.download = `dreamflux_replicate_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      // In a real app, you'd want to store this securely
      localStorage.setItem('replicate_api_key', apiKey);
      window.location.reload(); // Reload to pick up the new API key
    }
  };

  return (
    <div className="bg-neural-800/30 backdrop-blur-sm border border-neural-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Replicate AI Generation</h3>
        <div className="px-2 py-1 bg-blue-600/20 rounded-full text-xs text-blue-300">
          Real AI
        </div>
      </div>
      
      <p className="text-sm text-neural-400 mb-6">
        Generate real AI images using Replicate's cloud infrastructure. Requires a Replicate API token.
      </p>

      {/* API Key Setup */}
      {!import.meta.env.VITE_REPLICATE_API_TOKEN && (
        <div className="mb-6 p-4 bg-yellow-600/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-semibold text-yellow-300">API Key Required</h4>
          </div>
          <p className="text-xs text-yellow-200 mb-3">
            You need a Replicate API token to generate images. Get one free at replicate.com
          </p>
          
          {!showApiKeyInput ? (
            <div className="flex gap-2">
              <motion.button
                onClick={() => setShowApiKeyInput(true)}
                className="px-3 py-2 bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 rounded-lg hover:bg-yellow-600/30 transition-all duration-300 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Enter API Key
              </motion.button>
              <motion.a
                href="https://replicate.com/account/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-300 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Get API Key</span>
                <ExternalLink className="w-3 h-3" />
              </motion.a>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="r8_..."
                className="flex-1 px-3 py-2 bg-neural-800 border border-neural-700 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none"
              />
              <motion.button
                onClick={handleSetApiKey}
                className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Save
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Generation Interface */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neural-300 mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A beautiful landscape with mountains and a lake, digital art, highly detailed"
            className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white placeholder-neural-400 resize-none focus:border-blue-500 focus:outline-none"
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
          disabled={isGenerating || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <Zap className="w-4 h-4" />
              <span>Generate with Replicate</span>
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
                <div className="px-2 py-1 bg-green-600/80 text-green-200 rounded-full text-xs font-medium">
                  Generated by Replicate
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
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-xl hover:bg-blue-600/30 transition-all duration-300"
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
      <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 About Replicate</h4>
        <ul className="text-xs text-neural-400 space-y-1">
          <li>• Uses SDXL model for high-quality 1024x1024 images</li>
          <li>• Typically takes 10-30 seconds per image</li>
          <li>• Pay-per-use pricing (around $0.01-0.05 per image)</li>
          <li>• No setup required - works immediately with API key</li>
          <li>• Professional quality results</li>
        </ul>
      </div>
    </div>
  );
};