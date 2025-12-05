import { v4 as uuidv4 } from 'uuid';
import { AI_MODELS, DEFAULT_CONFIG } from '../config';

class SessionStorageService {
  constructor() {
    this.storageKey = 'polychat_data';
    this.data = this.loadFromStorage();
  }

  // Load data from browser session storage
  loadFromStorage() {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Clear messages on refresh but keep the session structure
        data.messages = [];
        // Always use the current AI_MODELS from config to ensure updates are reflected
        data.availableModels = AI_MODELS;
        return data;
      } else {
            return {
              sessions: [],
              messages: [],
              currentSessionId: null,
              availableModels: AI_MODELS
            };
      }
    } catch (error) {
      console.error('Error loading from session storage:', error);
        return {
          sessions: [],
          messages: [],
          currentSessionId: null,
          availableModels: AI_MODELS
        };
    }
  }

  // Save data to browser session storage
  saveToStorage() {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving to session storage:', error);
    }
  }

  // Session Management
  createSession(userId = null, modelId = DEFAULT_CONFIG.DEFAULT_MODEL, title = 'New Chat') {
    // Clear existing sessions and messages to ensure only one session
    this.data.sessions = [];
    this.data.messages = [];
    
    const session = {
      id: Date.now() + Math.random(), // Simple ID generation
      session_uuid: uuidv4(),
      user_id: userId,
      title,
      model_id: modelId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      is_archived: false
    };

    this.data.sessions.push(session);
    this.data.currentSessionId = session.id;
    this.saveToStorage();
    
    return session;
  }

  getSession(sessionId) {
    return this.data.sessions.find(session => 
      session.id === sessionId || session.session_uuid === sessionId
    );
  }

  getSessionsByUser(userId, limit = 50, offset = 0) {
    return this.data.sessions
      .filter(session => session.user_id === userId && !session.is_archived)
      .sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity))
      .slice(offset, offset + limit)
      .map(session => ({
        ...session,
        message_count: this.data.messages.filter(msg => msg.session_id === session.id).length,
        last_message_at: session.last_activity
      }));
  }

  updateSession(sessionId, updates) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const allowedFields = ['title', 'model_id', 'is_archived'];
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        session[key] = updates[key];
      }
    });

    session.updated_at = new Date().toISOString();
    session.last_activity = new Date().toISOString();
    this.saveToStorage();

    return { success: true, changes: 1 };
  }

  // Message Management
  addMessage(sessionId, role, content, modelId = null, tokenCount = null, responseTimeMs = null) {
    const message = {
      id: Date.now() + Math.random(),
      session_id: sessionId,
      message_uuid: uuidv4(),
      role,
      content,
      model_id: modelId,
      token_count: tokenCount,
      response_time_ms: responseTimeMs,
      created_at: new Date().toISOString()
    };

    this.data.messages.push(message);

    // Update session last_activity
    const session = this.getSession(sessionId);
    if (session) {
      session.last_activity = new Date().toISOString();
    }

    this.saveToStorage();
    return message;
  }

  getMessages(sessionId, limit = 100, offset = 0) {
    const sessionMessages = this.data.messages
      .filter(msg => msg.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(offset, offset + limit);

    // Add model names
    return sessionMessages.map(message => {
      const model = this.data.availableModels.find(m => m.model_id === message.model_id);
      return {
        ...message,
        model_name: model ? model.model_name : null
      };
    });
  }

  getMessage(messageId) {
    return this.data.messages.find(message => 
      message.id === messageId || message.message_uuid === messageId
    );
  }

  // AI Models Management
  getAvailableModels() {
    return this.data.availableModels.filter(model => model.is_active);
  }

  // Force refresh models from config (useful when config is updated)
  refreshModels() {
    this.data.availableModels = AI_MODELS;
    this.saveToStorage();
  }

  getModel(modelId) {
    return this.data.availableModels.find(model => model.model_id === modelId);
  }

  // Statistics and Analytics
  getSessionStats(sessionId) {
    const sessionMessages = this.data.messages.filter(msg => msg.session_id === sessionId);

    const stats = {
      total_messages: sessionMessages.length,
      user_messages: sessionMessages.filter(msg => msg.role === 'user').length,
      assistant_messages: sessionMessages.filter(msg => msg.role === 'assistant').length,
      total_tokens: sessionMessages.reduce((sum, msg) => sum + (msg.token_count || 0), 0),
      avg_response_time: 0
    };

    const responseTimes = sessionMessages
      .filter(msg => msg.response_time_ms)
      .map(msg => msg.response_time_ms);
    
    if (responseTimes.length > 0) {
      stats.avg_response_time = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }

    return stats;
  }

  getModelUsageStats(modelId, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const modelMessages = this.data.messages.filter(msg => 
      msg.model_id === modelId && 
      new Date(msg.created_at) >= cutoffDate
    );

    return {
      total_requests: modelMessages.length,
      total_tokens: modelMessages.reduce((sum, msg) => sum + (msg.token_count || 0), 0),
      avg_response_time: 0,
      unique_sessions: new Set(modelMessages.map(msg => msg.session_id)).size
    };
  }

  // System Settings
  getSetting(key) {
    const settings = this.data.settings || {};
    return settings[key] || null;
  }

  setSetting(key, value) {
    if (!this.data.settings) {
      this.data.settings = {};
    }
    this.data.settings[key] = value;
    this.saveToStorage();
    return { success: true, changes: 1 };
  }

  // Cleanup and Maintenance
  archiveOldSessions(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let archivedCount = 0;
    this.data.sessions.forEach(session => {
      if (new Date(session.last_activity) < cutoffDate && !session.is_archived) {
        session.is_archived = true;
        session.updated_at = new Date().toISOString();
        archivedCount++;
      }
    });

    this.saveToStorage();
    return { success: true, archived_sessions: archivedCount };
  }

  cleanupOldMessages(days = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const initialLength = this.data.messages.length;
    this.data.messages = this.data.messages.filter(msg => 
      new Date(msg.created_at) >= cutoffDate
    );

    const deletedCount = initialLength - this.data.messages.length;
    this.saveToStorage();
    return { success: true, deleted_messages: deletedCount };
  }

  // Get current session
  getCurrentSession() {
    return this.data.currentSessionId ? this.getSession(this.data.currentSessionId) : null;
  }

  // Set current session
  setCurrentSession(sessionId) {
    this.data.currentSessionId = sessionId;
    this.saveToStorage();
  }

  // Clear all data
  clearAllData() {
    this.data = {
      sessions: [],
      messages: [],
      currentSessionId: null,
      availableModels: this.data.availableModels, // Keep models
      settings: {}
    };
    this.saveToStorage();
  }

  // Initialize (for compatibility with existing code)
  async initialize() {
    // Session storage is already initialized in constructor
    return Promise.resolve();
  }

  // Close (for compatibility with existing code)
  async close() {
    // Session storage doesn't need explicit closing
    return Promise.resolve();
  }
}

// Export singleton instance
const sessionStorageService = new SessionStorageService();
export default sessionStorageService;
