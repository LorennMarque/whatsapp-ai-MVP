/**
 * Dynamic Chat Renderer
 * Handles rendering of chat messages from JavaScript objects
 */

class ChatRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.messages = [];
        this.isTyping = false;
        
        if (!this.container) {
            console.error(`Container with id "${containerId}" not found`);
            return;
        }
        
        this.init();
    }
    
    init() {
        // Add initial styling to container
        this.container.className = 'flex-1 overflow-y-auto p-4 space-y-4';
    }
    
    /**
     * Add a new message to the chat
     * @param {Object} message - Message object with {id, text, sender, timestamp}
     */
    addMessage(message) {
        if (!message || !message.text) {
            console.error('Invalid message object');
            return;
        }
        
        // Add message to array
        this.messages.push({
            id: message.id || Date.now().toString(),
            text: message.text,
            sender: message.sender || 'user',
            timestamp: message.timestamp || new Date(),
            ...message
        });
        
        // Render the message
        this.renderMessage(this.messages[this.messages.length - 1]);
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    /**
     * Render a single message
     * @param {Object} message - Message object
     */
    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} message-item`;
        messageElement.setAttribute('data-message-id', message.id);
        
        // Add animation class
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(10px)';
        
        const messageContent = document.createElement('div');
        messageContent.className = `flex items-end space-x-2 max-w-[70%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`;
        
        // Avatar (only for user messages, positioned on the right)
        let avatar = null;
        if (message.sender === 'user') {
            avatar = document.createElement('div');
            avatar.className = 'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0';
            
            // Check if user has profile picture
            if (message.userAvatar) {
                const img = document.createElement('img');
                img.src = message.userAvatar;
                img.alt = 'User Avatar';
                img.className = 'w-8 h-8 rounded-full object-cover';
                avatar.appendChild(img);
            } else {
                // Default avatar with user initial
                avatar.className += ' bg-blue-500 text-white';
                avatar.textContent = message.userInitial || 'U';
            }
        }
        
        // Message bubble
        const bubble = document.createElement('div');
        bubble.className = `px-4 py-3 rounded-2xl ${
            message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-800 border border-gray-200'
        }`;
        
        // Message text
        const textElement = document.createElement('p');
        textElement.className = 'text-sm leading-relaxed whitespace-pre-wrap';
        textElement.textContent = message.text;
        
        bubble.appendChild(textElement);
        
        // Add elements in correct order
        if (message.sender === 'user') {
            // User message: avatar first, then bubble
            messageContent.appendChild(avatar);
            messageContent.appendChild(bubble);
        } else {
            // AI message: only bubble (no avatar)
            messageContent.appendChild(bubble);
        }
        
        messageElement.appendChild(messageContent);
        
        // Add suggestions if they exist (only for AI messages)
        if (message.sender === 'ai' && message.suggestions && message.suggestions.length > 0) {
            const suggestionsContainer = this.renderSuggestions(message.suggestions, message.id);
            messageElement.appendChild(suggestionsContainer);
        }
        
        // Add to container
        this.container.appendChild(messageElement);
        
        // Animate in
        requestAnimationFrame(() => {
            messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
    }
    
    /**
     * Show typing indicator
     */
    showTyping() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const typingElement = document.createElement('div');
        typingElement.className = 'flex justify-start typing-indicator';
        typingElement.id = 'typing-indicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'flex items-end space-x-2 max-w-[70%]';
        
        const bubble = document.createElement('div');
        bubble.className = 'bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl';
        
        const dots = document.createElement('div');
        dots.className = 'flex space-x-1';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'w-2 h-2 bg-gray-400 rounded-full typing-dot';
            dot.style.animationDelay = `${i * 0.2}s`;
            dots.appendChild(dot);
        }
        
        bubble.appendChild(dots);
        typingContent.appendChild(bubble);
        typingElement.appendChild(typingContent);
        
        this.container.appendChild(typingElement);
        this.scrollToBottom();
    }
    
    /**
     * Hide typing indicator
     */
    hideTyping() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
        this.isTyping = false;
    }
    
    /**
     * Load messages from an array
     * @param {Array} messages - Array of message objects
     */
    loadMessages(messages) {
        if (!Array.isArray(messages)) {
            console.error('Messages must be an array');
            return;
        }
        
        // Clear existing messages
        this.clearMessages();
        
        // Add each message
        messages.forEach((message, index) => {
            // Add small delay between messages for better UX
            setTimeout(() => {
                this.addMessage(message);
            }, index * 100);
        });
    }
    
    /**
     * Clear all messages
     */
    clearMessages() {
        this.container.innerHTML = '';
        this.messages = [];
    }
    
    /**
     * Scroll to bottom of chat
     */
    scrollToBottom() {
        requestAnimationFrame(() => {
            this.container.scrollTop = this.container.scrollHeight;
        });
    }
    
    /**
     * Get all messages
     * @returns {Array} Array of message objects
     */
    getMessages() {
        return [...this.messages];
    }
    
    /**
     * Update a message by ID
     * @param {string} messageId - ID of message to update
     * @param {Object} updates - Updates to apply
     */
    updateMessage(messageId, updates) {
        const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) {
            console.error(`Message with ID ${messageId} not found`);
            return;
        }
        
        // Update message object
        this.messages[messageIndex] = { ...this.messages[messageIndex], ...updates };
        
        // Re-render the message
        const messageElement = this.container.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
        }
        this.renderMessage(this.messages[messageIndex]);
    }
    
    /**
     * Render suggestion buttons for AI messages
     * @param {Array} suggestions - Array of suggestion objects
     * @param {string} messageId - ID of the parent message
     * @returns {HTMLElement} Suggestions container
     */
    renderSuggestions(suggestions, messageId) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'mt-3 flex flex-wrap gap-2 max-w-[70%]';
        suggestionsContainer.setAttribute('data-message-id', messageId);
        
        suggestions.forEach((suggestion, index) => {
            const suggestionButton = document.createElement('button');
            suggestionButton.className = 'suggestion-button px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full border border-gray-200 cursor-pointer';
            suggestionButton.textContent = suggestion.text || suggestion;
            suggestionButton.setAttribute('data-suggestion', suggestion.text || suggestion);
            suggestionButton.setAttribute('data-suggestion-id', suggestion.id || index);
            
            // Add click handler
            suggestionButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSuggestionClick(suggestion, messageId);
            });
            
            // Add staggered animation
            suggestionButton.style.opacity = '0';
            suggestionButton.style.transform = 'translateY(10px) scale(0.9)';
            
            suggestionsContainer.appendChild(suggestionButton);
            
            // Animate in with staggered delay
            setTimeout(() => {
                suggestionButton.style.opacity = '1';
                suggestionButton.style.transform = 'translateY(0) scale(1)';
            }, index * 100); // 100ms delay between each suggestion
        });
        
        return suggestionsContainer;
    }
    
    /**
     * Handle suggestion button click
     * @param {Object|string} suggestion - Suggestion object or text
     * @param {string} messageId - ID of the parent message
     */
    handleSuggestionClick(suggestion, messageId) {
        const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text;
        
        // Add user message with the suggestion text
        this.addMessage({
            id: Date.now().toString(),
            text: suggestionText,
            sender: 'user',
            timestamp: new Date(),
            userAvatar: this.getUserAvatar(),
            userInitial: this.getUserInitial()
        });
        
        // Hide suggestions after clicking
        this.hideSuggestions(messageId);
        
        // Trigger custom event for suggestion click
        const event = new CustomEvent('suggestionClick', {
            detail: {
                suggestion: suggestion,
                messageId: messageId,
                text: suggestionText
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Hide suggestions for a specific message
     * @param {string} messageId - ID of the message
     */
    hideSuggestions(messageId) {
        const messageElement = this.container.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const suggestionsContainer = messageElement.querySelector('.mt-3.flex.flex-wrap.gap-2');
            if (suggestionsContainer) {
                const suggestionButtons = suggestionsContainer.querySelectorAll('button');
                
                // Animate out with staggered delay (reverse order)
                suggestionButtons.forEach((button, index) => {
                    const reverseIndex = suggestionButtons.length - 1 - index;
                    setTimeout(() => {
                        button.style.opacity = '0';
                        button.style.transform = 'translateY(-10px) scale(0.9)';
                    }, reverseIndex * 50); // Faster hide animation (50ms between each)
                });
                
                // Remove container after all animations complete
                setTimeout(() => {
                    if (suggestionsContainer.parentNode) {
                        suggestionsContainer.parentNode.removeChild(suggestionsContainer);
                    }
                }, (suggestionButtons.length * 50) + 300);
            }
        }
    }
    
    /**
     * Get user avatar (to be implemented based on your user system)
     * @returns {string} User avatar URL
     */
    getUserAvatar() {
        // This should be implemented based on your user system
        // For now, return null to use initials
        return null;
    }
    
    /**
     * Get user initial (to be implemented based on your user system)
     * @returns {string} User initial
     */
    getUserInitial() {
        // This should be implemented based on your user system
        // For now, return 'U' as default
        return 'U';
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatRenderer;
}
