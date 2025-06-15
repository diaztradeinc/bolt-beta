import { useState, useEffect } from "react";
import { Brain, X, Sparkles, Cpu, Eye, Settings, Play, ChevronDown, ChevronUp, Layers, Heart, Code, Image, Video, Crown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ModelSelector } from "./components/ModelSelector";
import { FavoritesManager } from "./components/FavoritesManager";
import { ComfyUIStatusBar } from "./components/ComfyUIStatusBar";
import { GenerationModal } from "./components/GenerationModal";
import { Image2ImageSection } from "./components/Image2ImageSection";
import { VideoPage } from "./components/VideoPage";
import { AuthModal } from "./components/AuthModal";
import { PricingModal } from "./components/PricingModal";
import { SubscriptionStatus } from "./components/SubscriptionStatus";
import { AuthPage } from "./pages/AuthPage";
import { SuccessPage } from "./pages/SuccessPage";
import { ProfileDropdown } from "./components/ProfileDropdown";
import { WelcomePage } from "./components/WelcomePage";
import { useAuth } from "./hooks/useAuth";
import { useComfyUI } from "./hooks/useComfyUI";
import type { CivitaiModel } from "./types/models";

interface PageToggleProps {
  isVideoMode: boolean;
  onChange: (mode: boolean) => void;
}

