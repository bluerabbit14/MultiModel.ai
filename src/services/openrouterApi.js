import { OPENROUTER_CONFIG } from '../config/openrouter';

/**
 * Send a chat completion request to OpenRouter API
 * @param {string} model - The model ID to use (e.g., 'x-ai/grok-4-fast:free')
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise} - API response
 */
export const sendChatRequest = async (model, messages) => {
  try {
    const requestBody = {
      model: model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    };

    const response = await fetch(OPENROUTER_CONFIG.BASE_URL, {
      method: 'POST',
      headers: OPENROUTER_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.error?.message || errorData.message || `API request failed: ${response.statusText}`;
      
      // Provide more user-friendly error messages
      if (errorMessage.toLowerCase().includes('user not found') || errorMessage.toLowerCase().includes('unauthorized')) {
        errorMessage = 'API authentication failed. Please check your API key in the configuration.';
      } else if (errorMessage.toLowerCase().includes('model') && errorMessage.toLowerCase().includes('not found')) {
        errorMessage = 'The selected AI model is not available. Please try a different model.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      } else if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your OpenRouter API key configuration.';
      }
      
      console.error('OpenRouter API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
        requestBody: requestBody,
        originalError: errorData.error?.message || errorData.message
      });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw error;
  }
};

/**
 * Extract the assistant's response text from API response
 * @param {Object} apiResponse - The response from OpenRouter API
 * @returns {string} - The assistant's response text
 */
export const extractResponseText = (apiResponse) => {
  try {
    if (apiResponse.choices && apiResponse.choices.length > 0) {
      const content = apiResponse.choices[0].message?.content;
      if (Array.isArray(content)) {
        // If content is an array, find the text type
        const textContent = content.find(item => item.type === 'text');
        return textContent?.text || '';
      }
      return content || '';
    }
    return '';
  } catch (error) {
    console.error('Error extracting response text:', error);
    return '';
  }
};

/**
 * Convert chat messages to API format
 * @param {Array} messages - Array of message objects from state
 * @returns {Array} - Formatted messages for API
 */
export const formatMessagesForAPI = (messages) => {
  return messages
    .filter(msg => msg.sender !== 'system') // Exclude system messages from API calls
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
};

