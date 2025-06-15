import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export const SubscriptionStatus: React.FC = () => {
  const { subscription, loading, error, isActive, planName } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-neural-800/60 rounded-xl border border-neural-700/50">
        <Loader2 className="w-4 h-4 animate-spin text-neural-400" />
        <span className="text-sm text-neural-400">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-600/20 rounded-xl border border-red-500/30">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-sm text-red-300">Error loading subscription</span>
      </div>
    );
  }

  if (!subscription || !isActive) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-neural-800/60 rounded-xl border border-neural-700/50">
        <div className="w-2 h-2 bg-neural-500 rounded-full" />
        <span className="text-sm text-neural-400">Free Plan</span>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyber-pink-600/20 to-cyber-pink-500/20 rounded-xl border border-cyber-pink-500/30"
    >
      <Crown className="w-4 h-4 text-cyber-pink-400 fill-current" />
      <span className="text-sm text-cyber-pink-300 font-medium">
        {planName || 'Pro Plan'}
      </span>
      {subscription.current_period_end && (
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-cyber-pink-500/30">
          <Calendar className="w-3 h-3 text-cyber-pink-400" />
          <span className="text-xs text-cyber-pink-400">
            Until {formatDate(subscription.current_period_end)}
          </span>
        </div>
      )}
      {subscription.cancel_at_period_end && (
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-yellow-500/30">
          <AlertCircle className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-yellow-400">Canceling</span>
        </div>
      )}
    </motion.div>
  );
};