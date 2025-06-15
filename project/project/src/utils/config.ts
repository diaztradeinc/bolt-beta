export const CONFIG = {
  COMFYUI: {
    DEFAULT_URL: 'https://1b93-96-235-186-100.ngrok-free.app',
    WEBSOCKET_RECONNECT_INTERVAL: 5000,
    MAX_RECONNECT_ATTEMPTS: 5
  },
  CIVITAI: {
    API_BASE: 'https://civitai.com/api/v1',
    CACHE_TTL: 300000, // 5 minutes
    DEFAULT_LIMIT: 20,
    MAX_SEARCH_RESULTS: 100
  },
  GENERATION: {
    DEFAULT_STEPS: 40,
    DEFAULT_GUIDANCE: 5.0,
    DEFAULT_SAMPLER: 'Euler a',
    DEFAULT_ASPECT_RATIO: '9:16',
    SUPPORTED_FORMATS: ['png', 'jpg', 'webp'],
    MAX_BATCH_SIZE: 4
  },
  UI: {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    MAX_RECENT_IMAGES: 20
  }
};

export const ASPECT_RATIOS = {
  '1:1': { width: 512, height: 512 },
  '16:9': { width: 768, height: 432 },
  '9:16': { width: 432, height: 768 },
  '4:3': { width: 640, height: 480 },
  '3:4': { width: 480, height: 640 },
  '21:9': { width: 896, height: 384 }
};

export const SAMPLERS = [
  'Euler',
  'Euler a',
  'Heun',
  'DPM++ 2M',
  'DPM++ 2M Karras',
  'DPM++ 2M SDE',
  'DPM++ 2M SDE Karras',
  'DPM++ SDE',
  'DPM++ SDE Karras',
  'DPM2',
  'DPM2 Karras',
  'DPM2 a',
  'DPM2 a Karras',
  'DDIM',
  'PLMS',
  'UniPC'
];

export const BASE_MODELS = {
  'SD1.5': {
    name: 'Stable Diffusion 1.5',
    defaultSize: { width: 512, height: 512 },
    supportedSizes: [
      { width: 512, height: 512 },
      { width: 768, height: 512 },
      { width: 512, height: 768 }
    ]
  },
  'SDXL': {
    name: 'Stable Diffusion XL',
    defaultSize: { width: 1024, height: 1024 },
    supportedSizes: [
      { width: 1024, height: 1024 },
      { width: 1152, height: 896 },
      { width: 896, height: 1152 },
      { width: 1216, height: 832 },
      { width: 832, height: 1216 }
    ]
  },
  'Flux': {
    name: 'Flux',
    defaultSize: { width: 1024, height: 1024 },
    supportedSizes: [
      { width: 1024, height: 1024 },
      { width: 1152, height: 896 },
      { width: 896, height: 1152 }
    ]
  },
  'SD3.5': {
    name: 'Stable Diffusion 3.5',
    defaultSize: { width: 1024, height: 1024 },
    supportedSizes: [
      { width: 1024, height: 1024 },
      { width: 1152, height: 896 },
      { width: 896, height: 1152 }
    ]
  }
};