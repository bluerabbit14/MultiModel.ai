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

