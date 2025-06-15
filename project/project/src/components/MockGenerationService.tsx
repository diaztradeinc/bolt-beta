import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Download, RefreshCw, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface MockGenerationServiceProps {
  onImageGenerated: (imageUrl: string) => void;
}

export const MockGenerationService: React.FC<MockGenerationServiceProps> = ({ onImageGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Mock image URLs from Pexels (high quality stock photos)
  const mockImages = [
    'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg',
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
    'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg',
    'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg',
    'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg',
    'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg',
    'https://images.pexels.com/photos/2387819/pexels-photo-2387819.jpeg',
    'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg'
  ];

  const handleMockGeneration = async () => {
    setIsGenerating(true);
    
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Pick a random image
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    setGeneratedImage(randomImage);
    onImageGenerated(randomImage);
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `dreamflux_mock_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-neural-800/30 backdrop-blur-sm border border-neural-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Mock Generation Service</h3>
        <div className="px-2 py-1 bg-yellow-600/20 rounded-full text-xs text-yellow-300">
          Demo Mode
        </div>
      </div>
      
      <p className="text-sm text-neural-400 mb-6">
        This is a demonstration mode that generates placeholder images. For real AI generation, 
        you'll need to set up ComfyUI or use an online service.
      </p>

      <div className="space-y-4">
        <motion.button
          onClick={handleMockGeneration}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              <span>Generating Mock Image...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Generate Mock Image</span>
            </>
          )}
        </motion.button>

        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={generatedImage}
                alt="Generated mock image"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neural-900/60 via-transparent to-transparent" />
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
                onClick={handleMockGeneration}
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
    </div>
  );
};