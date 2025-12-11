import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPen, faArrowUp, faBars, faCheck, faBolt, faXmark, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { getActiveModels, getDefaultModel } from './config/openrouter';
import { sendChatRequest, extractResponseText, formatMessagesForAPI } from './services/openrouterApi';
import './App.css';

function App() {
  const inputLabels = [
    'What are you working on?',
    'How can I help you today?',
    'What would you like to know?',
    'Ask me anything',
    'What\'s on your mind?',
    'How can I assist you?',
    'What do you need help with?',
    'What can I do for you?',
    'Tell me what you\'re thinking',
    'What would you like to explore?'
  ];

  const isInitialMobile = typeof window !== 'undefined' && window.innerWidth <= 770;
  const [isPanelOpen, setIsPanelOpen] = useState(!isInitialMobile);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(isInitialMobile);
  const [hasChatStarted, setHasChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState(getDefaultModel());
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessages, setTypingMessages] = useState({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentInputLabel, setCurrentInputLabel] = useState(inputLabels[0]);
  const dropdownRef = useRef(null);
  const messageRefs = useRef({});
  const chatAreaRef = useRef(null);
  const textareaRef = useRef(null);

  // Detect mobile screen size changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 770;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setIsDropdownOpen(false);
  };

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage = {
        id: Date.now(),
        text: inputValue.trim(),
        sender: 'user',
        timestamp: new Date()
      };
      
      // Add user message
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setHasChatStarted(true);
      setInputValue('');
      setIsLoading(true);
      
      try {
        // Format messages for API (include conversation history)
        const apiMessages = formatMessagesForAPI(updatedMessages);
        
        // Send request to OpenRouter API
        const response = await sendChatRequest(selectedModel.openrouter_id, apiMessages);
        
        // Extract response text
        const responseText = extractResponseText(response);
        
        // Add assistant response with typing animation
        const assistantMessageId = Date.now() + 1;
        const assistantMessage = {
          id: assistantMessageId,
          text: responseText || 'Sorry, I could not generate a response.',
          sender: 'assistant',
          timestamp: new Date()
        };
        
        // Start typing animation
        setTypingMessages(prev => ({
          ...prev,
          [assistantMessageId]: {
            displayedText: '',
            fullText: assistantMessage.text,
            isTyping: true
          }
        }));
        
        // Add message with empty text initially (will be updated by typing animation)
        setMessages([...updatedMessages, { ...assistantMessage, text: '' }]);
        
        // Start typing animation
        startTypingAnimation(assistantMessageId, assistantMessage.text, updatedMessages);
      } catch (error) {
        console.error('Error sending message:', error);
        // Add error message with typing animation
        const errorMessageId = Date.now() + 1;
        const errorText = `Error: ${error.message || 'Failed to get response from API'}`;
        const errorMessage = {
          id: errorMessageId,
          text: errorText,
          sender: 'assistant',
          timestamp: new Date()
        };
        
        // Start typing animation for error message
        setTypingMessages(prev => ({
          ...prev,
          [errorMessageId]: {
            displayedText: '',
            fullText: errorText,
            isTyping: true
          }
        }));
        
        setMessages([...updatedMessages, { ...errorMessage, text: '' }]);
        startTypingAnimation(errorMessageId, errorText, updatedMessages);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleLogoClick = () => {
    // Get a random label different from the current one
    const availableLabels = inputLabels.filter(label => label !== currentInputLabel);
    const randomIndex = Math.floor(Math.random() * availableLabels.length);
    setCurrentInputLabel(availableLabels[randomIndex] || inputLabels[0]);
  };

  const handleNewChat = () => {
    // Clear all chat messages
    setMessages([]);
    // Reset chat state
    setHasChatStarted(false);
    // Clear input field
    setInputValue('');
    // Clear typing animations
    setTypingMessages({});
    // Clear search if open
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
    }
    // Clear highlighted message
    setHighlightedMessageId(null);
    // Reset loading state
    setIsLoading(false);
    // Close side panel on mobile after starting new chat
    if (isMobile) {
      setIsPanelOpen(false);
    }
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSearchChats = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Highlight search text in message content
  const highlightSearchText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return <mark key={index} className="search-highlight">{part}</mark>;
      }
      return part;
    });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Show a toast notification or feedback
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const formatMessageContent = (text, searchQuery = '') => {
    if (!text) return '';
    
    // Split by double newlines to preserve paragraphs, but also handle single newlines within lists
    const parts = [];
    const lines = text.split('\n');
    let currentParagraph = [];
    let inList = false;
    
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Check for headers
      if (trimmed.startsWith('### ')) {
        if (currentParagraph.length > 0) {
          parts.push({ type: 'text', content: currentParagraph.join('\n') });
          currentParagraph = [];
        }
        parts.push({ type: 'h3', content: trimmed.replace(/^###\s+/, '') });
        inList = false;
        return;
      }
      
      if (trimmed.startsWith('## ')) {
        if (currentParagraph.length > 0) {
          parts.push({ type: 'text', content: currentParagraph.join('\n') });
          currentParagraph = [];
        }
        parts.push({ type: 'h2', content: trimmed.replace(/^##\s+/, '') });
        inList = false;
        return;
      }
      
      if (trimmed.startsWith('# ')) {
        if (currentParagraph.length > 0) {
          parts.push({ type: 'text', content: currentParagraph.join('\n') });
          currentParagraph = [];
        }
        parts.push({ type: 'h1', content: trimmed.replace(/^#\s+/, '') });
        inList = false;
        return;
      }
      
      // Check for list items
      if (trimmed.startsWith('- ')) {
        if (currentParagraph.length > 0 && !inList) {
          parts.push({ type: 'text', content: currentParagraph.join('\n') });
          currentParagraph = [];
        }
        if (!inList) {
          parts.push({ type: 'list-start' });
          inList = true;
        }
        parts.push({ type: 'list-item', content: trimmed.replace(/^-\s+/, '') });
        return;
      }
      
      // Empty line - end current paragraph or list
      if (trimmed === '') {
        if (inList) {
          parts.push({ type: 'list-end' });
          inList = false;
        } else if (currentParagraph.length > 0) {
          parts.push({ type: 'text', content: currentParagraph.join('\n') });
          currentParagraph = [];
        }
        return;
      }
      
      // Regular text line
      if (inList) {
        parts.push({ type: 'list-end' });
        inList = false;
      }
      currentParagraph.push(line);
    });
    
    // Handle remaining content
    if (inList) {
      parts.push({ type: 'list-end' });
    }
    if (currentParagraph.length > 0) {
      parts.push({ type: 'text', content: currentParagraph.join('\n') });
    }
    
    // Render parts
    const elements = [];
    let listItems = [];
    let key = 0;
    
    parts.forEach((part) => {
      if (part.type === 'list-start') {
        listItems = [];
      } else if (part.type === 'list-item') {
        listItems.push(part.content);
      } else if (part.type === 'list-end') {
        if (listItems.length > 0) {
          elements.push(
            <ul key={key++} className="message-list">
              {listItems.map((item, itemIdx) => {
                const content = searchQuery 
                  ? highlightSearchText(item, searchQuery)
                  : formatBoldText(item);
                return (
                  <li key={itemIdx} className="message-list-item">
                    {content}
                  </li>
                );
              })}
            </ul>
          );
          listItems = [];
        }
      } else if (part.type === 'h1') {
        const content = searchQuery 
          ? highlightSearchText(part.content, searchQuery)
          : formatBoldText(part.content);
        elements.push(
          <h1 key={key++} className="message-header">
            {content}
          </h1>
        );
      } else if (part.type === 'h2') {
        const content = searchQuery 
          ? highlightSearchText(part.content, searchQuery)
          : formatBoldText(part.content);
        elements.push(
          <h2 key={key++} className="message-header">
            {content}
          </h2>
        );
      } else if (part.type === 'h3') {
        const content = searchQuery 
          ? highlightSearchText(part.content, searchQuery)
          : formatBoldText(part.content);
        elements.push(
          <h3 key={key++} className="message-header">
            {content}
          </h3>
        );
      } else if (part.type === 'text' && part.content.trim()) {
        const content = searchQuery 
          ? highlightSearchText(part.content, searchQuery)
          : formatBoldText(part.content);
        elements.push(
          <p key={key++} className="message-paragraph">
            {content}
          </p>
        );
      }
    });
    
    return elements;
  };

  const formatBoldText = (text) => {
    if (!text) return '';
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const startTypingAnimation = (messageId, fullText, previousMessages) => {
    let currentIndex = 0;
    const typingSpeed = 5; // milliseconds per character (faster typing)
    
    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        const displayedText = fullText.substring(0, currentIndex + 1);
        
        setTypingMessages(prev => ({
          ...prev,
          [messageId]: {
            displayedText,
            fullText,
            isTyping: true
          }
        }));
        
        // Update the message in messages array
        setMessages(prev => {
          const updated = [...prev];
          const messageIndex = updated.findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1) {
            updated[messageIndex] = {
              ...updated[messageIndex],
              text: displayedText
            };
          }
          return updated;
        });
        
        currentIndex++;
        setTimeout(typeNextChar, typingSpeed);
      } else {
        // Typing complete
        setTypingMessages(prev => {
          const updated = { ...prev };
          if (updated[messageId]) {
            updated[messageId].isTyping = false;
          }
          return updated;
        });
      }
    };
    
    typeNextChar();
  };

  // Auto-scroll to bottom when messages change (only if not searching)
  useEffect(() => {
    if (chatAreaRef.current && !searchQuery) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, typingMessages, searchQuery]);

  // Scroll to first matching message when search query changes
  useEffect(() => {
    if (searchQuery.trim() && chatAreaRef.current && messages.length > 0) {
      const matchingMessage = messages.find(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingMessage) {
        setHighlightedMessageId(matchingMessage.id);
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          const messageElement = messageRefs.current[matchingMessage.id];
          if (messageElement && chatAreaRef.current) {
            const chatArea = chatAreaRef.current;
            const messageRect = messageElement.getBoundingClientRect();
            const chatAreaRect = chatArea.getBoundingClientRect();
            
            // Calculate scroll position to center the message
            const scrollTop = chatArea.scrollTop + messageRect.top - chatAreaRect.top - (chatAreaRect.height / 2) + (messageRect.height / 2);
            
            chatArea.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
            });
          }
        }, 150);
      } else {
        setHighlightedMessageId(null);
      }
    } else {
      setHighlightedMessageId(null);
    }
  }, [searchQuery, messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="App">
      {/* Mobile Navbar */}
      <nav className="mobile-navbar">
        <button className="hamburger-button" onClick={togglePanel}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        {isMobile && (
          <div className="dropdown-container mobile-dropdown" ref={dropdownRef}>
            <button className="dropdown-button" onClick={toggleDropdown}>
              {selectedModel.model_name} <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {getActiveModels().map((model) => (
                  <div 
                    key={model.id} 
                    className={`dropdown-item ${selectedModel.id === model.id ? 'active' : ''}`}
                    onClick={() => handleModelSelect(model)}
                  >
                    <div className="dropdown-item-content">
                      <div className="dropdown-item-icon">
                        <FontAwesomeIcon icon={faBolt} />
                      </div>
                      <div className="dropdown-item-text">
                        <div className="dropdown-item-name">{model.model_name}</div>
                        <div className="dropdown-item-description">{model.description}</div>
                      </div>
                    </div>
                    {selectedModel.id === model.id && (
                      <div className="dropdown-item-check">
                        <FontAwesomeIcon icon={faCheck} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Backdrop overlay for mobile */}
      {isMobile && isPanelOpen && <div className="backdrop" onClick={togglePanel}></div>}

      {/* Side Panel */}
      <div className={`side-panel ${isPanelOpen ? 'open' : 'closed'}`}>
        {isPanelOpen && (
          <>
            <div className="side-panel-header">
              <div className="side-panel-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                <img src="/multimodel.png" alt="MultiModel.ai" className="logo-image" />
              </div>
              <button className="side-panel-close-button">
                <FontAwesomeIcon icon={faAngleLeft} />
              </button>
            </div>
            <div className="side-panel-content">
              <button className="side-panel-item" onClick={handleNewChat}>
              <span className="side-panel-icon">
                <FontAwesomeIcon icon={faPen} />
              </span>
              <span className="side-panel-text">New chat</span>
            </button>
            <button className="side-panel-item" onClick={handleSearchChats}>
              <span className="side-panel-icon">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <span className="side-panel-text">Search chats</span>
            </button>
            </div>
          </>
        )}
      </div>

      {/* Search Pad */}
      {isSearchOpen && (
        <div className="search-pad-overlay" onClick={handleSearchClose}>
          <div className="search-pad" onClick={(e) => e.stopPropagation()}>
            <div className="search-pad-header">
              <h3>Search Chats</h3>
              <button className="search-close-button" onClick={handleSearchClose}>
                ×
              </button>
            </div>
            <div className="search-pad-input-container">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-input-icon" />
              <input
                type="text"
                className="search-pad-input"
                placeholder="Search in messages..."
                value={searchQuery}
                onChange={handleSearchChange}
                autoFocus
              />
            </div>
            {searchQuery && (
              <div className="search-results-info">
                Found {messages.filter(msg => 
                  msg.text.toLowerCase().includes(searchQuery.toLowerCase())
                ).length} result(s)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {!isMobile && (
          <div className="dropdown-container" ref={dropdownRef}>
            <button className="dropdown-button" onClick={toggleDropdown}>
              {selectedModel.model_name} <span className="dropdown-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {getActiveModels().map((model) => (
                  <div 
                    key={model.id} 
                    className={`dropdown-item ${selectedModel.id === model.id ? 'active' : ''}`}
                    onClick={() => handleModelSelect(model)}
                  >
                    <div className="dropdown-item-content">
                      <div className="dropdown-item-icon">
                        <FontAwesomeIcon icon={faBolt} />
                      </div>
                      <div className="dropdown-item-text">
                        <div className="dropdown-item-name">{model.model_name}</div>
                        <div className="dropdown-item-description">{model.description}</div>
                      </div>
                    </div>
                    {selectedModel.id === model.id && (
                      <div className="dropdown-item-check">
                        <FontAwesomeIcon icon={faCheck} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="input-wrapper">
          {!hasChatStarted && (
            <p className="input-label">{currentInputLabel}</p>
          )}
          {hasChatStarted && (
            <div className="chat-response-area" ref={chatAreaRef}>
              {messages.map((message) => {
                const typingState = typingMessages[message.id];
                const isTyping = typingState?.isTyping || false;
                const displayText = typingState?.displayedText || message.text;
                const isHighlighted = highlightedMessageId === message.id && searchQuery;
                const hasMatch = searchQuery && message.text.toLowerCase().includes(searchQuery.toLowerCase());
                
                return (
                  <div 
                    key={message.id} 
                    ref={el => messageRefs.current[message.id] = el}
                    className={`chat-message ${message.sender} ${isHighlighted ? 'search-highlighted' : ''}`}
                  >
                    <div className="message-content">
                      {message.sender === 'assistant' 
                        ? (searchQuery ? (
                            <div>
                              {formatMessageContent(displayText, searchQuery)}
                            </div>
                          ) : formatMessageContent(displayText))
                        : (searchQuery ? highlightSearchText(message.text, searchQuery) : message.text)
                      }
                      {isTyping && <span className="typing-cursor">|</span>}
                    </div>
                    {!isTyping && (
                      <div className="message-footer">
                        <div className="message-timestamp">{formatTimestamp(message.timestamp)}</div>
                        <button 
                          className="copy-button" 
                          onClick={() => handleCopyMessage(message.text)}
                          title="Copy message"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="chat-message assistant">
                  <div className="message-content loading-message">Thinking...</div>
                </div>
              )}
            </div>
          )}
          <div className={`input-container ${isInputFocused ? 'focused' : ''}`}>
            <textarea
              ref={textareaRef}
              placeholder="Ask anything" 
              className="input-field"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              rows={1}
            />
            <button className="send-button" onClick={handleSend} disabled={isLoading}>
              <FontAwesomeIcon icon={faArrowUp} className="send-arrow" />
            </button>
          </div>
          <div className="footer">
            <p className="footer-text">©2025 MultiModel.ai. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
