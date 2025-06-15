import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  Download, 
  Terminal, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Copy,
  ExternalLink,
  Play,
  Folder,
  Settings,
  Shield,
  Zap
} from 'lucide-react';

export const ComfyUISetupGuide: React.FC = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const steps = [
    {
      title: 'Download ComfyUI',
      description: 'Get the latest ComfyUI release for your operating system',
      commands: [
        '# Option 1: Download portable version (Windows)',
        '# Go to: https://github.com/comfyanonymous/ComfyUI/releases',
        '# Download ComfyUI_windows_portable_nvidia_cu121_or_cpu.7z',
        '',
        '# Option 2: Clone from GitHub (All platforms)',
        'git clone https://github.com/comfyanonymous/ComfyUI.git',
        'cd ComfyUI'
      ],
      details: [
        'Portable version is easiest for Windows users with NVIDIA GPUs',
        'GitHub clone gives you the latest features and updates',
        'Make sure you have Git installed for the clone method',
        'Choose CUDA version based on your GPU (NVIDIA) or CPU-only version'
      ]
    },
    {
      title: 'Install Dependencies',
      description: 'Set up Python environment and install required packages',
      commands: [
        '# For portable version - dependencies are included',
        '# Just extract and run!',
        '',
        '# For GitHub clone:',
        'python -m venv venv',
        'source venv/bin/activate  # On Windows: venv\\Scripts\\activate',
        'pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121',
        'pip install -r requirements.txt'
      ],
      details: [
        'Python 3.8+ is required (3.10+ recommended)',
        'CUDA 11.8+ or 12.1+ for GPU acceleration',
        'Use virtual environment to avoid conflicts',
        'Portable version includes all dependencies pre-installed'
      ]
    },
    {
      title: 'Download Base Models',
      description: 'Get checkpoint models for image generation',
      commands: [
        '# Create models directory structure',
        'mkdir -p models/checkpoints',
        'mkdir -p models/vae',
        'mkdir -p models/loras',
        '',
        '# Download models (examples):',
        '# SD 1.5: https://huggingface.co/runwayml/stable-diffusion-v1-5',
        '# SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0',
        '# Place .safetensors files in models/checkpoints/'
      ],
      details: [
        'Download from Hugging Face, Civitai, or other model repositories',
        'Place .safetensors or .ckpt files in models/checkpoints/',
        'Popular uncensored models: Realistic Vision, DreamShaper, Anything V5',
        'SDXL models provide higher quality but require more VRAM'
      ]
    },
    {
      title: 'Configure for NSFW Content',
      description: 'Set up ComfyUI to allow unrestricted content generation',
      commands: [
        '# No special configuration needed!',
        '# ComfyUI has no built-in content filtering',
        '# You have complete control over what gets generated',
        '',
        '# Optional: Download uncensored models from Civitai',
        '# Search for models tagged as "uncensored" or "NSFW"'
      ],
      details: [
        'ComfyUI has NO content filtering by default',
        'You can generate any content your models support',
        'Use uncensored models for best NSFW results',
        'Models from Civitai often have fewer restrictions than commercial services'
      ]
    },
    {
      title: 'Start ComfyUI Server',
      description: 'Launch ComfyUI with the correct settings for web access',
      commands: [
        '# For portable version:',
        'run_nvidia_gpu.bat  # or run_cpu.bat for CPU-only',
        '',
        '# For GitHub clone:',
        'python main.py --listen --port 8188',
        '',
        '# Optional flags:',
        'python main.py --listen --port 8188 --enable-cors-header --preview-method auto'
      ],
      details: [
        '--listen allows external connections (required for web interface)',
        '--port 8188 sets the port (default, matches Dreamflux AI)',
        '--enable-cors-header fixes browser CORS issues',
        '--preview-method auto shows generation previews'
      ]
    },
    {
      title: 'Test Connection',
      description: 'Verify ComfyUI is running and accessible',
      commands: [
        '# Open in browser:',
        'http://localhost:8188',
        '',
        '# Check API endpoint:',
        'curl http://localhost:8188/system_stats',
        '',
        '# WebSocket test:',
        '# Should see "ComfyUI Connected" in Dreamflux AI status bar'
      ],
      details: [
        'ComfyUI web interface should load at localhost:8188',
        'System stats API should return JSON with system information',
        'Dreamflux AI will automatically connect when ComfyUI is running',
        'Check the status bar at the bottom of Dreamflux AI'
      ]
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  return (
    <div className="bg-neural-800/30 backdrop-blur-sm border border-neural-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Server className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">ComfyUI Local Setup Guide</h3>
        <div className="px-2 py-1 bg-green-600/20 rounded-full text-xs text-green-300 flex items-center gap-1">
          <Shield className="w-3 h-3" />
          No Content Restrictions
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-green-600/10 border border-green-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-green-400" />
          <h4 className="text-sm font-semibold text-green-300">Why ComfyUI for NSFW Content?</h4>
        </div>
        <ul className="text-xs text-green-200 space-y-1">
          <li>• <strong>No content filtering</strong> - Generate anything your models support</li>
          <li>• <strong>Complete privacy</strong> - Everything runs locally on your machine</li>
          <li>• <strong>Uncensored models</strong> - Use any model from Civitai or Hugging Face</li>
          <li>• <strong>Full control</strong> - No API limits, no usage costs, no restrictions</li>
          <li>• <strong>High quality</strong> - Latest models and techniques available</li>
        </ul>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="border border-neural-700/50 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.button
              onClick={() => toggleStep(index)}
              className="w-full flex items-center justify-between p-4 bg-neural-800/50 hover:bg-neural-700/50 transition-all duration-300"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-white">{step.title}</h4>
                  <p className="text-sm text-neural-400">{step.description}</p>
                </div>
              </div>
              {expandedStep === index ? (
                <ChevronUp className="w-5 h-5 text-neural-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neural-400" />
              )}
            </motion.button>

            <AnimatePresence>
              {expandedStep === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-neural-700/50"
                >
                  <div className="p-4 space-y-4">
                    {/* Commands */}
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        Commands:
                      </h5>
                      <div className="space-y-2">
                        {step.commands.map((command, cmdIndex) => (
                          <div key={cmdIndex} className="flex items-center gap-2">
                            <code className="flex-1 bg-neural-900/50 p-2 rounded text-green-300 text-sm font-mono whitespace-pre-wrap">
                              {command}
                            </code>
                            {command.trim() && !command.startsWith('#') && (
                              <motion.button
                                onClick={() => copyToClipboard(command)}
                                className="p-2 text-neural-400 hover:text-white transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Copy className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-2">Details:</h5>
                      <ul className="space-y-1">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-2 text-sm text-neural-400">
                            <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Model Recommendations */}
      <div className="mt-6 p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Download className="w-4 h-4 text-purple-400" />
          Recommended Uncensored Models:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'Realistic Vision V6.0', type: 'SD 1.5', desc: 'Photorealistic, uncensored' },
            { name: 'DreamShaper 8', type: 'SD 1.5', desc: 'Versatile, artistic' },
            { name: 'Juggernaut XL', type: 'SDXL', desc: 'High quality, detailed' },
            { name: 'RealVisXL V4.0', type: 'SDXL', desc: 'Photorealistic SDXL' }
          ].map((model, index) => (
            <div key={index} className="p-3 bg-neural-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-sm font-medium text-white">{model.name}</h5>
                <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-300 rounded">
                  {model.type}
                </span>
              </div>
              <p className="text-xs text-neural-400">{model.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
        <h4 className="text-sm font-semibold text-white mb-3">Helpful Resources:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { name: 'ComfyUI GitHub', url: 'https://github.com/comfyanonymous/ComfyUI' },
            { name: 'ComfyUI Releases', url: 'https://github.com/comfyanonymous/ComfyUI/releases' },
            { name: 'Civitai Models', url: 'https://civitai.com' },
            { name: 'ComfyUI Manager', url: 'https://github.com/ltdrdata/ComfyUI-Manager' },
            { name: 'Hugging Face Models', url: 'https://huggingface.co/models?pipeline_tag=text-to-image' },
            { name: 'ComfyUI Workflows', url: 'https://comfyworkflows.com' }
          ].map((link, index) => (
            <motion.a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-all duration-300 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{link.name}</span>
              <ExternalLink className="w-3 h-3" />
            </motion.a>
          ))}
        </div>
      </div>

      {/* System Requirements */}
      <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-500/20 rounded-xl">
        <h4 className="text-sm font-semibold text-yellow-300 mb-3">💻 System Requirements:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <h5 className="font-medium text-white mb-2">Minimum (SD 1.5):</h5>
            <ul className="text-yellow-200 space-y-1">
              <li>• 8GB RAM</li>
              <li>• 4GB VRAM (GTX 1060+)</li>
              <li>• 10GB storage</li>
              <li>• Python 3.8+</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-white mb-2">Recommended (SDXL):</h5>
            <ul className="text-yellow-200 space-y-1">
              <li>• 16GB+ RAM</li>
              <li>• 8GB+ VRAM (RTX 3070+)</li>
              <li>• 50GB+ storage</li>
              <li>• Fast SSD</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};