import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { AuthModal } from '../components/AuthModal';

interface AuthPageProps {
  mode: 'signin' | 'signup';
  onBack: () => void;
  onAuthSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onBack, onAuthSuccess }) => {
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false);
    onBack();
  };

  const handleAuthSuccess = () => {
    setShowModal(false);
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950 text-white font-cyber overflow-y-auto">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyber-pink-500/20 to-transparent animate-pulse" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-neon-blue-500/20 to-transparent animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
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
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            {mode === 'signin' ? 'Welcome Back' : 'Join Dreamflux AI'}
          </h2>
          <p className="text-neural-400 max-w-md mx-auto">
            {mode === 'signin' 
              ? 'Sign in to continue creating amazing AI-generated images and videos'
              : 'Create an account to start generating stunning AI artwork and videos'
            }
          </p>
        </motion.div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showModal}
          onClose={handleClose}
          initialMode={mode}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
};