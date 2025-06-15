export interface CivitaiModel {
  id: number;
  name: string;
  description: string;
  type: 'Checkpoint' | 'LORA' | 'TextualInversion' | 'Hypernetwork' | 'AestheticGradient' | 'Controlnet' | 'Poses';
  nsfw: boolean;
  tags: string[];
  creator: {
    username: string;
    image?: string;
  };
  modelVersions: CivitaiModelVersion[];
}

export interface CivitaiModelVersion {
  id: number;
  name: string;
  description: string;
  baseModel: 'SD 1.4' | 'SD 1.5' | 'SD 2.0' | 'SD 2.1' | 'SDXL 0.9' | 'SDXL 1.0' | 'SDXL Turbo' | 'SD 3' | 'SD 3.5' | 'Flux.1 D' | 'Flux.1 S';
  downloadUrl: string;
  files: CivitaiFile[];
  images: CivitaiImage[];
  trainedWords: string[];
}

export interface CivitaiFile {
  id: number;
  url: string;
  sizeKB: number;
  name: string;
  type: 'Model' | 'VAE' | 'Config';
  format: 'SafeTensor' | 'PickleTensor' | 'Other';
  pickleScanResult: 'Success' | 'Pending' | 'Danger' | 'Error';
  virusScanResult: 'Success' | 'Pending' | 'Danger' | 'Error';
  metadata: {
    fp?: 'fp16' | 'fp32';
    size?: 'full' | 'pruned';
    format?: 'SafeTensor' | 'PickleTensor';
  };
}

export interface CivitaiImage {
  id: number;
  url: string;
  nsfw: 'None' | 'Soft' | 'Mature' | 'X';
  width: number;
  height: number;
  hash: string;
  meta?: {
    prompt?: string;
    negativePrompt?: string;
    seed?: number;
    steps?: number;
    sampler?: string;
    cfgScale?: number;
    model?: string;
  };
}

export interface ComfyUIWorkflow {
  id: string;
  nodes: ComfyUINode[];
  links: ComfyUILink[];
  groups: ComfyUIGroup[];
  config: ComfyUIConfig;
}

export interface ComfyUINode {
  id: number;
  type: string;
  pos: [number, number];
  size: [number, number];
  flags: {};
  order: number;
  mode: number;
  inputs: ComfyUIInput[];
  outputs: ComfyUIOutput[];
  properties: Record<string, any>;
  widgets_values?: any[];
}

export interface ComfyUIInput {
  name: string;
  type: string;
  link?: number;
}

export interface ComfyUIOutput {
  name: string;
  type: string;
  links?: number[];
  slot_index?: number;
}

export interface ComfyUILink {
  id: number;
  origin_id: number;
  origin_slot: number;
  target_id: number;
  target_slot: number;
  type: string;
}

export interface ComfyUIGroup {
  title: string;
  bounding: [number, number, number, number];
  color: string;
  font_size: number;
}

export interface ComfyUIConfig {
  links_ontop: boolean;
}

export interface GenerationRequest {
  prompt: string;
  negativePrompt?: string;
  model: string;
  style?: string;
  steps: number;
  guidance: number;
  aspectRatio: string;
  sampler: string;
  seed?: number;
  qualityBoost: boolean;
  faceDetail: boolean;
  clipSkip: number;
  vae?: string;
}

export interface VideoGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  model?: string;
  duration: number;
  fps: number;
  resolution: string;
  motionStrength: number;
  steps: number;
  guidance: number;
  scheduler?: string;
  seed?: number;
  sourceImage?: string;
  interpolation?: string;
}

export interface GenerationResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  images?: string[];
  videos?: string[];
  error?: string;
  metadata?: {
    seed: number;
    actualSteps: number;
    processingTime: number;
  };
}