// OpenRouter API Configuration
// Read API key from environment variable (must start with REACT_APP_ for Create React App)
const API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY || '';

// Debug: Check if environment variable is accessible
if (process.env.NODE_ENV === 'development') {
  console.log('Environment check:', {
    hasEnvVar: !!process.env.REACT_APP_OPENROUTER_API_KEY,
    envVarLength: process.env.REACT_APP_OPENROUTER_API_KEY?.length || 0,
    allReactAppVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
  });
}

// Validate API key is loaded
if (!API_KEY || API_KEY.trim() === '') {
  const errorMsg = `
❌ ERROR: REACT_APP_OPENROUTER_API_KEY is not set!

To fix this:
1. Create a .env file in the root directory (same folder as package.json)
2. Add this line to the .env file:
   REACT_APP_OPENROUTER_API_KEY=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
3. Make sure:
   - File is named exactly ".env" (with the dot)
   - No spaces around the = sign
   - Variable name is exactly REACT_APP_OPENROUTER_API_KEY (case-sensitive)
4. Restart the development server (stop with Ctrl+C, then run npm start again)

Note: The .env file should be in the root directory, not in the src folder.
  `;
  console.error(errorMsg);
  
  // Don't throw error immediately - allow app to load but show warning
  // The API calls will fail with a clear error message instead
}

export const OPENROUTER_CONFIG = {
  BASE_URL: 'https://openrouter.ai/api/v1/chat/completions',
  API_KEY: API_KEY,
  DEFAULT_HEADERS: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'PolyChat - Multi-Model AI Chat'
  }
};

// Available AI Models Configuration
export const AI_MODELS = [
  {
    id: 1,
    model_id: 'x-ai/grok-4-fast',
    model_name: 'Grok-4 Fast',
    provider: 'xAI',
    description: 'Fast and capable AI model from xAI',
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 1,
    is_active: true,
    openrouter_id: 'x-ai/grok-4-fast'
  },
  {
    id: 2,
    model_id: 'mistralai/devstral-2512',
    model_name: 'Mistral Devstral 2512',
    provider: 'Mistral AI',
    description: 'Advanced conversational AI model from Mistral',
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 1,
    is_active: true,
    openrouter_id: 'mistralai/devstral-2512:free'
  },
  {
    id: 3,
    model_id: 'meta-llama/llama-3.3-70b-instruct',
    model_name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    description: 'Powerful 70B parameter instruction-tuned model from Meta',
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 1,
    is_active: true,
    openrouter_id: 'meta-llama/llama-3.3-70b-instruct'
  }
  // Add more models here in the future
];

// Get active models only
export const getActiveModels = () => {
  return AI_MODELS.filter(model => model.is_active);
};

// Get model by ID
export const getModelById = (id) => {
  return AI_MODELS.find(model => model.id === id);
};

// Get default model
export const getDefaultModel = () => {
  return AI_MODELS.find(model => model.is_active) || AI_MODELS[0];
};

