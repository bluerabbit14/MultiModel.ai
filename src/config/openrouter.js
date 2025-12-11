// OpenRouter API Configuration
const API_KEY = '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';

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

