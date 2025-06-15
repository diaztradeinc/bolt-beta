import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  Wifi, 
  WifiOff, 
  Cpu, 
  HardDrive, 
  Zap, 
  Clock, 
  Users, 
  Activity,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useComfyUI } from '../hooks/useComfyUI';
import { ComfyUIConnectionDiagnostic } from './ComfyUIConnectionDiagnostic';

export const ComfyUIStatusBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const { 
    isConnected, 
    isGenerating, 
    queue, 
    connect, 
    getSystemStats, 
    error 
  } = useComfyUI();

  // Update system stats periodically
  useEffect(() => {
    if (isConnected) {
      const updateStats = async () => {
        try {
          const stats = await getSystemStats();
          setSystemStats(stats);
        } catch (err) {
          console.error('Failed to get system stats:', err);
        }
      };

      updateStats();
      const interval = setInterval(updateStats, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, getSystemStats]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleReconnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Reconnection failed:', err);
    }
  };

  return (
    <>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40 bg-neural-900/95 backdrop-blur-xl border-t border-neural-700/50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Main Status Bar */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Connection Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  {isConnected ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Wifi className="w-4 h-4 text-green-400" />
                    </motion.div>
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  {isGenerating && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-pink-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isConnected ? 'text-green-400' : 'text-red-400'
                }`}>
                  ComfyUI {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {error && (
                  <div className="flex items-center gap-1 text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs max-w-xs truncate">{error}</span>
                  </div>
                )}
              </div>

              {/* Queue Status */}
              {isConnected && (
                <div className="flex items-center gap-2 px-3 py-1 bg-neural-800/60 rounded-lg border border-neural-700/50">
                  <Users className="w-3 h-3 text-neural-400" />
                  <span className="text-xs text-neural-300">
                    Queue: {queue.length}
                  </span>
                  {isGenerating && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-3 h-3 text-cyber-pink-400" />
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Center Section - Quick Stats */}
            {isConnected && systemStats && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-neural-400">
                  <Cpu className="w-3 h-3" />
                  <span>CPU: {systemStats.system?.cpu_usage || 'N/A'}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neural-400">
                  <HardDrive className="w-3 h-3" />
                  <span>RAM: {formatBytes(systemStats.system?.ram_used || 0)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neural-400">
                  <Zap className="w-3 h-3" />
                  <span>GPU: {systemStats.devices?.[0]?.name || 'N/A'}</span>
                </div>
              </div>
            )}

            {/* Right Section - Controls */}
            <div className="flex items-center gap-3">
              {!isConnected && (
                <>
                  <motion.button
                    onClick={() => setShowDiagnostic(true)}
                    className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs rounded-lg hover:bg-blue-600/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Diagnose
                  </motion.button>
                  <motion.button
                    onClick={handleReconnect}
                    className="px-3 py-1 bg-cyber-pink-600 text-white text-xs rounded-lg hover:bg-cyber-pink-500 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Reconnect
                  </motion.button>
                </>
              )}
              
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 px-3 py-1 bg-neural-800/60 border border-neural-700/50 rounded-lg text-neural-300 hover:text-white hover:border-cyber-pink-500/50 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Server className="w-3 h-3" />
                <span className="text-xs">Details</span>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Expanded Details Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-neural-700/50 bg-neural-800/30"
            >
              <div className="px-6 py-4">
                {isConnected ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* System Information */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyber-pink-400" />
                        System Status
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-neural-400">Status:</span>
                          <span className="text-green-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Online
                          </span>
                        </div>
                        {systemStats?.system && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-neural-400">CPU Usage:</span>
                              <span className="text-white">{systemStats.system.cpu_usage || 'N/A'}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neural-400">RAM Used:</span>
                              <span className="text-white">{formatBytes(systemStats.system.ram_used || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neural-400">RAM Total:</span>
                              <span className="text-white">{formatBytes(systemStats.system.ram_total || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neural-400">Uptime:</span>
                              <span className="text-white">{formatUptime(systemStats.system.uptime || 0)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* GPU Information */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-neon-blue-400" />
                        GPU Status
                      </h3>
                      <div className="space-y-2 text-xs">
                        {systemStats?.devices?.[0] ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-neural-400">Device:</span>
                              <span className="text-white">{systemStats.devices[0].name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neural-400">Type:</span>
                              <span className="text-white">{systemStats.devices[0].type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neural-400">VRAM Used:</span>
                              <span className="text-white">{formatBytes(systemStats.devices[0].vram_used || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neural-400">VRAM Total:</span>
                              <span className="text-white">{formatBytes(systemStats.devices[0].vram_total || 0)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-neural-400">No GPU information available</div>
                        )}
                      </div>
                    </div>

                    {/* Queue Information */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        Queue Status
                      </h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-neural-400">Running:</span>
                          <span className="text-white">{queue.filter(item => item.status === 'running').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neural-400">Pending:</span>
                          <span className="text-white">{queue.filter(item => item.status === 'pending').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neural-400">Total:</span>
                          <span className="text-white">{queue.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neural-400">Generating:</span>
                          <span className={`${isGenerating ? 'text-cyber-pink-400' : 'text-neural-400'}`}>
                            {isGenerating ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-3 text-neural-400 mb-4">
                      <WifiOff className="w-8 h-8" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">ComfyUI Disconnected</h3>
                        <p className="text-sm">Unable to connect to ComfyUI server</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs text-neural-400 max-w-md mx-auto mb-4">
                      <p>• Make sure ComfyUI is running on your local machine</p>
                      <p>• Default URL: {import.meta.env.VITE_COMFYUI_URL || 'http://localhost:8188'}</p>
                      <p>• Check firewall settings and WebSocket support</p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <motion.button
                        onClick={() => setShowDiagnostic(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Run Diagnostic
                      </motion.button>
                      <motion.button
                        onClick={handleReconnect}
                        className="px-6 py-2 bg-cyber-pink-600 text-white rounded-xl hover:bg-cyber-pink-500 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Try Reconnecting
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Diagnostic Modal */}
      <ComfyUIConnectionDiagnostic
        isOpen={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
      />
    </>
  );
};