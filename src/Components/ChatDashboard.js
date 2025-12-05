import React, { useState, useEffect, useRef } from 'react'
import './ChatDashboard.css'
import { useChat } from '../hooks/useChat'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

// AnimatedText component for AI responses
const AnimatedText = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return <span>{displayedText}</span>;
};

export default function ChatDashboard() {
  const [inputValue, setInputValue] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [copiedMessageId, setCopiedMessageId] = useState(null)
  const [attachedFiles, setAttachedFiles] = useState([])
  const fileInputRef = useRef(null)

  // Use the chat hook
  const {
    currentSession,
    messages,
    availableModels,
    isLoading,
    error,
    sendMessage,
    switchModel,
    currentModel
  } = useChat()

  // Use the speech recognition hook
  const {
    isListening,
    transcript,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    clearTranscript
  } = useSpeechRecognition()

  // Don't automatically create sessions - user must click "New Chat"


  // Auto-resize textarea on mount and when inputValue changes
  useEffect(() => {
    const textarea = document.querySelector('.input-field')
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
    }
  }, [inputValue])

  // Update input value when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue(prev => prev + transcript)
    }
  }, [transcript])

  // Clear transcript when input is manually changed
  useEffect(() => {
    if (inputValue && !isListening) {
      clearTranscript()
    }
  }, [inputValue, isListening, clearTranscript])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleModelChange = async (modelValue) => {
    try {
      await switchModel(modelValue)
      setDropdownOpen(false)
    } catch (err) {
      console.error('Failed to switch model:', err)
    }
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && attachedFiles.length === 0) || isLoading) return

    let messageContent = inputValue.trim()
    
    // Process attached files
    if (attachedFiles.length > 0) {
      try {
        const fileContents = await Promise.all(
          attachedFiles.map(async (file) => {
            const content = await readFileContent(file)
            return {
              name: file.name,
              type: file.type,
              size: file.size,
              content: content
            }
          })
        )
        
        // Add file information to message content
        const fileInfo = fileContents.map(file => 
          `[File: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)}KB)]`
        ).join('\n')
        
        messageContent = messageContent ? 
          `${messageContent}\n\nAttached files:\n${fileInfo}` : 
          `Attached files:\n${fileInfo}`
      } catch (err) {
        console.error('Error reading files:', err)
        alert('Error reading attached files. Please try again.')
        return
      }
    }

    setInputValue('')
    setAttachedFiles([])

    try {
      await sendMessage(messageContent)
    } catch (err) {
      console.error('Failed to send message:', err)
      // Optionally show error to user
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Voice handling functions
  const handleVoiceClick = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      stopListening()
    } else {
      clearTranscript()
      startListening()
    }
  }

  const handleVoiceEnd = () => {
    if (isListening) {
      stopListening()
    }
  }

  const handleCopyMessage = async (messageContent, messageId) => {
    try {
      await navigator.clipboard.writeText(messageContent)
      setCopiedMessageId(messageId)
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = messageContent
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedMessageId(messageId)
      setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
    }
  }

  // File handling functions
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = [
        'text/plain',
        'text/csv',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/html',
        'application/json',
        'text/markdown'
      ]
      return file.size <= maxSize && allowedTypes.includes(file.type)
    })

    if (validFiles.length !== files.length) {
      alert('Some files were rejected. Only text, PDF, Word, HTML, JSON, and Markdown files under 10MB are allowed.')
    }

    setAttachedFiles(prev => [...prev, ...validFiles])
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileRemove = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handlePlusClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      
      if (file.type.startsWith('text/') || file.type === 'application/json') {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Scroll to bottom when loading state changes (for typing indicator)
  useEffect(() => {
    if (isLoading) {
      scrollToBottom()
    }
  }, [isLoading])



  return (
    <div className="App">
      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
        </div>
      )}

      {/* Speech Recognition Error Display */}
      {speechError && (
        <div className="error-banner speech-error">
          <span>{speechError}</span>
        </div>
      )}

      

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <div className="app-title">
              PolyChat
            </div>
            <div className="model-selector" ref={dropdownRef}>
              <div className="model-selector-trigger" onClick={toggleDropdown}>
                <span className="selected-model">
                  {availableModels.find(model => model.model_id === currentModel)?.model_name || 
                   (availableModels.length > 0 ? availableModels[0].model_name : 'Select Model')}
                </span>
                <i className={`fas fa-chevron-down dropdown-icon ${dropdownOpen ? 'open' : ''}`}></i>
              </div>
              
              {dropdownOpen && (
                <div className="model-dropdown">
                  <div className="dropdown-header">
                    <span>Choose your model</span>
                  </div>
                  <div className="dropdown-options">
                    {availableModels.map(model => (
                      <div
                        key={model.model_id}
                        className={`dropdown-option ${currentModel === model.model_id ? 'selected' : ''}`}
                        onClick={() => handleModelChange(model.model_id)}
                      >
                        <div className="option-content">
                          <span className="option-label">{model.model_name}</span>
                          <span className="option-description">{model.description}</span>
                        </div>
                        {currentModel === model.model_id && (
                          <i className="fas fa-check option-check"></i>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {messages.length === 0 ? (
            /* Initial State - Centered Greeting and Input */
            <div className="initial-state">
              <div className="greeting">
                <span className="greeting-main">Hello, there</span>
                <span className="greeting-sub">How can I help you today?</span>
              </div>
              
              <div className="input-container">
                <div className="input-field-wrapper">
                  <div className="input-grid">
                    <textarea
                      className="input-field"
                      placeholder="Ask PolyChat"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      rows="1"
                      disabled={isLoading}
                    />
                    <div className="voice-icon-wrapper">
                      {!inputValue.trim() && (
                        <i 
                          className={`fas fa-microphone voice-icon ${isListening ? 'listening' : ''}`}
                          onClick={handleVoiceClick}
                          title={isListening ? 'Stop recording' : 'Start voice recording'}
                        ></i>
                      )}
                      {isListening && (
                        <div className="voice-status">
                          <span>Listening...</span>
                        </div>
                      )}
                    </div>
                    <div className="input-icons-wrapper">
                      <i className="fas fa-plus input-icon" onClick={handlePlusClick}></i>
                    </div>
                    <div className="send-button-wrapper">
                      {(inputValue.trim() || attachedFiles.length > 0) && (
                        <button 
                          className="send-button" 
                          onClick={handleSendMessage}
                          disabled={isLoading}
                        >
                          <i className="fas fa-paper-plane"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* File Preview */}
                {attachedFiles.length > 0 && (
                  <div className="file-preview-container">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="file-preview-item">
                        <i className="fas fa-file file-icon"></i>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(1)}KB)</span>
                        <button 
                          className="file-remove-btn"
                          onClick={() => handleFileRemove(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.csv,.pdf,.doc,.docx,.html,.json,.md"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          ) : (
            /* Chat State - Messages and Bottom Input */
            <>
              <div className="messages-container">
                <div className="messages-list">
                  {messages.map(message => (
                    <div key={message.id} className={`message ${message.role}`}>
                      <div className="message-content">
                        {message.role === 'assistant' ? (
                          <AnimatedText text={message.content} speed={20} />
                        ) : (
                          message.content
                        )}
                      </div>
                      <div className="message-meta">
                        <span className="message-time">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                        <button 
                          className="copy-button"
                          onClick={() => handleCopyMessage(message.content, message.id)}
                          title="Copy message"
                        >
                          <i className={`fas ${copiedMessageId === message.id ? 'fa-check' : 'fa-copy'}`}></i>
                        </button>
                        {message.role === 'assistant' && (
                          <span className="message-model">
                            {message.model_name || message.model_id || 'AI Model'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="message assistant">
                      <div className="message-content">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span className="typing-text">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                  {/* Invisible element to scroll to */}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div className="input-container bottom-input">
                <div className="input-field-wrapper">
                  <div className="input-grid">
                    <textarea
                      className="input-field"
                      placeholder="Ask PolyChat"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      rows="1"
                      disabled={isLoading}
                    />
                    <div className="voice-icon-wrapper">
                      {!inputValue.trim() && (
                        <i 
                          className={`fas fa-microphone voice-icon ${isListening ? 'listening' : ''}`}
                          onClick={handleVoiceClick}
                          title={isListening ? 'Stop recording' : 'Start voice recording'}
                        ></i>
                      )}
                      {isListening && (
                        <div className="voice-status">
                          <span>Listening...</span>
                        </div>
                      )}
                    </div>
                    <div className="input-icons-wrapper">
                      <i className="fas fa-plus input-icon" onClick={handlePlusClick}></i>
                    </div>
                    <div className="send-button-wrapper">
                      {(inputValue.trim() || attachedFiles.length > 0) && (
                        <button 
                          className="send-button" 
                          onClick={handleSendMessage}
                          disabled={isLoading}
                        >
                          <i className="fas fa-paper-plane"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* File Preview */}
                {attachedFiles.length > 0 && (
                  <div className="file-preview-container">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="file-preview-item">
                        <i className="fas fa-file file-icon"></i>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(1)}KB)</span>
                        <button 
                          className="file-remove-btn"
                          onClick={() => handleFileRemove(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}