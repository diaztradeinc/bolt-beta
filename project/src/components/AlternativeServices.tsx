import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Zap, Globe, Server, Code, Cpu } from 'lucide-react';

export const AlternativeServices: React.FC = () => {
  const services = [
    {
      name: 'Replicate',
      description: 'Cloud-based AI models with simple API',
      url: 'https://replicate.com',
      icon: Globe,
      difficulty: 'Easy',
      cost: 'Pay per use',
      features: ['No setup required', 'API access', 'Multiple models', 'Good documentation']
    },
    {
      name: 'Hugging Face Inference API',
      description: 'Access to thousands of AI models',
      url: 'https://huggingface.co/inference-api',
      icon: Code,
      difficulty: 'Medium',
      cost: 'Free tier + paid',
      features: ['Huge model library', 'Free tier available', 'Good for experimentation', 'API access']
    },
    {
      name: 'Stability AI API',
      description: 'Official Stable Diffusion API',
      url: 'https://platform.stability.ai',
      icon: Zap,
      difficulty: 'Easy',
      cost: 'Credits based',
      features: ['Official SD models', 'High quality', 'Reliable service', 'Good performance']
    },
    {
      name: 'RunPod',
      description: 'GPU cloud for running your own models',
      url: 'https://runpod.io',
      icon: Server,
      difficulty: 'Hard',
      cost: 'GPU rental',
      features: ['Full control', 'Custom models', 'GPU access', 'ComfyUI templates']
    },
    {
      name: 'Google Colab',
      description: 'Free GPU notebooks for AI experimentation',
      url: 'https://colab.research.google.com',
      icon: Cpu,
      difficulty: 'Medium',
      cost: 'Free + Pro tiers',
      features: ['Free GPU access', 'Jupyter notebooks', 'Easy sharing', 'Good for learning']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-600/20 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-600/20 border-yellow-500/30';
      case 'Hard': return 'text-red-400 bg-red-600/20 border-red-500/30';
      default: return 'text-neural-400 bg-neural-600/20 border-neural-500/30';
    }
  };

  return (
    <div className="bg-neural-800/30 backdrop-blur-sm border border-neural-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Alternative AI Services</h3>
      </div>
      
      <p className="text-sm text-neural-400 mb-6">
        If you want to start generating images immediately without setting up ComfyUI locally, 
        here are some cloud-based alternatives:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service, index) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-neural-800/50 border border-neural-700/50 rounded-xl hover:border-cyber-pink-500/50 transition-all duration-300"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-cyber-pink-600/20 rounded-lg">
                <service.icon className="w-4 h-4 text-cyber-pink-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">{service.name}</h4>
                <p className="text-xs text-neural-400 mt-1">{service.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(service.difficulty)}`}>
                {service.difficulty}
              </div>
              <div className="px-2 py-1 bg-neural-700/50 rounded-full text-xs text-neural-300">
                {service.cost}
              </div>
            </div>

            <ul className="text-xs text-neural-400 space-y-1 mb-4">
              {service.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-cyber-pink-400 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>

            <motion.a
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-cyber-pink-600/20 border border-cyber-pink-500/30 text-cyber-pink-300 rounded-lg hover:bg-cyber-pink-600/30 transition-all duration-300 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Visit {service.name}</span>
              <ExternalLink className="w-3 h-3" />
            </motion.a>
          </motion.div>
        ))}
      </div>
    </div>
  );
};