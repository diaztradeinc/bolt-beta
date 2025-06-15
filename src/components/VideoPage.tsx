import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Play, 
  RotateCcw, 
  Settings, 
  Clock, 
  Film, 
  Zap,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Loader2
} from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { useComfyUI } from '../hooks/useComfyUI';
import type { CivitaiModel, VideoGenerationRequest } from '../types/models';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const GlowCard = ({ children, className = "", onClick, hover = true }: GlowCardProps) => (
  <motion.div
    onClick={onClick}
    className={`relative bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-2xl overflow-hidden ${className}`}
    whileHover={hover ? { scale: 1.02, y: -2 } : {}}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
    <div className="relative z-10">{children}</div>
    <motion.div
      className="absolute inset-0 opacity-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10"
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  </motion.div>
);

export const VideoPage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [duration, setDuration] = useState(4);
  const [fps, setFps] = useState(24);
  const [resolution, setResolution] = useState("512x512");
  const [motionStrength, setMotionStrength] = useState(0.7);
  const [seed, setSeed] = useState(-1);
  const [steps, setSteps] = useState(20);
  const [guidance, setGuidance] = useState(7.5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showVideoModelModal, setShowVideoModelModal] = useState(false);
  const [selectedVideoModel, setSelectedVideoModel] = useState<CivitaiModel | null>(null);
  const [interpolation, setInterpolation] = useState('linear');
  const [scheduler, setScheduler] = useState('ddim');

  const { generateVideo, isGenerating, isConnected, error } = useComfyUI();

  const handleGenerate = async () => {
    if (!isConnected) {
      alert('ComfyUI is not connected. Please check your connection.');
      return;
    }

    if (!prompt.trim()) {
      alert('Please enter a prompt for video generation.');
      return;
    }

    const videoRequest: VideoGenerationRequest = {
      prompt,
      negativePrompt,
      model: selectedVideoModel?.name || 'wan2.1.safetensors',
      duration,
      fps,
      resolution,
      motionStrength,
      steps,
      guidance,
      scheduler,
      seed: seed === -1 ? undefined : seed,
      sourceImage: uploadedImage || undefined,
      interpolation
    };

    console.log('Generating video with request:', videoRequest);

    try {
      const response = await generateVideo(videoRequest);
      console.log('Video generation response:', response);
      
      if (response.status === 'failed') {
        alert(`Video generation failed: ${response.error}`);
      } else {
        console.log('Video generation started successfully');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to start video generation. Please try again.');
    }
  };

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

  const handleVideoModelSelect = (model: CivitaiModel) => {
    setSelectedVideoModel(model);
    setShowVideoModelModal(false);
  };

  const recentVideos = Array(4).fill("https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg");

  // Common props for GlowCard when they're not interactive
  const staticGlowCardProps = {
    hover: false,
    onClick: () => {} // Empty function to satisfy TypeScript
  };

  return (
    <div className="space-y-8 overflow-y-auto max-h-screen pb-20">
      {/* Video Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlowCard
          onClick={() => setShowVideoModelModal(true)}
          className="p-6 cursor-pointer group"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              {selectedVideoModel?.modelVersions[0]?.images[0] ? (
                <div className="relative overflow-hidden rounded-2xl">
                  <img 
                    src={selectedVideoModel.modelVersions[0].images[0].url} 
                    alt={selectedVideoModel.name} 
                    className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neural-900/40 to-transparent" />
                  {/* Selected indicator */}
                  <div className="absolute top-1 right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-neural-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-neural-600 group-hover:border-purple-500 transition-colors">
                  <Video className="w-6 h-6 text-neural-500 group-hover:text-purple-400 transition-colors" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-300">
                {selectedVideoModel ? 'Selected' : 'Select'} Video Model
              </p>
              <p className="text-xs text-neural-400 mt-1">
                {selectedVideoModel?.name || "Wan2.1 compatible video generation model"}
              </p>
              {selectedVideoModel && (
                <p className="text-xs text-neural-500 mt-1">
                  {selectedVideoModel.modelVersions[0]?.baseModel}
                </p>
              )}
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Image Upload Section - Always visible, but contextual based on main toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlowCard className="p-6" {...staticGlowCardProps}>
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Source Image (Optional)</h3>
            <span className="text-xs text-neural-400 bg-neural-700/50 px-2 py-1 rounded-full">
              For Image2Video mode
            </span>
          </div>
          
          {uploadedImage ? (
            <div className="relative group">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={uploadedImage}
                  alt="Source for video"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neural-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <motion.button
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-2 right-2 p-2 bg-red-600/80 text-red-200 rounded-full backdrop-blur-sm hover:bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
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
                <p className="text-sm font-medium text-white mb-1">Upload Source Image</p>
                <p className="text-xs text-neural-400">PNG, JPG up to 10MB • Leave empty for Text2Video</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </motion.label>
          )}
        </GlowCard>
      </motion.div>

      {/* Prompt Areas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="relative">
          <textarea
            className="w-full p-6 bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-2xl text-white placeholder-neural-400 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
            placeholder={uploadedImage 
              ? "Describe how you want the image to animate... Add gentle movement, flowing water, swaying trees..."
              : "Describe the video you want to create... A serene lake with gentle ripples, birds flying overhead..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <div className="absolute top-4 right-4">
            <Video className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="relative">
          <textarea
            className="w-full p-6 bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-2xl text-white placeholder-neural-400 resize-none focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
            placeholder="What to avoid in the video... static elements, abrupt movements, flickering..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            rows={2}
          />
          <div className="absolute top-4 right-4">
            <X className="w-5 h-5 text-red-400" />
          </div>
        </div>
      </motion.div>

      {/* Quick Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <GlowCard className="p-6" {...staticGlowCardProps}>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Duration</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neural-300">{duration} seconds</span>
              <span className="text-xs text-neural-500">{duration * fps} frames</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-neural-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-neural-500">
              <span>2s</span>
              <span>10s</span>
            </div>
          </div>
        </GlowCard>

        <GlowCard className="p-6" {...staticGlowCardProps}>
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Resolution</h3>
          </div>
          <select 
            value={resolution} 
            onChange={(e) => setResolution(e.target.value)} 
            className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="512x512">512x512 (Square)</option>
            <option value="768x512">768x512 (Landscape)</option>
            <option value="512x768">512x768 (Portrait)</option>
            <option value="1024x576">1024x576 (Widescreen)</option>
          </select>
        </GlowCard>

        <GlowCard className="p-6" {...staticGlowCardProps}>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Motion</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neural-300">Strength</span>
              <span className="text-sm text-purple-400">{motionStrength.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={motionStrength}
              onChange={(e) => setMotionStrength(Number(e.target.value))}
              className="w-full h-2 bg-neural-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-neural-500">
              <span>Subtle</span>
              <span>Dynamic</span>
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Generate Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating || !isConnected}
          className="relative px-12 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-5 h-5" />
              </motion.div>
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>
              {isGenerating ? "Generating Video..." : 
               !isConnected ? "ComfyUI Disconnected" : 
               "Generate Video"}
            </span>
          </div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.button>
      </motion.div>

      {/* Connection Status */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-xl text-sm">
            {error}
          </div>
        </motion.div>
      )}

      {/* Advanced Options Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-6 py-3 bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-xl text-neural-300 hover:text-white hover:border-purple-500/50 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings className="w-4 h-4" />
          <span>Advanced Video Settings</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </motion.button>
      </motion.div>

      {/* Advanced Options */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlowCard className="p-8" {...staticGlowCardProps}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video Settings */}
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-neural-300 mb-3">
                      <span>Frame Rate</span>
                      <span className="text-purple-400">{fps} FPS</span>
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="60"
                      step="6"
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                      className="w-full h-2 bg-neural-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                    <div className="flex justify-between text-xs text-neural-500 mt-1">
                      <span>12 FPS</span>
                      <span>60 FPS</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-neural-300 mb-3">
                      <span>Generation Steps</span>
                      <span className="text-purple-400">{steps}</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={steps}
                      onChange={(e) => setSteps(Number(e.target.value))}
                      className="w-full h-2 bg-neural-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-neural-300 mb-3">
                      <span>Guidance Scale</span>
                      <span className="text-purple-400">{guidance}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="0.5"
                      value={guidance}
                      onChange={(e) => setGuidance(Number(e.target.value))}
                      className="w-full h-2 bg-neural-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                </div>

                {/* Additional Controls */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neural-300 mb-2">Interpolation</label>
                    <select 
                      value={interpolation}
                      onChange={(e) => setInterpolation(e.target.value)}
                      className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="linear">Linear</option>
                      <option value="cubic">Cubic Spline</option>
                      <option value="bezier">Bezier Curve</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neural-300 mb-2">Video Scheduler</label>
                    <select 
                      value={scheduler}
                      onChange={(e) => setScheduler(e.target.value)}
                      className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="ddim">DDIM (Recommended)</option>
                      <option value="euler">Euler</option>
                      <option value="dpm">DPM++ 2M</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neural-300 mb-2">Seed</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(Number(e.target.value))}
                        placeholder="Random (-1)"
                        className="flex-1 p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                      />
                      <motion.button
                        onClick={() => setSeed(-1)}
                        className="px-3 py-3 bg-neural-700 text-white rounded-xl hover:bg-neural-600 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Videos */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <Film className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Recent Videos</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentVideos.map((video, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              className="group cursor-pointer"
            >
              <GlowCard className="p-2" onClick={() => {}}>
                <div className="relative overflow-hidden rounded-xl">
                  <img 
                    src={video} 
                    alt={`Video ${idx + 1}`} 
                    className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neural-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="p-2 bg-purple-600/80 rounded-full backdrop-blur-sm">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-neural-900/80 rounded text-xs text-white">
                    {duration}s
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Video Model Selector Modal */}
      <ModelSelector
        isOpen={showVideoModelModal}
        onClose={() => setShowVideoModelModal(false)}
        onSelect={handleVideoModelSelect}
        activeTab="Video"
        title="Select Video Model"
        selectorType="video"
      />
    </div>
  );
};