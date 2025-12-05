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
    openrouter_id: 'x-ai/grok-4-fast:free'
  },
  {
    id: 2,
    model_id: 'deepseek/deepseek-chat-v3.1',
    model_name: 'DeepSeek Chat v3.1',
    provider: 'DeepSeek',
    description: 'Advanced conversational AI model with strong reasoning capabilities',
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 1,
    is_active: true,
    openrouter_id: 'deepseek/deepseek-chat-v3.1:free'
  },
  {
    id: 3,
    model_id: 'mistralai/mistral-7b-instruct',
    model_name: 'Mistral 7B Instruct',
    provider: 'Mistral AI',
    description: 'Efficient 7B parameter instruction-tuned model',
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 1,
    is_active: true,
    openrouter_id: 'mistralai/mistral-7b-instruct:free'
  }
];

// Default Configuration
export const DEFAULT_CONFIG = {
  DEFAULT_MODEL: 'x-ai/grok-4-fast',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
  MAX_MESSAGES_HISTORY: 50,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
};

// Helper functions
export const getModelConfig = (modelId) => {
  const model = getModelById(modelId);
  if (!model) {
    // Return default config if model not found
    const defaultModel = getModelById(DEFAULT_CONFIG.DEFAULT_MODEL);
    return {
      max_tokens: defaultModel?.max_tokens || 4096,
      temperature: defaultModel?.temperature || 0.7,
      top_p: defaultModel?.top_p || 1,
      frequency_penalty: defaultModel?.frequency_penalty || 0,
      presence_penalty: defaultModel?.presence_penalty || 0
    };
  }
  
  return {
    max_tokens: model.max_tokens,
    temperature: model.temperature,
    top_p: model.top_p,
    frequency_penalty: model.frequency_penalty,
    presence_penalty: model.presence_penalty
  };
};

export const getModelById = (modelId) => {
  return AI_MODELS.find(model => model.model_id === modelId);
};

export const getActiveModels = () => {
  return AI_MODELS.filter(model => model.is_active);
};

