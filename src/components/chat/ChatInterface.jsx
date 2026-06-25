// ============================================================
// ChatInterface — Full-featured chat with message actions
// Sidebar is now persistent at the App level (Gemini layout)
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

export default function ChatInterface({
  messages,
  isTyping,
  error,
  proposalJson,
  isRefinementMode,
  isGenerating,
  onSendMessage,
  onGenerateProposal,
  onReset,
  onEditMessage,
  onDeleteMessage,
  onNewChat,
  onOpenPromptPanel,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canGenerate = !!proposalJson && !isGenerating;

  return (
    <div className="chat-interface">

      {/* Panel header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h2 className="chat-title">Conversation</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isRefinementMode && (
              <span className="refinement-badge">✏️ Refining</span>
            )}
            {/* System prompt button */}
            <button
              className="btn-header-icon"
              onClick={() => onOpenPromptPanel?.()}
              title="System Prompt"
            >
              ⚙️
            </button>
            <button
              onClick={onNewChat || onReset}
              title="New proposal"
              className="btn-header-new"
            >
              + New
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            message={msg}
            index={idx}
            onEdit={msg.role === 'user' ? onEditMessage : undefined}
            onDelete={msg.role === 'user' ? onDeleteMessage : undefined}
          />
        ))}
        <AnimatePresence>
          {isTyping && <TypingIndicator key="typing-indicator" />}
        </AnimatePresence>
        {error && (
          <div className="error-banner">⚠️ {error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <form className="chat-input-area" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRefinementMode
                ? 'Type a change (e.g. "Change price to ₹70,000")...'
                : 'Enter client details here...'
            }
            rows={1}
            disabled={isTyping || isGenerating}
          />
          <button
            type="submit"
            className="btn-send"
            disabled={!input.trim() || isTyping || isGenerating}
          >
            Send
          </button>
        </div>
      </form>

      {/* Generate button */}
      <div className="generate-cta">
        <button
          className="btn-generate"
          onClick={onGenerateProposal}
          disabled={!canGenerate}
        >
          {isGenerating ? (
            <><span className="btn-spinner" /> Generating...</>
          ) : (
            'Generate Proposal Preview'
          )}
        </button>
        {isRefinementMode && canGenerate && (
          <p className="refinement-hint">
            💡 Chat to refine, then click Generate again to update
          </p>
        )}
      </div>
    </div>
  );
}
