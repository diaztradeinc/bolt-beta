import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Upload, 
  X, 
  Zap, 
  RotateCcw,
  Sliders,
  Eye
} from 'lucide-react';

interface Image2ImageSectionProps {
  evolvedImage: string | null;
  onClearEvolvedImage: () => void;
}

export const Image2ImageSection: React.FC<Image2ImageSectionProps> = ({
  evolvedImage,
  onClearEvolvedImage
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [strength, setStrength] = useState(0.7);
  const [controlMode, setControlMode] = useState('img2img');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (type: 'uploaded' | 'evolved') => {
    if (type === 'uploaded') {
      setUploadedImage(null);
    } else {
      onClearEvolvedImage();
    }
  };

  const currentImage = evolvedImage || uploadedImage;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <div className="bg-neural-800/30 backdrop-blur-sm border border-neural-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-600/20 rounded-xl">
            <ImageIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Image to Image</h3>
            <p className="text-sm text-neural-400">Transform existing images with AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Upload/Display */}
          <div className="space-y-4">
            <div className="relative">
              {currentImage ? (
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-purple-500/50 bg-neural-800/50">
                    <img
                      src={currentImage}
                      alt="Source image"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neural-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Remove Button */}
                    <motion.button
                      onClick={() => handleRemoveImage(evolvedImage ? 'evolved' : 'uploaded')}
                      className="absolute top-2 right-2 p-2 bg-red-600/80 text-red-200 rounded-full backdrop-blur-sm hover:bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>

                    {/* Image Type Indicator */}
                    <div className="absolute bottom-2 left-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        evolvedImage 
                          ? 'bg-purple-600/80 text-purple-200' 
                          : 'bg-blue-600/80 text-blue-200'
                      }`}>
                        {evolvedImage ? 'Evolved Image' : 'Uploaded Image'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.label
                  className="relative block w-full h-48 border-2 border-dashed border-neural-600 rounded-xl cursor-pointer hover:border-purple-500/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <div className="p-3 bg-purple-600/20 rounded-xl mb-3 group-hover:bg-purple-600/30 transition-colors">
                      <Upload className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">Upload Reference Image</p>
                    <p className="text-xs text-neural-400">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </motion.label>
              )}
            </div>

            {/* Control Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-neural-300 mb-2">Control Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'img2img', label: 'Image to Image', icon: ImageIcon },
                  { key: 'controlnet', label: 'ControlNet', icon: Sliders }
                ].map((mode) => (
                  <motion.button
                    key={mode.key}
                    onClick={() => setControlMode(mode.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      controlMode === mode.key
                        ? 'bg-purple-600 text-white'
                        : 'bg-neural-800/60 text-neural-300 hover:bg-neural-700/60 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <mode.icon className="w-4 h-4" />
                    <span>{mode.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Strength Slider */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-neural-300 mb-3">
                <span>Denoising Strength</span>
                <span className="text-purple-400">{strength.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="w-full h-2 bg-neural-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-neural-500 mt-1">
                <span>Subtle (0.1)</span>
                <span>Strong (1.0)</span>
              </div>
            </div>

            {/* Additional Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neural-300 mb-2">Resize Mode</label>
                <select 
                  className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="crop">Crop and Resize</option>
                  <option value="resize">Just Resize</option>
                  <option value="crop_smart">Crop and Resize (Smart)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neural-300 mb-2">Width</label>
                  <input
                    type="number"
                    defaultValue={512}
                    className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neural-300 mb-2">Height</label>
                  <input
                    type="number"
                    defaultValue={512}
                    className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                disabled={!currentImage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap className="w-4 h-4" />
                <span>Transform</span>
              </motion.button>
              
              <motion.button
                disabled={!currentImage}
                className="px-4 py-3 bg-neural-800/60 border border-neural-700/50 text-neural-300 rounded-xl hover:bg-neural-700/60 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
          <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 Image to Image Tips</h4>
          <ul className="text-xs text-neural-400 space-y-1">
            <li>• Lower strength (0.1-0.4) for subtle changes, higher (0.6-1.0) for dramatic transformations</li>
            <li>• Use evolved images from previous generations for iterative refinement</li>
            <li>• ControlNet mode provides more precise control over composition and structure</li>
            <li>• Match your prompt to the desired changes while keeping the base composition</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};