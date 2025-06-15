import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  onReconnect: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  error,
  onReconnect
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
        isConnected
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : 'bg-red-500/10 border-red-500/30 text-red-400'
      }`}
    >
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Wifi className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-medium">ComfyUI Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">ComfyUI Disconnected</span>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-current/30">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {!isConnected && (
        <motion.button
          onClick={onReconnect}
          className="ml-auto px-3 py-1 bg-cyber-pink-600 text-white text-xs rounded-lg hover:bg-cyber-pink-500 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reconnect
        </motion.button>
      )}
    </motion.div>
  );
};