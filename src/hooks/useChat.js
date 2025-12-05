import { useState, useEffect, useCallback } from 'react';
import chatService from '../services/chatService';
import { DEFAULT_CONFIG } from '../config';

export const useChat = (initialModelId = DEFAULT_CONFIG.DEFAULT_MODEL) => {
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [defaultModel, setDefaultModel] = useState(initialModelId);

  // Initialize chat service and load available models
  useEffect(() => {
    const initialize = async () => {
      try {
        await chatService.initialize();
        const models = await chatService.getAvailableModels();
        setAvailableModels(models);
        
        // Set the first model as default
        if (models.length > 0) {
          setDefaultModel(models[0].model_id);
        }
        
        // Auto-create a session if none exists
        const currentSession = chatService.getCurrentSession();
        if (!currentSession) {
          try {
            const session = await chatService.startNewSession(models[0]?.model_id || DEFAULT_CONFIG.DEFAULT_MODEL);
            setCurrentSession(session);
          } catch (sessionErr) {
            console.warn('Failed to auto-create session:', sessionErr);
          }
        } else {
          setCurrentSession(currentSession);
          // Load existing messages
          const history = await chatService.getConversationHistory();
          setMessages(history);
        }
        
        setIsInitialized(true);
      } catch (err) {
        setError('Failed to initialize chat service');
        console.error('Initialization error:', err);
        setIsInitialized(true); // Still set to true to prevent infinite loading
      }
    };

    initialize();
  }, []);

  // Start a new chat session
  const startNewSession = useCallback(async (modelId = initialModelId, userId = null) => {
    if (!isInitialized) {
      throw new Error('Chat service not initialized yet');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const session = await chatService.startNewSession(modelId, userId);
      setCurrentSession(session);
      setMessages([]);
      return session;
    } catch (err) {
      setError('Failed to start new session');
      console.error('Start session error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [initialModelId, isInitialized]);

  // Load an existing session
  const loadSession = useCallback(async (sessionId) => {
    if (!isInitialized) {
      throw new Error('Chat service not initialized yet');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const session = await chatService.loadSession(sessionId);
      setCurrentSession(session);
      
      // Load conversation history
      const history = await chatService.getConversationHistory();
      setMessages(history);
      
      return session;
    } catch (err) {
      setError('Failed to load session');
      console.error('Load session error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Send a message
  const sendMessage = useCallback(async (content, modelId = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Auto-create session if none exists
      if (!currentSession) {
        const session = await chatService.startNewSession(modelId || defaultModel);
        setCurrentSession(session);
      }
      
      // Create a temporary user message object to display immediately
      const tempUserMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: content,
        created_at: new Date().toISOString(),
        session_id: currentSession?.id || 'temp'
      };
      
      // Add user message to chat immediately
      setMessages(prev => [...prev, tempUserMessage]);
      
      // Send message to API and get response
      const result = await chatService.sendMessage(content, modelId);
      
      // Replace the temporary user message with the real one and add assistant response
      setMessages(prev => {
        const updatedMessages = prev.filter(msg => msg.id !== tempUserMessage.id);
        return [...updatedMessages, result.userMessage, result.assistantMessage];
      });
      
      return result;
    } catch (err) {
      setError('Failed to send message');
      console.error('Send message error:', err);
      
      // Remove the temporary user message if API call failed
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, defaultModel]);

  // Update session title
  const updateSessionTitle = useCallback(async (title) => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    try {
      await chatService.updateSessionTitle(title);
      setCurrentSession(prev => ({ ...prev, title }));
    } catch (err) {
      setError('Failed to update session title');
      console.error('Update title error:', err);
      throw err;
    }
  }, [currentSession]);

  // Switch model
  const switchModel = useCallback(async (modelId) => {
    try {
      // Auto-create session if none exists
      if (!currentSession) {
        const session = await chatService.startNewSession(modelId);
        setCurrentSession(session);
      } else {
        await chatService.switchModel(modelId);
        setCurrentSession(prev => ({ ...prev, model_id: modelId }));
      }
    } catch (err) {
      setError('Failed to switch model');
      console.error('Switch model error:', err);
      throw err;
    }
  }, [currentSession]);

  // Archive current session
  const archiveSession = useCallback(async () => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    try {
      await chatService.archiveSession();
      setCurrentSession(null);
      setMessages([]);
    } catch (err) {
      setError('Failed to archive session');
      console.error('Archive session error:', err);
      throw err;
    }
  }, [currentSession]);

  // Clear current session
  const clearSession = useCallback(() => {
    chatService.clearCurrentSession();
    setCurrentSession(null);
    setMessages([]);
  }, []);

  // Get user sessions
  const getUserSessions = useCallback(async (userId, limit = 50) => {
    try {
      return await chatService.getUserSessions(userId, limit);
    } catch (err) {
      setError('Failed to get user sessions');
      console.error('Get user sessions error:', err);
      throw err;
    }
  }, []);

  // Get session statistics
  const getSessionStats = useCallback(async () => {
    if (!currentSession) {
      throw new Error('No active session');
    }

    try {
      return await chatService.getSessionStats();
    } catch (err) {
      setError('Failed to get session stats');
      console.error('Get session stats error:', err);
      throw err;
    }
  }, [currentSession]);

  return {
    // State
    currentSession,
    messages,
    availableModels,
    isLoading,
    error,
    isInitialized,
    
    // Actions
    startNewSession,
    loadSession,
    sendMessage,
    updateSessionTitle,
    switchModel,
    archiveSession,
    clearSession,
    getUserSessions,
    getSessionStats,
    
    // Utilities
    hasActiveSession: !!currentSession,
    currentModel: currentSession?.model_id || defaultModel,
  };
};
