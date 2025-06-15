import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Globe, Server, Lightbulb, ArrowRight, Shield, Brain } from 'lucide-react';
import { MockGenerationService } from './MockGenerationService';
import { ReplicateGenerationService } from './ReplicateGenerationService';
import { HuggingFaceGenerationService } from './HuggingFaceGenerationService';
import { AlternativeServices } from './AlternativeServices';
import { ComfyUISetupGuide } from './ComfyUISetupGuide';

interface EasyStartOptionsProps {
  onImageGenerated: (imageUrl: string) => void;
}

export const EasyStartOptions: React.FC<EasyStartOptionsProps> = ({ onImageGenerated }) => {
  const [activeOption, setActiveOption] = useState<'local' | 'huggingface' | 'replicate' | 'demo' | 'cloud' | null>(null);

  const options = [
    {
      id: 'local' as const,
      title: 'Setup ComfyUI Locally',
      description: 'Best option for NSFW content - no restrictions',
      icon: Server,
      color: 'from-green-600 to-green-500',
      difficulty: '30 minutes',
      pros: ['No content filtering', 'Complete privacy', 'Unlimited generations', 'Best quality', 'No costs'],
      cons: ['Requires setup', 'Needs good GPU', 'Large downloads'],
      recommended: true,
      badge: 'NSFW Friendly'
    },
    {
      id: 'huggingface' as const,
      title: 'Hugging Face + Civitai',
      description: 'Real AI with Civitai model library integration',
      icon: Brain,
      color: 'from-orange-600 to-orange-500',
      difficulty: '2 minutes',
      pros: ['Real AI generation', 'Civitai model mapping', 'Free tier available', 'Professional quality', 'No setup'],
      cons: ['Some content filtering', 'Rate limits on free tier', 'Internet dependent'],
      featured: true,
      badge: 'Best Balance'
    },
    {
      id: 'replicate' as const,
      title: 'Use Replicate AI',
      description: 'Real AI generation with some content restrictions',
      icon: Globe,
      color: 'from-blue-600 to-blue-500',
      difficulty: '2 minutes',
      pros: ['Real AI generation', 'High quality SDXL', 'No local setup', 'Professional results'],
      cons: ['Content filtering', 'Pay per image (~$0.01-0.05)', 'Internet dependent', 'NSFW blocked']
    },
    {
      id: 'demo' as const,
      title: 'Try Demo Mode',
      description: 'Start immediately with mock image generation',
      icon: Zap,
      color: 'from-yellow-600 to-yellow-500',
      difficulty: 'Instant',
      pros: ['No setup required', 'Works immediately', 'Good for testing UI'],
      cons: ['Not real AI generation', 'Limited to stock photos']
    },
    {
      id: 'cloud' as const,
      title: 'Other Cloud Services',
      description: 'Explore other online AI services',
      icon: Globe,
      color: 'from-purple-600 to-purple-500',
      difficulty: '5 minutes',
      pros: ['Multiple options', 'Different pricing models', 'Various features'],
      cons: ['Requires research', 'Setup varies', 'Most have content filtering']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-cyber-pink-400" />
          <h2 className="text-2xl font-bold text-white">Choose Your AI Generation Method</h2>
        </div>
        <p className="text-neural-400 mb-4">
          Select how you want to start generating images with Dreamflux AI
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-xl">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300 font-medium">
              For NSFW: ComfyUI Local
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600/20 border border-orange-500/30 rounded-xl">
            <Brain className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-orange-300 font-medium">
              For Balance: Hugging Face
            </span>
          </div>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 bg-neural-800/60 backdrop-blur-sm border rounded-2xl cursor-pointer transition-all duration-300 ${
              activeOption === option.id 
                ? 'border-cyber-pink-500/50 bg-cyber-pink-500/10' 
                : 'border-neural-700/50 hover:border-cyber-pink-500/30'
            } ${option.recommended ? 'ring-2 ring-green-500/30' : ''} ${option.featured ? 'ring-2 ring-orange-500/30' : ''}`}
            onClick={() => setActiveOption(activeOption === option.id ? null : option.id)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {option.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  RECOMMENDED
                </div>
              </div>
            )}

            {option.featured && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  FEATURED
                </div>
              </div>
            )}

            {option.badge && (
              <div className="absolute -top-2 -right-2">
                <div className={`text-white text-xs font-bold px-2 py-1 rounded-full ${
                  option.recommended ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-orange-600 to-orange-500'
                }`}>
                  {option.badge}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-3 bg-gradient-to-r ${option.color} rounded-2xl`}>
                <option.icon className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{option.title}</h3>
                <p className="text-sm text-neural-400 mb-3">{option.description}</p>
                <div className="px-3 py-1 bg-neural-700/50 rounded-full text-xs text-neural-300">
                  Setup time: {option.difficulty}
                </div>
              </div>

              <div className="w-full space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-green-400 mb-1">Pros:</h4>
                  <ul className="text-xs text-neural-400 space-y-1">
                    {option.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-400 rounded-full" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-red-400 mb-1">Cons:</h4>
                  <ul className="text-xs text-neural-400 space-y-1">
                    {option.cons.map((con, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-red-400 rounded-full" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <motion.div
                className="flex items-center gap-2 text-cyber-pink-400 text-sm font-medium"
                whileHover={{ x: 5 }}
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </div>

            {activeOption === option.id && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyber-pink-500/20 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Expanded Content */}
      <AnimatePresence mode="wait">
        {activeOption && (
          <motion.div
            key={activeOption}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeOption === 'local' && <ComfyUISetupGuide />}
            {activeOption === 'huggingface' && (
              <HuggingFaceGenerationService onImageGenerated={onImageGenerated} />
            )}
            {activeOption === 'replicate' && (
              <ReplicateGenerationService onImageGenerated={onImageGenerated} />
            )}
            {activeOption === 'demo' && (
              <MockGenerationService onImageGenerated={onImageGenerated} />
            )}
            {activeOption === 'cloud' && <AlternativeServices />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};