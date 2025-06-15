import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Zap, Check, Loader2, CreditCard } from 'lucide-react';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { createCheckoutSession } from '../lib/stripe';
import { useAuth } from '../hooks/useAuth';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onAuthRequired
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    setLoading(priceId);
    setError(null);

    try {
      const { url } = await createCheckoutSession({
        priceId,
        mode: 'subscription',
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="bg-neural-900/95 backdrop-blur-xl rounded-3xl w-[800px] max-h-[90vh] text-white relative border border-neural-700/50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neural-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyber-pink-600 to-cyber-pink-500 rounded-xl">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-cyber-pink-300 bg-clip-text text-transparent">
                  Upgrade to Dreamflux Pro
                </h2>
                <p className="text-sm text-neural-400">
                  Unlock unlimited AI image and video generation
                </p>
              </div>
            </div>
            <motion.button 
              onClick={onClose} 
              className="text-neural-400 hover:text-cyber-pink-400 transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-600/20 border border-red-500/30 text-red-300 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">What's included:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Unlimited image generation',
                  'Unlimited video generation',
                  'Access to all AI models',
                  'Priority processing',
                  'Advanced settings & controls',
                  'High-resolution outputs',
                  'Commercial usage rights',
                  'Premium support'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-neural-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STRIPE_PRODUCTS.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                    product.interval === 'year'
                      ? 'border-cyber-pink-500/50 bg-cyber-pink-500/10'
                      : 'border-neural-700/50 bg-neural-800/30'
                  }`}
                >
                  {product.interval === 'year' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        BEST VALUE
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-neural-400 mb-4">
                      {product.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-white">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-neural-400">
                        /{product.interval}
                      </span>
                    </div>
                    {product.interval === 'year' && (
                      <p className="text-sm text-cyber-pink-400 mt-2">
                        Save 73% vs monthly
                      </p>
                    )}
                  </div>

                  <motion.button
                    onClick={() => handleSubscribe(product.priceId)}
                    disabled={loading === product.priceId}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      product.interval === 'year'
                        ? 'bg-gradient-to-r from-cyber-pink-600 to-cyber-pink-500 text-white hover:from-cyber-pink-500 hover:to-cyber-pink-400'
                        : 'bg-neural-700 text-white hover:bg-neural-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading === product.priceId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Subscribe Now</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-neural-800/30 rounded-xl border border-neural-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h4 className="font-semibold text-white">Secure Payment</h4>
              </div>
              <p className="text-sm text-neural-400">
                Your payment is processed securely by Stripe. Cancel anytime from your account settings. 
                No hidden fees or long-term commitments.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};