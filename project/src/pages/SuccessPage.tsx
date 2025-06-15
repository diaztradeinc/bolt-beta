import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Crown, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface SuccessPageProps {
  onContinue: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ onContinue }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { refreshSubscription, planName, isActive } = useSubscription();

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    setSessionId(id);

    // Refresh subscription data
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950 text-white font-cyber flex items-center justify-center overflow-y-auto">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyber-pink-500/20 to-transparent animate-pulse" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-neon-blue-500/20 to-transparent animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto p-8">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              className="w-24 h-24 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center mx-auto"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <motion.div
              className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-green-600/20 to-green-500/20 rounded-full mx-auto"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-green-300 to-cyber-pink-400 bg-clip-text text-transparent mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-neural-300 mb-6">
            Welcome to Dreamflux Pro! Your subscription is now active.
          </p>
        </motion.div>

        {/* Subscription Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-neural-800/60 backdrop-blur-sm border border-neural-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-cyber-pink-400 fill-current" />
              <h2 className="text-xl font-semibold text-white">
                {isActive ? (planName || 'Dreamflux Pro') : 'Activating...'}
              </h2>
              {!isActive && <Loader2 className="w-4 h-4 animate-spin text-cyber-pink-400" />}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-cyber-pink-400 font-semibold">Unlimited</div>
                <div className="text-neural-400">Image Generation</div>
              </div>
              <div className="text-center">
                <div className="text-cyber-pink-400 font-semibold">Unlimited</div>
                <div className="text-neural-400">Video Generation</div>
              </div>
              <div className="text-center">
                <div className="text-cyber-pink-400 font-semibold">Priority</div>
                <div className="text-neural-400">Processing</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Unlocked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-cyber-pink-400" />
            What's Now Available
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              'Access to all AI models',
              'High-resolution outputs',
              'Advanced settings & controls',
              'Commercial usage rights',
              'Premium support',
              'No generation limits'
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-2 text-neural-300"
              >
                <div className="w-2 h-2 bg-cyber-pink-400 rounded-full" />
                {feature}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            onClick={onContinue}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white font-bold rounded-2xl shadow-lg mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Start Creating</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Session Info */}
        {sessionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-xs text-neural-500"
          >
            Session ID: {sessionId}
          </motion.div>
        )}
      </div>
    </div>
  );
};