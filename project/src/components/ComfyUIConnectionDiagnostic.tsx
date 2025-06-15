import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Terminal,
  Globe,
  Settings,
  Play,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
  solution?: string;
}

interface ComfyUIConnectionDiagnosticProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComfyUIConnectionDiagnostic: React.FC<ComfyUIConnectionDiagnosticProps> = ({
  isOpen,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');

  const diagnosticTests = [
    {
      name: 'Basic Network Connectivity',
      test: 'network',
      description: 'Check if localhost:8188 is reachable'
    },
    {
      name: 'ComfyUI HTTP API',
      test: 'http',
      description: 'Test ComfyUI REST endpoints'
    },
    {
      name: 'WebSocket Connection',
      test: 'websocket',
      description: 'Test real-time communication'
    },
    {
      name: 'CORS Configuration',
      test: 'cors',
      description: 'Check cross-origin request handling'
    },
    {
      name: 'System Stats',
      test: 'stats',
      description: 'Verify ComfyUI is responding correctly'
    }
  ];

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    for (const test of diagnosticTests) {
      setCurrentTest(test.name);
      
      // Add pending result
      setResults(prev => [...prev, {
        test: test.name,
        status: 'pending',
        message: `Running ${test.description}...`
      }]);

      const result = await runSingleTest(test.test);
      
      // Update result
      setResults(prev => prev.map(r => 
        r.test === test.name ? { ...result, test: test.name } : r
      ));

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentTest('');
    setIsRunning(false);
  };

  const runSingleTest = async (testType: string): Promise<Omit<DiagnosticResult, 'test'>> => {
    const baseUrl = import.meta.env.VITE_COMFYUI_URL || 'http://localhost:8188';
    
    try {
      switch (testType) {
        case 'network':
          return await testNetworkConnectivity(baseUrl);
        case 'http':
          return await testHttpAPI(baseUrl);
        case 'websocket':
          return await testWebSocketConnection(baseUrl);
        case 'cors':
          return await testCORSConfiguration(baseUrl);
        case 'stats':
          return await testSystemStats(baseUrl);
        default:
          return {
            status: 'error',
            message: 'Unknown test type'
          };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        solution: 'Check the detailed error message and ensure ComfyUI is running properly'
      };
    }
  };

  const testNetworkConnectivity = async (baseUrl: string): Promise<Omit<DiagnosticResult, 'test'>> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch(baseUrl, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors'
      });

      clearTimeout(timeoutId);

      return {
        status: 'success',
        message: `Successfully reached ${baseUrl}`,
        details: 'Network connectivity is working'
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            status: 'error',
            message: 'Connection timeout',
            details: `Could not reach ${baseUrl} within 3 seconds`,
            solution: 'Ensure ComfyUI is running and accessible on the specified port'
          };
        }
      }
      
      return {
        status: 'warning',
        message: 'Network test inconclusive',
        details: 'CORS restrictions prevent direct testing, but this may be normal',
        solution: 'Continue with other tests to verify ComfyUI status'
      };
    }
  };

  const testHttpAPI = async (baseUrl: string): Promise<Omit<DiagnosticResult, 'test'>> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${baseUrl}/system_stats`, {
        signal: controller.signal,
        method: 'GET'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: 'ComfyUI server responded with an error',
          solution: 'Check ComfyUI console for error messages'
        };
      }

      const data = await response.json();
      
      return {
        status: 'success',
        message: 'HTTP API is working correctly',
        details: `Successfully fetched system stats: ${JSON.stringify(data).substring(0, 100)}...`
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            status: 'error',
            message: 'HTTP API timeout',
            solution: 'ComfyUI may be starting up or overloaded. Wait and try again.'
          };
        } else if (error.message.includes('Failed to fetch')) {
          return {
            status: 'error',
            message: 'Cannot reach ComfyUI HTTP API',
            details: 'This usually means ComfyUI is not running or not accessible',
            solution: 'Start ComfyUI with: python main.py --listen --port 8188'
          };
        }
      }
      
      return {
        status: 'error',
        message: 'HTTP API test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        solution: 'Check if ComfyUI is running and accessible'
      };
    }
  };

  const testWebSocketConnection = async (baseUrl: string): Promise<Omit<DiagnosticResult, 'test'>> => {
    return new Promise((resolve) => {
      try {
        const wsUrl = baseUrl.replace('http', 'ws') + '/ws?clientId=diagnostic_test';
        let ws: WebSocket;
        
        const timeout = setTimeout(() => {
          if (ws && ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
          resolve({
            status: 'error',
            message: 'WebSocket connection timeout',
            details: 'Could not establish WebSocket connection within 5 seconds',
            solution: 'Ensure ComfyUI is running with WebSocket support enabled. Try: python main.py --listen --port 8188'
          });
        }, 5000);

        try {
          ws = new WebSocket(wsUrl);
        } catch (wsError) {
          clearTimeout(timeout);
          resolve({
            status: 'error',
            message: 'WebSocket creation failed',
            details: wsError instanceof Error ? wsError.message : 'Failed to create WebSocket',
            solution: 'Check if the WebSocket URL is correct and ComfyUI supports WebSocket connections'
          });
          return;
        }

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve({
            status: 'success',
            message: 'WebSocket connection successful',
            details: 'Real-time communication is working'
          });
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          resolve({
            status: 'error',
            message: 'WebSocket connection failed',
            details: 'Could not establish WebSocket connection - server may not be running or WebSocket handshake failed',
            solution: 'Ensure ComfyUI is running with: python main.py --listen --port 8188. Check that WebSocket connections are not blocked by firewall.'
          });
        };

        ws.onclose = (event) => {
          clearTimeout(timeout);
          if (event.code !== 1000 && event.code !== 1001) { // 1000 is normal closure, 1001 is going away
            resolve({
              status: 'error',
              message: `WebSocket closed unexpectedly (Code: ${event.code})`,
              details: event.reason || 'Connection closed during handshake - this often indicates the server is not properly configured for WebSocket connections',
              solution: 'Restart ComfyUI with proper WebSocket support: python main.py --listen --port 8188. If using a proxy, ensure WebSocket upgrade requests are properly forwarded.'
            });
          }
        };
      } catch (error) {
        resolve({
          status: 'error',
          message: 'WebSocket test failed',
          details: error instanceof Error ? error.message : 'Unknown error during WebSocket test',
          solution: 'Ensure ComfyUI supports WebSocket connections and is running with: python main.py --listen --port 8188'
        });
      }
    });
  };

  const testCORSConfiguration = async (baseUrl: string): Promise<Omit<DiagnosticResult, 'test'>> => {
    try {
      const response = await fetch(`${baseUrl}/queue`, {
        method: 'GET',
        headers: {
          'Origin': window.location.origin
        }
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      };

      if (response.ok) {
        return {
          status: 'success',
          message: 'CORS is configured correctly',
          details: `CORS headers: ${JSON.stringify(corsHeaders, null, 2)}`
        };
      } else {
        return {
          status: 'warning',
          message: 'CORS may have issues',
          details: `Response status: ${response.status}`,
          solution: 'Check ComfyUI CORS configuration if you encounter issues'
        };
      }
    } catch (error) {
      return {
        status: 'warning',
        message: 'CORS test inconclusive',
        details: 'Could not determine CORS configuration',
        solution: 'If you encounter CORS errors, restart ComfyUI with --enable-cors-header'
      };
    }
  };

  const testSystemStats = async (baseUrl: string): Promise<Omit<DiagnosticResult, 'test'>> => {
    try {
      const response = await fetch(`${baseUrl}/system_stats`);
      
      if (!response.ok) {
        return {
          status: 'error',
          message: 'System stats endpoint failed',
          solution: 'ComfyUI may not be fully initialized'
        };
      }

      const stats = await response.json();
      
      // Check if we got valid system stats
      if (stats && typeof stats === 'object') {
        const hasSystemInfo = stats.system || stats.devices;
        
        if (hasSystemInfo) {
          return {
            status: 'success',
            message: 'System stats are available',
            details: `Found system information: ${Object.keys(stats).join(', ')}`
          };
        } else {
          return {
            status: 'warning',
            message: 'System stats returned but incomplete',
            details: 'ComfyUI is running but may still be initializing',
            solution: 'Wait a moment and try again'
          };
        }
      } else {
        return {
          status: 'error',
          message: 'Invalid system stats response',
          solution: 'ComfyUI may not be properly configured'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: 'System stats test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        solution: 'Ensure ComfyUI is fully started and operational'
      };
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pending':
        return 'border-blue-500/30 bg-blue-600/10';
      case 'success':
        return 'border-green-500/30 bg-green-600/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-600/10';
      case 'error':
        return 'border-red-500/30 bg-red-600/10';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
          className="bg-neural-900/95 backdrop-blur-xl rounded-3xl w-[800px] max-h-[80vh] text-white relative border border-neural-700/50 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neural-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-xl">
                <Terminal className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                  ComfyUI Connection Diagnostic
                </h2>
                <p className="text-sm text-neural-400">
                  Troubleshoot connection issues with your ComfyUI server
                </p>
              </div>
            </div>
            <motion.button 
              onClick={onClose} 
              className="text-neural-400 hover:text-blue-400 transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Quick Info */}
            <div className="mb-6 p-4 bg-neural-800/30 rounded-xl border border-neural-700/50">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Current Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neural-400">ComfyUI URL:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-neural-700/50 px-2 py-1 rounded text-blue-300">
                      {import.meta.env.VITE_COMFYUI_URL || 'http://localhost:8188'}
                    </code>
                    <motion.button
                      onClick={() => copyToClipboard(import.meta.env.VITE_COMFYUI_URL || 'http://localhost:8188')}
                      className="p-1 text-neural-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Copy className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
                <div>
                  <span className="text-neural-400">Browser:</span>
                  <p className="text-white mt-1">{navigator.userAgent.split(' ')[0]}</p>
                </div>
              </div>
            </div>

            {/* Run Diagnostics Button */}
            <div className="mb-6 flex justify-center">
              <motion.button
                onClick={runDiagnostics}
                disabled={isRunning}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isRunning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>{isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostic'}</span>
              </motion.button>
            </div>

            {/* Current Test */}
            {isRunning && currentTest && (
              <div className="mb-6 p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="text-blue-300 font-medium">Currently testing: {currentTest}</span>
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Diagnostic Results</h3>
                {results.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{result.test}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            result.status === 'success' ? 'bg-green-600/20 text-green-300' :
                            result.status === 'warning' ? 'bg-yellow-600/20 text-yellow-300' :
                            result.status === 'error' ? 'bg-red-600/20 text-red-300' :
                            'bg-blue-600/20 text-blue-300'
                          }`}>
                            {result.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-neural-300 text-sm mb-2">{result.message}</p>
                        {result.details && (
                          <div className="bg-neural-800/50 p-3 rounded-lg mb-2">
                            <p className="text-xs text-neural-400 font-mono">{result.details}</p>
                          </div>
                        )}
                        {result.solution && (
                          <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-lg">
                            <p className="text-xs text-blue-300">
                              <strong>Solution:</strong> {result.solution}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Common Solutions */}
            <div className="mt-8 p-4 bg-neural-800/30 rounded-xl border border-neural-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-400" />
                Common Solutions
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Start ComfyUI with proper flags:</p>
                    <code className="block bg-neural-700/50 p-2 rounded mt-1 text-green-300">
                      python main.py --listen --port 8188
                    </code>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">For CORS issues, add:</p>
                    <code className="block bg-neural-700/50 p-2 rounded mt-1 text-blue-300">
                      python main.py --listen --port 8188 --enable-cors-header
                    </code>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Check firewall settings:</p>
                    <p className="text-neural-300 mt-1">Ensure port 8188 is not blocked by your firewall</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Verify ComfyUI installation:</p>
                    <p className="text-neural-300 mt-1">Make sure all dependencies are installed and ComfyUI starts without errors</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">WebSocket connection issues:</p>
                    <p className="text-neural-300 mt-1">If WebSocket handshake fails with "Empty response", the server may not be running or properly configured for WebSocket connections</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neural-700/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-neural-400">
              <Server className="w-4 h-4" />
              <span>Need help? Check the ComfyUI documentation</span>
            </div>
            <motion.button
              onClick={() => window.open('https://github.com/comfyanonymous/ComfyUI', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-neural-800/60 border border-neural-700/50 text-neural-300 rounded-xl hover:bg-neural-700/60 hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-4 h-4" />
              <span>ComfyUI Docs</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};