import type { ComfyUIWorkflow, GenerationRequest, GenerationResponse, VideoGenerationRequest } from '../types/models';

export class ComfyUIService {
  private static instance: ComfyUIService;
  private baseUrl: string;
  private clientId: string;
  private websocket: WebSocket | null = null;
  private eventListeners = new Map<string, Function[]>();
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;

  constructor(baseUrl: string = import.meta.env.VITE_COMFYUI_URL || 'http://localhost:8188') {
    this.baseUrl = baseUrl;
    this.clientId = this.generateClientId();
    console.log('🔧 ComfyUI Service initialized with URL:', this.baseUrl);
  }

  static getInstance(baseUrl?: string): ComfyUIService {
    if (!ComfyUIService.instance) {
      ComfyUIService.instance = new ComfyUIService(baseUrl);
    }
    return ComfyUIService.instance;
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private getNgrokHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // Multiple ngrok bypass headers for different scenarios
      'ngrok-skip-browser-warning': 'true',
      'ngrok-skip-browser-warning': 'any',
      'User-Agent': 'ComfyUI-Client/1.0',
      // Add cache busting to avoid cached HTML responses
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    };
  }

  private async makeNgrokRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...this.getNgrokHeaders(),
      ...options.headers
    };

    console.log('🌐 Making request to:', url);
    console.log('📋 Headers:', headers);

    const response = await fetch(url, {
      ...options,
      headers
    });

    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

    // Check if we got HTML instead of JSON
    const contentType = response.headers.get('content-type') || '';
    console.log('📄 Content-Type:', contentType);

    if (!contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('❌ Received non-JSON response:');
      console.error('First 500 chars:', responseText.substring(0, 500));
      
      // Check for common ngrok HTML responses
      if (responseText.includes('ngrok')) {
        throw new Error('ngrok is returning HTML warning page. Try visiting the URL in browser first to accept the warning.');
      }
      if (responseText.includes('tunnel not found')) {
        throw new Error('ngrok tunnel not found. Please check if your ngrok tunnel is still active.');
      }
      if (responseText.includes('502 Bad Gateway')) {
        throw new Error('502 Bad Gateway - ComfyUI server may not be running behind ngrok.');
      }
      if (responseText.includes('404')) {
        throw new Error('404 Not Found - The endpoint may not exist on your ComfyUI server.');
      }
      
      throw new Error(`Expected JSON but received ${contentType}. Response: ${responseText.substring(0, 200)}`);
    }

    return response;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.testConnection()
        .then(() => {
          const wsUrl = this.baseUrl.replace('https', 'wss').replace('http', 'ws') + '/ws?clientId=' + this.clientId;
          console.log('🔗 WebSocket URL:', wsUrl);

          this.websocket = new WebSocket(wsUrl);

          this.websocket.onopen = () => {
            console.log('✅ Connected to ComfyUI WebSocket successfully');
            this.connectionAttempts = 0;
            resolve();
          };

          this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', data);
            this.handleWebSocketMessage(data);
          };

          this.websocket.onerror = (error) => {
            console.error('❌ ComfyUI WebSocket error:', error);
            this.connectionAttempts++;
            if (this.connectionAttempts >= this.maxConnectionAttempts) {
              reject(new Error('Failed to connect to ComfyUI WebSocket after multiple attempts.'));
            }
          };

          this.websocket.onclose = (event) => {
            console.log('🔌 WebSocket closed:', event.code, event.reason);
            this.websocket = null;
          };
        })
        .catch((error) => {
          console.error('❌ ComfyUI HTTP endpoint not reachable:', error.message);
          reject(error);
        });
    });
  }

  private async testConnection(): Promise<void> {
    const url = `${this.baseUrl}/system_stats`;
    console.log('🧪 Testing HTTP connection to:', url);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout

      const response = await this.makeNgrokRequest(url, {
        signal: controller.signal,
        method: 'GET'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} - ${response.statusText}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ ComfyUI system stats:', data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Connection timed out — ComfyUI server might not be running or ngrok tunnel may be down.');
      }
      throw error;
    }
  }

  private handleWebSocketMessage(data: any): void {
    const { type } = data;
    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(listener => listener(data));
  }

  addEventListener(type: string, listener: Function): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: Function): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  async queuePrompt(workflow: any): Promise<{ prompt_id: string }> {
    const url = `${this.baseUrl}/prompt`;
    console.log('📤 Queueing prompt to:', url);
    console.log('📋 Workflow being sent:', JSON.stringify(workflow, null, 2));

    try {
      const response = await this.makeNgrokRequest(url, {
        method: 'POST',
        body: JSON.stringify({
          prompt: workflow,
          client_id: this.clientId
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} — ${errorBody}`);
      }

      const result = await response.json();
      console.log('✅ Prompt queued successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to queue prompt:', error);
      throw error;
    }
  }

  async getQueue(): Promise<any> {
    const url = `${this.baseUrl}/queue`;
    console.log('📊 Getting queue from:', url);

    try {
      const response = await this.makeNgrokRequest(url, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get queue:', error);
      throw error;
    }
  }

  async getSystemStats(): Promise<any> {
    const url = `${this.baseUrl}/system_stats`;
    console.log('📊 Getting system stats from:', url);

    try {
      const response = await this.makeNgrokRequest(url, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get system stats:', error);
      throw error;
    }
  }

  private createImageWorkflow(request: GenerationRequest): any {
    // Map aspect ratio to dimensions
    const aspectRatioMap: Record<string, { width: number; height: number }> = {
      '1:1': { width: 512, height: 512 },
      '16:9': { width: 768, height: 432 },
      '9:16': { width: 432, height: 768 },
      '4:3': { width: 640, height: 480 },
      '3:4': { width: 480, height: 640 }
    };

    const dimensions = aspectRatioMap[request.aspectRatio] || { width: 512, height: 512 };

    // Map UI sampler names to ComfyUI sampler names
    const samplerMap: Record<string, string> = {
      'DPM++ 2M Karras': 'dpmpp_2m',
      'Euler a': 'euler_ancestral',
      'Euler': 'euler',
      'DDIM': 'ddim',
      'LMS': 'lms'
    };

    const comfyUISampler = samplerMap[request.sampler] || 'dpmpp_2m';

    // Create ComfyUI workflow
    const workflow = {
      "1": {
        "inputs": {
          "ckpt_name": "model.safetensors"
        },
        "class_type": "CheckpointLoaderSimple",
        "_meta": {
          "title": "Load Checkpoint"
        }
      },
      "2": {
        "inputs": {
          "text": request.prompt,
          "clip": ["1", 1]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
          "title": "CLIP Text Encode (Prompt)"
        }
      },
      "3": {
        "inputs": {
          "text": request.negativePrompt || "",
          "clip": ["1", 1]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
          "title": "CLIP Text Encode (Negative)"
        }
      },
      "4": {
        "inputs": {
          "width": dimensions.width,
          "height": dimensions.height,
          "batch_size": 1
        },
        "class_type": "EmptyLatentImage",
        "_meta": {
          "title": "Empty Latent Image"
        }
      },
      "5": {
        "inputs": {
          "seed": request.seed || Math.floor(Math.random() * 1000000),
          "steps": request.steps,
          "cfg": request.guidance,
          "sampler_name": comfyUISampler,
          "scheduler": "karras",
          "denoise": 1.0,
          "model": ["1", 0],
          "positive": ["2", 0],
          "negative": ["3", 0],
          "latent_image": ["4", 0]
        },
        "class_type": "KSampler",
        "_meta": {
          "title": "KSampler"
        }
      },
      "6": {
        "inputs": {
          "samples": ["5", 0],
          "vae": ["1", 2]
        },
        "class_type": "VAEDecode",
        "_meta": {
          "title": "VAE Decode"
        }
      },
      "7": {
        "inputs": {
          "filename_prefix": "ComfyUI",
          "images": ["6", 0]
        },
        "class_type": "SaveImage",
        "_meta": {
          "title": "Save Image"
        }
      }
    };

    return workflow;
  }

  private createVideoWorkflow(request: VideoGenerationRequest): any {
    // Map resolution to dimensions
    const resolutionMap: Record<string, { width: number; height: number }> = {
      '512x512': { width: 512, height: 512 },
      '768x512': { width: 768, height: 512 },
      '512x768': { width: 512, height: 768 },
      '1024x576': { width: 1024, height: 576 }
    };

    const dimensions = resolutionMap[request.resolution] || { width: 512, height: 512 };
    const frameCount = Math.round(request.duration * request.fps);

    // Create AnimateDiff workflow
    const workflow = {
      "1": {
        "inputs": {
          "ckpt_name": request.model || "wan2.1.safetensors"
        },
        "class_type": "CheckpointLoaderSimple",
        "_meta": {
          "title": "Load Checkpoint"
        }
      },
      "2": {
        "inputs": {
          "text": request.prompt,
          "clip": ["1", 1]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
          "title": "CLIP Text Encode (Prompt)"
        }
      },
      "3": {
        "inputs": {
          "text": request.negativePrompt || "",
          "clip": ["1", 1]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
          "title": "CLIP Text Encode (Negative)"
        }
      },
      "4": {
        "inputs": {
          "width": dimensions.width,
          "height": dimensions.height,
          "batch_size": frameCount
        },
        "class_type": "EmptyLatentImage",
        "_meta": {
          "title": "Empty Latent Image"
        }
      },
      "5": {
        "inputs": {
          "seed": request.seed || Math.floor(Math.random() * 1000000),
          "steps": request.steps,
          "cfg": request.guidance,
          "sampler_name": "euler",
          "scheduler": request.scheduler || "normal",
          "denoise": 1.0,
          "model": ["1", 0],
          "positive": ["2", 0],
          "negative": ["3", 0],
          "latent_image": ["4", 0]
        },
        "class_type": "KSampler",
        "_meta": {
          "title": "KSampler"
        }
      },
      "6": {
        "inputs": {
          "samples": ["5", 0],
          "vae": ["1", 2]
        },
        "class_type": "VAEDecode",
        "_meta": {
          "title": "VAE Decode"
        }
      },
      "7": {
        "inputs": {
          "filename_prefix": "AnimateDiff",
          "fps": request.fps,
          "compress_level": 4,
          "images": ["6", 0]
        },
        "class_type": "VHS_VideoCombine",
        "_meta": {
          "title": "Video Combine"
        }
      }
    };

    return workflow;
  }

  async generateImage(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      console.log('🎨 Starting ComfyUI image generation:', request);
      
      const workflow = this.createImageWorkflow(request);
      const result = await this.queuePrompt(workflow);
      
      return {
        id: result.prompt_id,
        status: 'queued',
        metadata: {
          seed: request.seed || Math.floor(Math.random() * 1000000),
          actualSteps: request.steps,
          processingTime: 0
        }
      };
    } catch (error) {
      console.error('❌ ComfyUI image generation failed:', error);
      throw error;
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<GenerationResponse> {
    try {
      console.log('🎬 Starting ComfyUI video generation:', request);
      
      const workflow = this.createVideoWorkflow(request);
      const result = await this.queuePrompt(workflow);
      
      return {
        id: result.prompt_id,
        status: 'queued',
        metadata: {
          seed: request.seed || Math.floor(Math.random() * 1000000),
          actualSteps: request.steps,
          processingTime: 0
        }
      };
    } catch (error) {
      console.error('❌ ComfyUI video generation failed:', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

export const comfyUIService = ComfyUIService.getInstance();