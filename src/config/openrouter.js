// OpenRouter API Configuration
// Read API key from environment variable (must start with REACT_APP_ for Create React App)
const API_KEY ='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';

// Debug: Check if environment variable is accessible
console.log('🔍 Environment check:', {
  hasEnvVar: !!process.env.REACT_APP_OPENROUTER_API_KEY,
  envVarLength: process.env.REACT_APP_OPENROUTER_API_KEY?.length || 0,
  apiKeyFirstChars: API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT SET',
  allReactAppVars: Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
});

// Validate API key is loaded
if (!API_KEY || API_KEY.trim() === '') {
  const errorMsg = `
❌ ERROR: REACT_APP_OPENROUTER_API_KEY is not set!

To fix this:
1. Make sure your .env file is in the root directory (same folder as package.json)
2. The .env file should contain:
   REACT_APP_OPENROUTER_API_KEY=your-api-key-here
3. Make sure:
   - File is named exactly ".env" (with the dot)
   - No spaces around the = sign
   - Variable name is exactly REACT_APP_OPENROUTER_API_KEY (case-sensitive)
4. ⚠️ IMPORTANT: Restart the development server (stop with Ctrl+C, then run npm start again)
   Environment variables are only loaded when the server starts!

Note: The .env file should be in the root directory, not in the src folder.
  `;
  console.error(errorMsg);
  
  // Don't throw error immediately - allow app to load but show warning
  // The API calls will fail with a clear error message instead
} else {
  console.log('✅ API Key loaded successfully from environment variable');
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

