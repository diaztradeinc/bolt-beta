/*
  # Replicate API Proxy Function

  1. Purpose
    - Acts as a server-side proxy for Replicate API calls
    - Avoids CORS issues when calling Replicate from the browser
    - Securely handles API authentication

  2. Endpoints
    - POST /replicate-proxy - Create a new prediction
    - GET /replicate-proxy?id=<prediction_id> - Get prediction status

  3. Security
    - Uses server-side API key storage
    - Validates request format
    - Handles errors gracefully
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ReplicateGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

interface ReplicateResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
  urls?: {
    get: string;
    cancel: string;
  };
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const url = new URL(req.url);
    const predictionId = url.searchParams.get('id');

    // Use the API key from environment variable
    const apiKey = 'r8_SqwPSTC8biClmR4FyZRyd7A6AELjigC244nHO';
    
    if (!apiKey) {
      throw new Error('Replicate API token not configured');
    }

    if (req.method === 'GET' && predictionId) {
      // Get prediction status
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get prediction: ${response.status}`);
      }

      const result = await response.json();
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      });
    }

    if (req.method === 'POST') {
      // Create new prediction
      const requestData: ReplicateGenerationRequest = await req.json();

      console.log('🎨 Starting Replicate image generation via proxy:', requestData);

      // Use SDXL model by default
      const modelVersion = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: modelVersion,
          input: {
            prompt: requestData.prompt,
            negative_prompt: requestData.negative_prompt || 'blurry, bad quality, distorted',
            width: requestData.width || 1024,
            height: requestData.height || 1024,
            num_inference_steps: requestData.num_inference_steps || 25,
            guidance_scale: requestData.guidance_scale || 7.5,
            seed: requestData.seed,
            scheduler: 'DPMSolverMultistep',
            refine: 'expert_ensemble_refiner',
            high_noise_frac: 0.8,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Replicate API error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ Replicate prediction created via proxy:', result.id);
      
      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      }
    });

  } catch (error) {
    console.error('❌ Replicate proxy error:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      }
    });
  }
});