const PageToggle = ({ isVideoMode, onChange }: PageToggleProps) => (
  <motion.div
    className="flex bg-neural-800/60 rounded-2xl p-2 border border-neural-700/50"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  >
    {[
      { key: false, label: 'Image Generation', icon: Image },
      { key: true, label: 'Video Generation', icon: Video }
    ].map((mode) => (
      <motion.button
        key={mode.key.toString()}
        onClick={() => onChange(mode.key)}
        className={`relative px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${
          isVideoMode === mode.key
            ? "text-white shadow-lg" 
            : "text-neural-400 hover:text-cyber-pink-300"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <mode.icon className="w-4 h-4" />
          {mode.label}
        </div>
        {isVideoMode === mode.key && (
          <motion.div
            layoutId="page-mode-tab"
            className={`absolute inset-0 rounded-xl shadow-lg ${
              mode.key 
                ? 'bg-gradient-to-r from-purple-600 to-purple-500' 
                : 'bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500'
            }`}
            style={{ zIndex: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        {isVideoMode === mode.key && (
          <motion.div
            className={`absolute inset-0 rounded-xl ${
              mode.key 
                ? 'bg-gradient-to-r from-purple-400/20 to-purple-600/20' 
                : 'bg-gradient-to-r from-cyber-pink-400/20 to-cyber-pink-600/20'
            }`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    ))}
  </motion.div>
);

interface NeuralTabsProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

const NeuralTabs = ({ tabs, active, onChange }: NeuralTabsProps) => (
  <div className="relative flex space-x-2 bg-neural-800/50 backdrop-blur-sm rounded-2xl p-2 border border-neural-700/50">
    {tabs.map((tab) => {
      const isActive = active === tab;
      return (
        <motion.button
          key={tab}
          onClick={() => onChange(tab)}
          className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${
            isActive 
              ? "text-white shadow-lg" 
              : "text-neural-400 hover:text-cyber-pink-300"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tab}
          {isActive && (
            <motion.div
              layoutId="neural-tab"
              className="absolute inset-0 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 rounded-xl shadow-lg"
              style={{ zIndex: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyber-pink-400/20 to-cyber-pink-600/20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>
      );
    })}
  </div>
);

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
    <div className="absolute inset-0 bg-gradient-to-br from-cyber-pink-500/5 to-neon-blue-500/5" />
    <div className="relative z-10">{children}</div>
    <motion.div
      className="absolute inset-0 opacity-0 bg-gradient-to-r from-cyber-pink-500/10 via-transparent to-neon-blue-500/10"
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  </motion.div>
);

function DreamfluxAI() {
  const [currentPage, setCurrentPage] = useState<'welcome' | 'main' | 'auth' | 'success'>('welcome');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [authMode, _setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [activeTab, setActiveTab] = useState("SDXL");
  const [showModelModal, setShowModelModal] = useState(false);
  const [showEmbeddingModal, setShowEmbeddingModal] = useState(false);
  const [showLoraModal, setShowLoraModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showImage2Image, setShowImage2Image] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CivitaiModel | null>(null);
  const [selectedEmbedding, setSelectedEmbedding] = useState<CivitaiModel | null>(null);
  const [selectedLora, setSelectedLora] = useState<CivitaiModel | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [steps, setSteps] = useState(25);
  const [guidance, setGuidance] = useState(7.5);
  const [clipSkip, setClipSkip] = useState(1);
  const [qualityBoost, setQualityBoost] = useState(true);
  const [faceDetail, setFaceDetail] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [vae, setVae] = useState("Neural-VAE");
  const [samplingMethod, setSamplingMethod] = useState("DPM++ 2M Karras");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [evolvedImage, setEvolvedImage] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<string[]>([
    "https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg",
    "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
    "https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg",
    "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg",
    "https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg",
    "https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg"
  ]);

  const { user, signOut, loading } = useAuth();

  // Redirect to auth page if not logged in (only when trying to access main)
  useEffect(() => {
    if (!loading && !user && currentPage === 'main') {
      setCurrentPage('auth');
    }
  }, [user, loading, currentPage]);

  const handleGenerate = () => {
    setShowGenerationModal(true);
  };

  const handleModelSelect = (model: CivitaiModel) => {
    setSelectedModel(model);
    setShowModelModal(false);
  };

  const handleEmbeddingSelect = (embedding: CivitaiModel) => {
    setSelectedEmbedding(embedding);
    setShowEmbeddingModal(false);
  };

  const handleLoraSelect = (lora: CivitaiModel) => {
    setSelectedLora(lora);
    setShowLoraModal(false);
  };

  const handleFavoriteSelect = (model: CivitaiModel, type: 'model' | 'embedding' | 'lora') => {
    switch (type) {
      case 'model':
        setSelectedModel(model);
        break;
      case 'embedding':
        setSelectedEmbedding(model);
        break;
      case 'lora':
        setSelectedLora(model);
        break;
    }
    setShowFavoritesModal(false);
  };

  const handleEvolveImage = (imageUrl: string) => {
    setEvolvedImage(imageUrl);
    setShowImage2Image(true); // Auto-expand Image2Image section
  };

  const handleClearEvolvedImage = () => {
    setEvolvedImage(null);
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('welcome');
  };

  const handleAuthRequired = () => {
    setShowPricingModal(false);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setCurrentPage('main');
  };

  const handleGetStarted = () => {
    if (user) {
      setCurrentPage('main');
    } else {
      setCurrentPage('auth');
    }
  };

  const handleImageGenerated = (imageUrl: string) => {
    // Add the new image to the beginning of recent images
    setRecentImages(prev => {
      const newImages = [imageUrl, ...prev];
      // Keep only the last 12 images
      return newImages.slice(0, 12);
    });
  };

  const handleGenerationModalClose = () => {
    setShowGenerationModal(false);
    // Reset the generation modal state by clearing any temporary data
    // The modal itself will handle its internal state reset
  };

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950 text-white font-cyber flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="p-3 bg-gradient-to-br from-cyber-pink-600 to-cyber-pink-500 rounded-2xl shadow-lg mx-auto mb-4"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-neural-400">Loading Dreamflux AI...</p>
        </div>
      </div>
    );
  }

  // Handle page routing
  if (currentPage === 'welcome') {
    return <WelcomePage onGetStarted={handleGetStarted} />;
  }

  if (currentPage === 'auth') {
    return (
      <AuthPage 
        mode="signin"
        onBack={() => setCurrentPage('welcome')}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  if (currentPage === 'success') {
    return (
      <SuccessPage 
        onContinue={() => setCurrentPage('main')} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950 text-white font-cyber pb-20 overflow-y-auto">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyber-pink-500/20 to-transparent animate-pulse" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-neon-blue-500/20 to-transparent animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-8 space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 bg-gradient-to-br from-cyber-pink-600 to-cyber-pink-500 rounded-2xl shadow-lg"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyber-pink-300 to-neon-blue-400 bg-clip-text text-transparent">
                Dreamflux AI
              </h1>
              <p className="text-neural-400 text-sm">Neural Image & Video Generation Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Subscription Status */}
            <SubscriptionStatus />
            
            {/* Upgrade Button */}
            <motion.button
              onClick={() => setShowPricingModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white rounded-xl hover:from-cyber-pink-500 hover:to-cyber-pink-400 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Upgrade</span>
            </motion.button>

            {/* Favorites Button */}
            <motion.button
              onClick={() => setShowFavoritesModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 rounded-xl hover:bg-yellow-600/30 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">Favorites</span>
            </motion.button>

            {/* Profile Dropdown */}
            <ProfileDropdown user={user} onSignOut={handleSignOut} />
          </div>
        </motion.div>

        {/* Page Mode Toggle */}
        <div className="flex justify-center">
          <PageToggle isVideoMode={isVideoMode} onChange={setIsVideoMode} />
        </div>

        {/* Conditional Content Based on Mode */}
        <AnimatePresence mode="wait">
          {isVideoMode ? (
            <motion.div
              key="video"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="overflow-y-auto"
            >
              <VideoPage />
            </motion.div>
          ) : (
            <motion.div
              key="image"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 overflow-y-auto"
            >
              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <NeuralTabs 
                  tabs={["SD1.5", "SDXL", "Flux", "SD3.5"]} 
                  active={activeTab} 
                  onChange={setActiveTab} 
                />
              </motion.div>

              {/* Model, Embedding, and LoRA Selection */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  { 
                    item: selectedModel, 
                    modal: () => setShowModelModal(true), 
                    type: "Model", 
                    icon: Cpu,
                    selectorType: "model",
                    description: "Base checkpoint model"
                  },
                  { 
                    item: selectedEmbedding, 
                    modal: () => setShowEmbeddingModal(true), 
                    type: "Embedding", 
                    icon: Code,
                    selectorType: "embedding",
                    description: "Textual inversion embedding"
                  },
                  { 
                    item: selectedLora, 
                    modal: () => setShowLoraModal(true), 
                    type: "LoRA", 
                    icon: Layers,
                    selectorType: "lora",
                    description: "Fine-tuning adapter"
                  }
                ].map((config, idx) => (
                  <GlowCard
                    key={idx}
                    onClick={config.modal}
                    className="p-6 cursor-pointer group"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        {config.item?.modelVersions[0]?.images[0] ? (
                          <div className="relative overflow-hidden rounded-2xl">
                            <img 
                              src={config.item.modelVersions[0].images[0].url} 
                              alt={config.item.name} 
                              className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neural-900/40 to-transparent" />
                            {/* Selected indicator */}
                            <div className="absolute top-1 right-1 w-3 h-3 bg-cyber-pink-400 rounded-full animate-pulse" />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-neural-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-neural-600 group-hover:border-cyber-pink-500 transition-colors">
                            <config.icon className="w-6 h-6 text-neural-500 group-hover:text-cyber-pink-400 transition-colors" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-cyber-pink-300">
                          {config.item ? 'Selected' : 'Select'} {config.type}
                        </p>
                        <p className="text-xs text-neural-400 mt-1">
                          {config.item?.name || config.description}
                        </p>
                        {config.item && (
                          <p className="text-xs text-neural-500 mt-1">
                            {config.item.modelVersions[0]?.baseModel}
                          </p>
                        )}
                      </div>
                    </div>
                  </GlowCard>
                ))}
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
                    className="w-full p-6 bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-2xl text-white placeholder-neural-400 resize-none focus:outline-none focus:border-cyber-pink-500/50 focus:ring-2 focus:ring-cyber-pink-500/20 transition-all duration-300"
                    placeholder="Describe your vision... Let AI bring your imagination to life"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                  <div className="absolute top-4 right-4">
                    <Eye className="w-5 h-5 text-cyber-pink-400" />
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    className="w-full p-6 bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-2xl text-white placeholder-neural-400 resize-none focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
                    placeholder="What to avoid in the generation..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                  />
                  <div className="absolute top-4 right-4">
                    <X className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              </motion.div>

              {/* Generate Button */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center"
              >
                <motion.button
                  onClick={handleGenerate}
                  className="relative px-12 py-4 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white font-bold rounded-2xl shadow-lg overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5" />
                    <span>Generate Dream</span>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.button>
              </motion.div>

              {/* Settings Toggles */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-4"
              >
                <motion.button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 px-6 py-3 bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-xl text-neural-300 hover:text-white hover:border-cyber-pink-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings className="w-4 h-4" />
                  <span>Advanced Settings</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </motion.button>

                <motion.button
                  onClick={() => setShowImage2Image(!showImage2Image)}
                  className="flex items-center gap-2 px-6 py-3 bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-xl text-neural-300 hover:text-white hover:border-purple-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Image className="w-4 h-4" />
                  <span>Image to Image</span>
                  {showImage2Image ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                    <GlowCard className="p-8" hover={false} onClick={() => {}}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sliders */}
                        <div className="space-y-6">
                          <div>
                            <label className="flex items-center justify-between text-sm font-medium text-neural-300 mb-3">
                              <span>Steps</span>
                              <span className="text-cyber-pink-400">{steps}</span>
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
                              <span>AI Guidance</span>
                              <span className="text-cyber-pink-400">{guidance}</span>
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

                          <div>
                            <label className="flex items-center justify-between text-sm font-medium text-neural-300 mb-3">
                              <span>CLIP Skip</span>
                              <span className="text-cyber-pink-400">{clipSkip}</span>
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="12"
                              value={clipSkip}
                              onChange={(e) => setClipSkip(Number(e.target.value))}
                              className="w-full h-2 bg-neural-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                            />
                          </div>
                        </div>

                        {/* Dropdowns and Checkboxes */}
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-neural-300 mb-2">Aspect Ratio</label>
                            <select 
                              value={aspectRatio} 
                              onChange={(e) => setAspectRatio(e.target.value)} 
                              className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-cyber-pink-500 focus:outline-none"
                            >
                              <option value="1:1">Square (1:1)</option>
                              <option value="16:9">Landscape (16:9)</option>
                              <option value="9:16">Portrait (9:16)</option>
                              <option value="4:3">Classic (4:3)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-neural-300 mb-2">Sampler</label>
                            <select 
                              value={samplingMethod} 
                              onChange={(e) => setSamplingMethod(e.target.value)} 
                              className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-cyber-pink-500 focus:outline-none"
                            >
                              <option value="DPM++ 2M Karras">DPM++ 2M Karras</option>
                              <option value="Euler a">Euler Ancestral</option>
                              <option value="DDIM">DDIM</option>
                              <option value="LMS">LMS</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-neural-300 mb-2">VAE</label>
                            <select 
                              value={vae} 
                              onChange={(e) => setVae(e.target.value)} 
                              className="w-full p-3 bg-neural-800 border border-neural-700 rounded-xl text-white focus:border-cyber-pink-500 focus:outline-none"
                            >
                              <option value="Neural-VAE">Neural-VAE</option>
                              <option value="vae-ft-mse-840000-ema-pruned">VAE-FT-MSE</option>
                              <option value="kl-f8-anime2">KL-F8-Anime2</option>
                              <option value="Automatic">Automatic</option>
                            </select>
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={qualityBoost} 
                                onChange={() => setQualityBoost(!qualityBoost)}
                                className="w-5 h-5 text-cyber-pink-600 bg-neural-800 border-neural-600 rounded focus:ring-cyber-pink-500"
                              />
                              <span className="text-sm text-neural-300">Quality Boost</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={faceDetail} 
                                onChange={() => setFaceDetail(!faceDetail)}
                                className="w-5 h-5 text-cyber-pink-600 bg-neural-800 border-neural-600 rounded focus:ring-cyber-pink-500"
                              />
                              <span className="text-sm text-neural-300">Enhanced Face Detail</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </GlowCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image2Image Section */}
              <AnimatePresence>
                {showImage2Image && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image2ImageSection 
                      evolvedImage={evolvedImage}
                      onClearEvolvedImage={handleClearEvolvedImage}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent Generations */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-cyber-pink-400" />
                  <h2 className="text-xl font-bold text-white">Recent Dreams</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {recentImages.map((img, idx) => (
                    <motion.div
                      key={`${img}-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * idx }}
                      className="group cursor-pointer"
                      onClick={() => handleEvolveImage(img)}
                    >
                      <GlowCard className="p-2" onClick={() => {}}>
                        <div className="relative overflow-hidden rounded-xl">
                          <img 
                            src={img} 
                            alt={`Dream ${idx + 1}`} 
                            className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neural-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="p-2 bg-purple-600/80 rounded-full backdrop-blur-sm">
                              <Image className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </GlowCard>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Model Selector Modal */}
      <ModelSelector
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        onSelect={handleModelSelect}
        activeTab={activeTab}
        title="Select Model"
        selectorType="model"
      />

      {/* Embedding Selector Modal */}
      <ModelSelector
        isOpen={showEmbeddingModal}
        onClose={() => setShowEmbeddingModal(false)}
        onSelect={handleEmbeddingSelect}
        activeTab={activeTab}
        title="Select Embedding"
        selectorType="embedding"
      />

      {/* LoRA Selector Modal */}
      <ModelSelector
        isOpen={showLoraModal}
        onClose={() => setShowLoraModal(false)}
        onSelect={handleLoraSelect}
        activeTab={activeTab}
        title="Select LoRA"
        selectorType="lora"
      />

      {/* Favorites Manager Modal */}
      <FavoritesManager
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onSelectModel={handleFavoriteSelect}
      />

      {/* Generation Modal */}
      <GenerationModal
        isOpen={showGenerationModal}
        onClose={handleGenerationModalClose}
        request={{
          prompt,
          negativePrompt,
          model: selectedModel?.name || 'SDXL',
          steps,
          guidance,
          aspectRatio,
          sampler: samplingMethod,
          qualityBoost,
          faceDetail,
          clipSkip,
          vae
        }}
        onEvolve={handleEvolveImage}
        onImageGenerated={handleImageGenerated}
        selectedEmbedding={selectedEmbedding}
        selectedLora={selectedLora}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onAuthRequired={handleAuthRequired}
      />

      {/* ComfyUI Status Bar */}
      <ComfyUIStatusBar />
    </div>
  );
}

export default DreamfluxAI;