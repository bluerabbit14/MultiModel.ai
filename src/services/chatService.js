import sessionStorageService from './sessionStorageService';
import apiService from './apiService';
import { DEFAULT_CONFIG } from '../config';

class ChatService {
  constructor() {
    this.currentSession = null;
    this.isInitialized = false;
  }

  // Initialize the chat service
  async initialize() {
    if (!this.isInitialized) {
      await sessionStorageService.initialize();
      this.isInitialized = true;
    }
  }

  // Start a new chat session
  async startNewSession(modelId = DEFAULT_CONFIG.DEFAULT_MODEL, userId = null) {
    await this.initialize();
    
    try {
      const session = await sessionStorageService.createSession(userId, modelId);
      this.currentSession = session;
      sessionStorageService.setCurrentSession(session.id);
      return session;
    } catch (error) {
      console.error('Error starting new session:', error);
      throw error;
    }
  }

  // Load an existing session
  async loadSession(sessionId) {
    await this.initialize();
    
    try {
      const session = await sessionStorageService.getSession(sessionId);
      if (session) {
        this.currentSession = session;
        sessionStorageService.setCurrentSession(session.id);
        return session;
      } else {
        throw new Error('Session not found');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      throw error;
    }
  }

  // Send a message and get AI response
  async sendMessage(content, modelId = null) {
    if (!this.currentSession) {
      throw new Error('No active session. Start a new session first.');
    }

    await this.initialize();

    try {
      const startTime = Date.now();
      
      // Add user message to session storage
      const userMessage = await sessionStorageService.addMessage(
        this.currentSession.id,
        'user',
        content
      );

      // Get AI response (this would integrate with your AI API calls)
      const aiResponse = await this.getAIResponse(content, modelId || this.currentSession.model_id);
      
      const responseTime = Date.now() - startTime;

      // Add AI response to session storage
      const assistantMessage = await sessionStorageService.addMessage(
        this.currentSession.id,
        'assistant',
        aiResponse.content,
        modelId || this.currentSession.model_id,
        aiResponse.tokenCount,
        responseTime
      );

      return {
        userMessage,
        assistantMessage,
        responseTime
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get AI response from OpenRouter API
  async getAIResponse(content, modelId) {
    try {
      // Get conversation history for context
      const conversationHistory = await this.getConversationHistory(20);
      
      // Format messages for OpenRouter API
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add the current user message
      messages.push({
        role: 'user',
        content: content
      });

      // Use the centralized API service
      return await apiService.getAIResponse(messages, modelId);

    } catch (error) {
      console.error('Error getting AI response:', error);
      throw error;
    }
  }

  // Get conversation history
  async getConversationHistory(limit = 100) {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      return await sessionStorageService.getMessages(this.currentSession.id, limit);
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  }

  // Get all sessions for a user
  async getUserSessions(userId, limit = 50) {
    await this.initialize();
    
    try {
      return await sessionStorageService.getSessionsByUser(userId, limit);
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  }

  // Test API connection
  async testApiConnection() {
    try {
      return await apiService.testConnection();
    } catch (error) {
      console.error('Error testing API connection:', error);
      throw error;
    }
  }

  // Update session title
  async updateSessionTitle(title) {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      await sessionStorageService.updateSession(this.currentSession.id, { title });
      this.currentSession.title = title;
      return { success: true };
    } catch (error) {
      console.error('Error updating session title:', error);
      throw error;
    }
  }

  // Switch model for current session
  async switchModel(modelId) {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      await sessionStorageService.updateSession(this.currentSession.id, { model_id: modelId });
      this.currentSession.model_id = modelId;
      return { success: true };
    } catch (error) {
      console.error('Error switching model:', error);
      throw error;
    }
  }

  // Get available AI models
  async getAvailableModels() {
    await this.initialize();
    
    try {
      return await sessionStorageService.getAvailableModels();
    } catch (error) {
      console.error('Error getting available models:', error);
      throw error;
    }
  }

  // Get session statistics
  async getSessionStats() {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      return await sessionStorageService.getSessionStats(this.currentSession.id);
    } catch (error) {
      console.error('Error getting session stats:', error);
      throw error;
    }
  }

  // Archive current session
  async archiveSession() {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    try {
      await sessionStorageService.updateSession(this.currentSession.id, { is_archived: true });
      this.currentSession = null;
      sessionStorageService.setCurrentSession(null);
      return { success: true };
    } catch (error) {
      console.error('Error archiving session:', error);
      throw error;
    }
  }

  // Get current session info
  getCurrentSession() {
    return this.currentSession;
  }

  // Clear current session (without archiving)
  clearCurrentSession() {
    this.currentSession = null;
    sessionStorageService.setCurrentSession(null);
  }
}

// Export singleton instance
const chatService = new ChatService();
export default chatService;
