import { OPENROUTER_CONFIG, getModelConfig, getModelById } from '../config';

class ApiService {
  constructor() {
    this.baseURL = OPENROUTER_CONFIG.BASE_URL;
    this.headers = OPENROUTER_CONFIG.DEFAULT_HEADERS;
  }

  // Make API request with retry logic
  async makeRequest(url, options, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.headers,
            ...options.headers
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  // Get AI response from OpenRouter
  async getAIResponse(messages, modelId) {
    const model = getModelById(modelId);
    const openRouterModelId = model ? model.openrouter_id : modelId;
    const modelConfig = getModelConfig(modelId);
    
    const requestBody = {
      model: openRouterModelId,
      messages: messages,
      max_tokens: modelConfig.max_tokens,
      temperature: modelConfig.temperature,
      top_p: modelConfig.top_p || 1,
      stream: false
    };

    // Add model-specific parameters
    if (modelConfig.frequency_penalty !== undefined) {
      requestBody.frequency_penalty = modelConfig.frequency_penalty;
    }
    if (modelConfig.presence_penalty !== undefined) {
      requestBody.presence_penalty = modelConfig.presence_penalty;
    }

    try {
      const data = await this.makeRequest(this.baseURL, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenRouter API');
      }

      return {
        content: data.choices[0].message.content,
        tokenCount: data.usage?.total_tokens || 0,
        model: data.model,
        usage: data.usage
      };
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
  }

  // Test API connection
  async testConnection() {
    try {
      const testMessages = [
        { role: 'user', content: 'Hello, this is a test message.' }
      ];
      
      await this.getAIResponse(testMessages, 'openai/gpt-3.5-turbo');
      return { success: true, message: 'API connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

const apiService = new ApiService();
export default apiService;
