// ============================================================
// App.jsx — Root Component (Atoms Digital Solutions branding)
// ============================================================

import React, { useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import ChatInterface from './components/ChatInterface';
import ProposalViewer from './components/ProposalViewer';
import LiquidEther from './components/LiquidEther';
import { useChat } from './hooks/useChat';
import { useProposal } from './hooks/useProposal';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { generate, proposalHtml, isGenerating, error: proposalError, clearProposal } = useProposal();

  const latestChatState = useRef({ conversationHistory: [], sessionId: null, proposalJson: null });

  const handleProposalJsonReady = useCallback(
    (json, sessionId, conversationHistory) => {
      latestChatState.current = { proposalJson: json, sessionId, conversationHistory };
    },
    []
  );

  const {
    messages,
    isTyping,
    error: chatError,
    proposalJson,
    isRefinementMode,
    sendUserMessage,
    resetChat,
  } = useChat({ onProposalJsonReady: handleProposalJsonReady });

  const handleGenerateProposal = useCallback(() => {
    const { proposalJson: json, sessionId: sid, conversationHistory: history } = latestChatState.current;
    if (!json) return;
    generate({ proposalJson: json, sessionId: sid, conversationHistory: history });
  }, [generate]);

  const handleReset = useCallback(() => {
    resetChat();
    clearProposal();
    latestChatState.current = { conversationHistory: [], sessionId: null, proposalJson: null };
  }, [resetChat, clearProposal]);

  return (
    <div className="app-root">
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* ── LiquidEther WebGL fluid — sole background layer ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: '#0a0a0a' }}>
        <LiquidEther
          colors={['#ffc040', '#ff6b00', '#d900ff', '#ff0055', '#7b2cbf']}
          mouseForce={40}
          cursorSize={160}
          resolution={0.5}
          autoDemo={true}
          autoSpeed={0.4}
          autoIntensity={2.5}
          autoResumeDelay={3000}
          autoRampDuration={0.8}
          takeoverDuration={0.3}
          BFECC={true}
          isViscous={false}
          isBounce={false}
        />
      </div>
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-name">Proposal Generator Agent</span>
          <span className="header-tagline">AI-powered proposal assistant for Atoms Digital Solutions</span>
        </div>
      </header>

      {/* Floating glass-card layout */}
      <main className="app-main">
        <div className="pane glass-card pane-chat">
          <ChatInterface
            messages={messages}
            isTyping={isTyping}
            error={chatError}
            proposalJson={proposalJson}
            isRefinementMode={isRefinementMode}
            isGenerating={isGenerating}
            onSendMessage={sendUserMessage}
            onGenerateProposal={handleGenerateProposal}
            onReset={handleReset}
          />
        </div>
        <div className="pane glass-card pane-proposal">
          <ProposalViewer
            proposalHtml={proposalHtml}
            isGenerating={isGenerating}
            proposalJson={proposalJson}
            error={proposalError}
          />
        </div>
      </main>
    </div>
  );
}
