import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Palette, 
  Zap, 
  Heart,
  Eye,
  Users,
  Cpu,
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface WelcomePageProps {
  onGetStarted: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onGetStarted }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Curated SFW showcase images from Pexels (high quality, diverse styles)
  const showcaseImages = [
    {
      url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
      title: 'Digital Art Portrait',
      style: 'Realistic',
      description: 'Photorealistic digital art with stunning detail'
    },
    {
      url: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg',
      title: 'Fantasy Landscape',
      style: 'Artistic',
      description: 'Dreamy fantasy world with magical elements'
    },
    {
      url: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg',
      title: 'Cyberpunk City',
      style: 'Futuristic',
      description: 'Neon-lit cyberpunk cityscape'
    },
    {
      url: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg',
      title: 'Abstract Art',
      style: 'Abstract',
      description: 'Colorful abstract composition'
    },
    {
      url: 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg',
      title: 'Nature Scene',
      style: 'Landscape',
      description: 'Beautiful natural landscape with AI enhancement'
    },
    {
      url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg',
      title: 'Character Design',
      style: 'Character',
      description: 'Detailed character illustration'
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Models',
      description: 'Access to cutting-edge AI models from Civitai and Hugging Face',
      color: 'from-purple-600 to-purple-500'
    },
    {
      icon: Palette,
      title: 'Multiple Art Styles',
      description: 'Generate in any style - realistic, anime, abstract, and more',
      color: 'from-pink-600 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Quick generation with real-time progress tracking',
      color: 'from-yellow-600 to-yellow-500'
    },
    {
      icon: Cpu,
      title: 'Local & Cloud',
      description: 'Use ComfyUI locally or cloud services for maximum flexibility',
      color: 'from-blue-600 to-blue-500'
    },
    {
      icon: Globe,
      title: 'No Restrictions',
      description: 'Full creative freedom with local generation options',
      color: 'from-green-600 to-green-500'
    },
    {
      icon: Heart,
      title: 'Community Driven',
      description: 'Built with love for the AI art community',
      color: 'from-red-600 to-red-500'
    }
  ];

  const stats = [
    { label: 'AI Models', value: '10,000+', icon: Brain },
    { label: 'Generated Images', value: '1M+', icon: Sparkles },
    { label: 'Happy Users', value: '50K+', icon: Users },
    { label: 'Art Styles', value: '100+', icon: Palette }
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, showcaseImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % showcaseImages.length);
    setIsAutoPlaying(false);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + showcaseImages.length) % showcaseImages.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950 text-white font-cyber overflow-y-auto">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyber-pink-500/20 to-transparent animate-pulse" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-neon-blue-500/20 to-transparent animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Logo */}
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-4 bg-gradient-to-br from-cyber-pink-600 to-cyber-pink-500 rounded-3xl shadow-2xl"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-12 h-12 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-cyber-pink-300 to-neon-blue-400 bg-clip-text text-transparent">
                    Dreamflux AI
                  </h1>
                  <p className="text-neural-400 text-lg">Neural Image & Video Generation</p>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white leading-tight">
                  Create Stunning AI Art with
                  <span className="bg-gradient-to-r from-cyber-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {" "}Unlimited Creativity
                  </span>
                </h2>
                <p className="text-xl text-neural-300 leading-relaxed">
                  Harness the power of advanced AI models from Civitai and Hugging Face. 
                  Generate breathtaking images and videos with complete creative freedom.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={onGetStarted}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-cyber-pink-500/25 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  <span>Start Creating</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-neural-800/60 border border-neural-700/50 text-white font-semibold rounded-2xl hover:bg-neural-700/60 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="w-5 h-5" />
                  <span>View Gallery</span>
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <stat.icon className="w-5 h-5 text-cyber-pink-400" />
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                    </div>
                    <p className="text-sm text-neural-400">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl bg-neural-800/30 backdrop-blur-sm border border-neural-700/50 p-6">
                {/* Main Image Display */}
                <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={showcaseImages[currentImageIndex].url}
                        alt={showcaseImages[currentImageIndex].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neural-900/80 via-transparent to-transparent" />
                      
                      {/* Image Info Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-neural-900/80 backdrop-blur-sm rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {showcaseImages[currentImageIndex].title}
                            </h3>
                            <span className="px-3 py-1 bg-cyber-pink-600/20 border border-cyber-pink-500/30 text-cyber-pink-300 rounded-full text-xs font-medium">
                              {showcaseImages[currentImageIndex].style}
                            </span>
                          </div>
                          <p className="text-sm text-neural-300">
                            {showcaseImages[currentImageIndex].description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  <motion.button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-neural-900/80 backdrop-blur-sm text-white rounded-full hover:bg-neural-800 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-neural-900/80 backdrop-blur-sm text-white rounded-full hover:bg-neural-800 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Thumbnail Navigation */}
                <div className="flex gap-2 justify-center">
                  {showcaseImages.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setIsAutoPlaying(false);
                      }}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'bg-cyber-pink-500 scale-125'
                          : 'bg-neural-600 hover:bg-neural-500'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Powerful Features for
                <span className="bg-gradient-to-r from-cyber-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}Every Creator
                </span>
              </h2>
              <p className="text-xl text-neural-300 max-w-3xl mx-auto">
                Whether you're a professional artist, hobbyist, or just exploring AI art, 
                Dreamflux AI has everything you need to bring your imagination to life.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="h-full p-6 bg-neural-800/30 backdrop-blur-sm border border-neural-700/50 rounded-2xl hover:border-cyber-pink-500/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
                    <div className={`inline-flex p-3 bg-gradient-to-r ${feature.color} rounded-xl mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-neural-300 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative p-12 bg-gradient-to-r from-cyber-pink-600/20 to-purple-600/20 backdrop-blur-sm border border-cyber-pink-500/30 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink-500/10 to-purple-500/10" />
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-6">
                  Ready to Create Amazing AI Art?
                </h2>
                <p className="text-xl text-neural-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of creators who are already using Dreamflux AI to bring their 
                  wildest imaginations to life. Start your creative journey today!
                </p>
                <motion.button
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-cyber-pink-500/25 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-6 h-6" />
                  <span className="text-lg">Start Creating Now</span>
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};