interface HuggingFaceGenerationRequest {
  inputs: string;
  parameters?: {
    negative_prompt?: string;
    num_inference_steps?: number;
    guidance_scale?: number;
    width?: number;
    height?: number;
    seed?: number;
  };
  options?: {
    wait_for_model?: boolean;
    use_cache?: boolean;
  };
}

export class HuggingFaceService {
  private static instance: HuggingFaceService;
  private apiKey: string;
  private baseUrl = 'https://api-inference.huggingingface.co/models';

  constructor() {
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Hugging Face API key not found in environment variables');
    }
  }

  static getInstance(): HuggingFaceService {
    if (!HuggingFaceService.instance) {
      HuggingFaceService.instance = new HuggingFaceService();
    }
    return HuggingFaceService.instance;
  }

  // Enhanced prompt modification to simulate embeddings and LoRAs
  private enhancePromptWithEmbeddingsAndLoras(
    basePrompt: string,
    selectedEmbedding?: any,
    selectedLora?: any
  ): string {
    let enhancedPrompt = basePrompt;

    // Apply embedding effects through prompt enhancement
    if (selectedEmbedding) {
      const embeddingEnhancements = this.getEmbeddingPromptEnhancement(selectedEmbedding.name);
      if (embeddingEnhancements) {
        enhancedPrompt = `${embeddingEnhancements}, ${enhancedPrompt}`;
      }
    }

    // Apply LoRA effects through style and quality modifiers
    if (selectedLora) {
      const loraEnhancements = this.getLoraPromptEnhancement(selectedLora.name);
      if (loraEnhancements) {
        enhancedPrompt = `${enhancedPrompt}, ${loraEnhancements}`;
      }
    }

    return enhancedPrompt;
  }

  // Map embedding names to prompt enhancements
  private getEmbeddingPromptEnhancement(embeddingName: string): string {
    const embeddingMap: Record<string, string> = {
      // Negative embeddings (quality improvements)
      'bad_prompt': 'high quality, detailed, masterpiece',
      'bad-hands-5': 'perfect hands, detailed fingers',
      'easynegative': 'professional quality, clean composition',
      'ng_deepnegative_v1_75t': 'sharp focus, high resolution',
      
      // Style embeddings
      'badhandv4': 'anatomically correct hands',
      'verybadimagenegative': 'excellent image quality',
      'bad-artist': 'professional artwork',
      'bad-image-v2-39000': 'high quality image',
      
      // Character/style specific
      'anime_face': 'anime style, detailed anime face',
      'realistic_face': 'photorealistic face, detailed features',
      'portrait': 'professional portrait, detailed facial features',
      'landscape': 'scenic landscape, detailed environment',
      
      // Art style embeddings
      'oil_painting': 'oil painting style, artistic brushstrokes',
      'watercolor': 'watercolor painting style, soft colors',
      'digital_art': 'digital art, high quality rendering',
      'concept_art': 'concept art style, professional illustration'
    };

    const embeddingLower = embeddingName.toLowerCase();
    
    // Try exact match first
    for (const [key, enhancement] of Object.entries(embeddingMap)) {
      if (embeddingLower.includes(key.toLowerCase())) {
        return enhancement;
      }
    }

    // Fallback based on embedding type detection
    if (embeddingLower.includes('bad') || embeddingLower.includes('negative')) {
      return 'high quality, detailed, professional';
    } else if (embeddingLower.includes('anime')) {
      return 'anime style, detailed anime artwork';
    } else if (embeddingLower.includes('realistic')) {
      return 'photorealistic, highly detailed';
    } else if (embeddingLower.includes('art')) {
      return 'artistic style, professional artwork';
    }

    return 'high quality, detailed';
  }

  // Map LoRA names to prompt enhancements
  private getLoraPromptEnhancement(loraName: string): string {
    const loraMap: Record<string, string> = {
      // Style LoRAs
      'anime': 'anime style, vibrant colors, detailed anime artwork',
      'realistic': 'photorealistic, ultra detailed, professional photography',
      'portrait': 'professional portrait, detailed facial features, studio lighting',
      'landscape': 'scenic landscape, detailed environment, natural lighting',
      
      // Quality LoRAs
      'detail': 'extremely detailed, intricate details, high resolution',
      'quality': 'masterpiece, best quality, ultra high resolution',
      'sharp': 'sharp focus, crisp details, high definition',
      
      // Lighting LoRAs
      'lighting': 'professional lighting, dramatic lighting, cinematic',
      'studio': 'studio lighting, professional photography setup',
      'natural': 'natural lighting, soft shadows',
      
      // Character LoRAs
      'character': 'detailed character design, expressive features',
      'face': 'detailed facial features, expressive eyes',
      'hair': 'detailed hair, flowing hair strands',
      
      // Environment LoRAs
      'background': 'detailed background, rich environment',
      'architecture': 'detailed architecture, structural elements',
      'nature': 'natural environment, organic details',
      
      // Art style LoRAs
      'oil_painting': 'oil painting technique, artistic brushwork',
      'watercolor': 'watercolor style, soft color blending',
      'digital': 'digital art style, clean rendering',
      'concept': 'concept art style, professional illustration',
      
      // Specific popular LoRAs
      'add_detail': 'extremely detailed, intricate textures, fine details',
      'more_details': 'enhanced details, rich textures, comprehensive detail',
      'better_hands': 'perfect hands, anatomically correct fingers',
      'perfect_eyes': 'detailed eyes, expressive gaze, realistic iris',
      'skin_detail': 'detailed skin texture, realistic skin, natural skin tone'
    };

    const loraLower = loraName.toLowerCase();
    
    // Try exact match first
    for (const [key, enhancement] of Object.entries(loraMap)) {
      if (loraLower.includes(key.toLowerCase())) {
        return enhancement;
      }
    }

    // Fallback based on LoRA type detection
    if (loraLower.includes('detail')) {
      return 'extremely detailed, intricate details';
    } else if (loraLower.includes('quality')) {
      return 'masterpiece, best quality';
    } else if (loraLower.includes('anime')) {
      return 'anime style, detailed anime artwork';
    } else if (loraLower.includes('realistic')) {
      return 'photorealistic, ultra detailed';
    } else if (loraLower.includes('lighting')) {
      return 'professional lighting, cinematic lighting';
    } else if (loraLower.includes('hand')) {
      return 'perfect hands, detailed fingers';
    } else if (loraLower.includes('face') || loraLower.includes('eye')) {
      return 'detailed facial features, expressive eyes';
    }

    return 'enhanced quality, improved details';
  }

  // Enhanced negative prompt generation
  private enhanceNegativePrompt(
    baseNegativePrompt?: string,
    selectedEmbedding?: any,
    selectedLora?: any
  ): string {
    let enhancedNegative = baseNegativePrompt || '';

    // Base quality negative prompts
    const baseNegatives = [
      'blurry', 'bad quality', 'distorted', 'ugly', 'deformed', 
      'low resolution', 'pixelated', 'artifacts', 'worst quality', 
      'low quality', 'jpeg artifacts', 'signature', 'watermark'
    ];

    // Add embedding-specific negatives
    if (selectedEmbedding) {
      const embeddingName = selectedEmbedding.name.toLowerCase();
      if (embeddingName.includes('bad') || embeddingName.includes('negative')) {
        // These embeddings are meant to be used in negative prompts
        baseNegatives.push('bad anatomy', 'bad proportions', 'extra limbs', 'missing limbs');
      }
    }

    // Add LoRA-specific negatives
    if (selectedLora) {
      const loraName = selectedLora.name.toLowerCase();
      if (loraName.includes('hand')) {
        baseNegatives.push('bad hands', 'malformed hands', 'extra fingers', 'missing fingers');
      } else if (loraName.includes('face') || loraName.includes('eye')) {
        baseNegatives.push('bad eyes', 'crossed eyes', 'asymmetric eyes', 'bad face');
      }
    }

    // Combine and deduplicate
    const allNegatives = enhancedNegative 
      ? [enhancedNegative, ...baseNegatives]
      : baseNegatives;

    return [...new Set(allNegatives)].join(', ');
  }

  // Clean and verified Civitai to Hugging Face model mapping
  private getCivitaiToHuggingFaceMapping(civitaiModelName: string, baseModel: string): string {
    console.log(`🔄 Mapping Civitai model: "${civitaiModelName}" (${baseModel})`);
    
    // Verified mapping of popular Civitai models to available Hugging Face models
    const civitaiToHFMap: Record<string, string> = {
      // Realistic Models (SD 1.5 based)
      'Realistic Vision V6.0': 'stabilityai/stable-diffusion-2-1',
      'Realistic Vision': 'stabilityai/stable-diffusion-2-1',
      'Epic Realism': 'stabilityai/stable-diffusion-2-1',
      'epiCRealism': 'stabilityai/stable-diffusion-2-1',
      'CyberRealistic': 'stabilityai/stable-diffusion-2-1',
      'Photon': 'stabilityai/stable-diffusion-2-1',
      
      // Artistic Models
      'DreamShaper': 'Lykon/DreamShaper',
      'DreamShaper 8': 'Lykon/DreamShaper',
      'Deliberate': 'stabilityai/stable-diffusion-2-1',
      'Perfect World': 'Lykon/DreamShaper',
      
      // Anime/Asian Models
      'ChilloutMix': 'hakurei/waifu-diffusion',
      'Beautiful Realistic Asians': 'hakurei/waifu-diffusion',
      'AbyssOrangeMix3': 'hakurei/waifu-diffusion',
      'Anything V5': 'hakurei/waifu-diffusion',
      'Counterfeit': 'hakurei/waifu-diffusion',
      'MeinaMix': 'hakurei/waifu-diffusion',
      'Waifu Diffusion': 'hakurei/waifu-diffusion',
      
      // SDXL Models
      'Juggernaut XL': 'stabilityai/stable-diffusion-xl-base-1.0',
      'RealVisXL': 'stabilityai/stable-diffusion-xl-base-1.0',
      'DreamShaper XL': 'stabilityai/stable-diffusion-xl-base-1.0',
      'SDXL Base': 'stabilityai/stable-diffusion-xl-base-1.0',
      'Playground XL': 'stabilityai/stable-diffusion-xl-base-1.0',
      
      // Flux Models (mapped to SDXL as HF doesn't have direct Flux support)
      'Flux.1 Dev': 'stabilityai/stable-diffusion-xl-base-1.0',
      'Flux.1 Schnell': 'stabilityai/stable-diffusion-xl-base-1.0',
      
      // SD3.5 Models (mapped to SDXL)
      'SD3.5 Base': 'stabilityai/stable-diffusion-xl-base-1.0',
    };

    // Try exact match first
    const exactMatch = civitaiToHFMap[civitaiModelName];
    if (exactMatch) {
      console.log(`✅ Exact match found: ${civitaiModelName} -> ${exactMatch}`);
      return exactMatch;
    }

    // Try partial matches with better logic
    for (const [civitaiName, hfModel] of Object.entries(civitaiToHFMap)) {
      const civitaiLower = civitaiName.toLowerCase();
      const inputLower = civitaiModelName.toLowerCase();
      
      // Check if the input contains key words from the Civitai model name
      const civitaiWords = civitaiLower.split(' ');
      const inputWords = inputLower.split(' ');
      
      const matchingWords = civitaiWords.filter(word => 
        inputWords.some(inputWord => 
          inputWord.includes(word) || word.includes(inputWord)
        )
      );
      
      // If more than half the words match, consider it a match
      if (matchingWords.length >= Math.ceil(civitaiWords.length / 2)) {
        console.log(`🔍 Partial match found: ${civitaiModelName} -> ${hfModel} (matched: ${matchingWords.join(', ')})`);
        return hfModel;
      }
    }

    // Enhanced fallback based on base model and style detection
    const modelLower = civitaiModelName.toLowerCase();
    
    // Style-based detection for better mapping
    if (modelLower.includes('anime') || modelLower.includes('waifu') || modelLower.includes('manga') || modelLower.includes('counterfeit')) {
      console.log(`🎨 Anime style detected: ${civitaiModelName} -> hakurei/waifu-diffusion`);
      return 'hakurei/waifu-diffusion';
    }
    
    if (modelLower.includes('realistic') || modelLower.includes('photo') || modelLower.includes('real') || modelLower.includes('epic')) {
      if (baseModel.toLowerCase().includes('sdxl')) {
        console.log(`📸 Realistic SDXL detected: ${civitaiModelName} -> stabilityai/stable-diffusion-xl-base-1.0`);
        return 'stabilityai/stable-diffusion-xl-base-1.0';
      }
      console.log(`📸 Realistic SD1.5 detected: ${civitaiModelName} -> stabilityai/stable-diffusion-2-1`);
      return 'stabilityai/stable-diffusion-2-1';
    }
    
    if (modelLower.includes('dream') || modelLower.includes('artistic') || modelLower.includes('deliberate')) {
      if (baseModel.toLowerCase().includes('sdxl')) {
        console.log(`🎨 Artistic SDXL detected: ${civitaiModelName} -> stabilityai/stable-diffusion-xl-base-1.0`);
        return 'stabilityai/stable-diffusion-xl-base-1.0';
      }
      console.log(`🎨 Artistic SD1.5 detected: ${civitaiModelName} -> Lykon/DreamShaper`);
      return 'Lykon/DreamShaper';
    }

    if (modelLower.includes('chill') || modelLower.includes('asian') || modelLower.includes('beautiful')) {
      console.log(`🌸 Asian style detected: ${civitaiModelName} -> hakurei/waifu-diffusion`);
      return 'hakurei/waifu-diffusion';
    }

    if (modelLower.includes('orange') || modelLower.includes('abyss') || modelLower.includes('mix')) {
      console.log(`🍊 Mix style detected: ${civitaiModelName} -> hakurei/waifu-diffusion`);
      return 'hakurei/waifu-diffusion';
    }

    // Base model fallbacks with verified models
    switch (baseModel.toLowerCase()) {
      case 'sdxl':
      case 'sdxl 1.0':
        console.log(`📋 SDXL fallback: ${civitaiModelName} -> stabilityai/stable-diffusion-xl-base-1.0`);
        return 'stabilityai/stable-diffusion-xl-base-1.0';
      case 'flux':
      case 'flux.1 d':
      case 'flux.1 s':
        console.log(`📋 Flux fallback (using SDXL): ${civitaiModelName} -> stabilityai/stable-diffusion-xl-base-1.0`);
        return 'stabilityai/stable-diffusion-xl-base-1.0';
      case 'sd 3.5':
      case 'sd3.5':
        console.log(`📋 SD3.5 fallback (using SDXL): ${civitaiModelName} -> stabilityai/stable-diffusion-xl-base-1.0`);
        return 'stabilityai/stable-diffusion-xl-base-1.0';
      case 'sd 1.5':
      case 'sd1.5':
      default:
        console.log(`📋 SD1.5 fallback: ${civitaiModelName} -> stabilityai/stable-diffusion-2-1`);
        return 'stabilityai/stable-diffusion-2-1';
    }
  }

  // Test API key validity
  async testApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateImage(request: HuggingFaceGenerationRequest, modelId?: string): Promise<Blob> {
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured. Please add VITE_HUGGINGFACE_API_KEY to your .env file');
    }

    // Test API key first
    const isValidKey = await this.testApiKey();
    if (!isValidKey) {
      throw new Error('Invalid Hugging Face API key. Please check your API key at https://huggingface.co/settings/tokens');
    }

    const targetModel = modelId || 'stabilityai/stable-diffusion-xl-base-1.0';
    const url = `${this.baseUrl}/${targetModel}`;

    console.log('🤗 Starting Hugging Face generation:', { 
      model: targetModel, 
      prompt: request.inputs.substring(0, 100) + '...',
      parameters: request.parameters 
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: request.inputs,
          parameters: {
            negative_prompt: request.parameters?.negative_prompt || 'blurry, bad quality, distorted, ugly, deformed, low resolution, pixelated, artifacts',
            num_inference_steps: Math.min(request.parameters?.num_inference_steps || 30, 50),
            guidance_scale: request.parameters?.guidance_scale || 7.5,
            width: Math.min(request.parameters?.width || 512, 1024),
            height: Math.min(request.parameters?.height || 512, 1024),
            seed: request.parameters?.seed,
            scheduler: 'DPMSolverMultistep',
            ...request.parameters
          },
          options: {
            wait_for_model: true,
            use_cache: false,
            ...request.options
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch {
          if (errorText) {
            errorMessage = errorText;
          }
        }

        // Handle specific error cases
        if (response.status === 404) {
          throw new Error(`Model "${targetModel}" not found. Trying a different model automatically...`);
        } else if (response.status === 503) {
          throw new Error('Model is currently loading. Please try again in a few moments.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making another request.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please check your Hugging Face API key.');
        } else if (errorMessage.toLowerCase().includes('nsfw')) {
          throw new Error('Content detected by safety filter. Try using a different model or adjusting your prompt.');
        }

        throw new Error(`${errorMessage}`);
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Received empty response from Hugging Face API');
      }

      console.log('✅ Hugging Face generation completed successfully');
      return blob;

    } catch (error) {
      console.error('❌ Hugging Face generation failed:', error);
      
      // If it's a 404 error, try fallback model
      if (error instanceof Error && error.message.includes('not found')) {
        console.log('🔄 Trying fallback model...');
        const fallbackModel = 'stabilityai/stable-diffusion-xl-base-1.0';
        if (targetModel !== fallbackModel) {
          return this.generateImage(request, fallbackModel);
        }
      }
      
      throw error;
    }
  }

  async generateImageWithCivitaiModel(
    prompt: string, 
    civitaiModelName: string, 
    baseModel: string,
    options: {
      negative_prompt?: string;
      steps?: number;
      guidance?: number;
      width?: number;
      height?: number;
      seed?: number;
      selectedEmbedding?: any;
      selectedLora?: any;
    } = {}
  ): Promise<Blob> {
    const huggingFaceModelId = this.getCivitaiToHuggingFaceMapping(civitaiModelName, baseModel);
    
    console.log(`🔄 Mapping Civitai model "${civitaiModelName}" (${baseModel}) to Hugging Face model "${huggingFaceModelId}"`);

    // Enhance prompt with embeddings and LoRAs
    const enhancedPrompt = this.enhancePromptWithEmbeddingsAndLoras(
      prompt, 
      options.selectedEmbedding, 
      options.selectedLora
    );

    // Enhance negative prompt
    const enhancedNegativePrompt = this.enhanceNegativePrompt(
      options.negative_prompt,
      options.selectedEmbedding,
      options.selectedLora
    );

    console.log(`🎨 Enhanced prompt: "${enhancedPrompt}"`);
    console.log(`🚫 Enhanced negative: "${enhancedNegativePrompt}"`);

    // Add quality boost based on selections
    let finalPrompt = `${enhancedPrompt}, high quality, detailed, masterpiece, best quality`;
    
    // Add model-specific enhancements
    if (huggingFaceModelId.includes('waifu')) {
      finalPrompt += ', anime style, detailed anime artwork';
    } else if (huggingFaceModelId.includes('xl')) {
      finalPrompt += ', ultra high resolution, professional quality';
    }

    const request: HuggingFaceGenerationRequest = {
      inputs: finalPrompt,
      parameters: {
        negative_prompt: enhancedNegativePrompt,
        num_inference_steps: Math.min(options.steps || 30, 50),
        guidance_scale: options.guidance || 7.5,
        width: Math.min(options.width || 512, 1024),
        height: Math.min(options.height || 512, 1024),
        seed: options.seed
      },
      options: {
        wait_for_model: true,
        use_cache: false
      }
    };

    return this.generateImage(request, huggingFaceModelId);
  }

  // Get available verified models
  async getAvailableModels(): Promise<string[]> {
    return [
      'stabilityai/stable-diffusion-xl-base-1.0',
      'stabilityai/stable-diffusion-2-1',
      'Lykon/DreamShaper',
      'hakurei/waifu-diffusion'
    ];
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const huggingFaceService = HuggingFaceService.getInstance();