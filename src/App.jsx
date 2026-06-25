// ============================================================
// App.jsx — Root Component (Atoms Digital Solutions branding)
// Gemini-style persistent sidebar layout
// ============================================================

import React, { useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/ui/SplashScreen';
import ChatInterface from './components/chat/ChatInterface';
import ProposalViewer from './components/proposal/ProposalViewer';
import LiquidEther from './components/ui/LiquidEther';
import SystemPromptPanel from './components/layout/SystemPromptPanel';
import ChatSidebar from './components/layout/ChatSidebar';
import AnimatedLogo from './components/layout/AnimatedLogo';
import atomLogo from './assets/atomlogo.png';
import { useChat } from './hooks/useChat';
import { useProposal } from './hooks/useProposal';

const LIQUID_COLORS = ['#ffc040', '#ff6b00', '#d900ff', '#ff0055', '#7b2cbf'];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [promptPanelOpen, setPromptPanelOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
    currentChatId,
    chatList,
    customSystemPrompt,
    activeSystemPrompt,
    sendUserMessage,
    deleteMessage,
    editMessage,
    resetChat,
    newChat,
    loadSavedChat,
    deleteChat,
    setCustomSystemPrompt,
  } = useChat({ onProposalJsonReady: handleProposalJsonReady });

  const handleGenerateProposal = useCallback(() => {
    const { proposalJson: json, sessionId: sid, conversationHistory: history } = latestChatState.current;
    if (!json) return;
    generate({ proposalJson: json, sessionId: sid, conversationHistory: history });
  }, [generate]);

  const handleReset = useCallback(() => {
    newChat();
    clearProposal();
    latestChatState.current = { conversationHistory: [], sessionId: null, proposalJson: null };
  }, [newChat, clearProposal]);

  return (
    <div className="app-root">
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* ── LiquidEther WebGL fluid background ── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: '#0a0a0a' }}>
        <LiquidEther
          colors={LIQUID_COLORS}
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

      {/* ── Full-page layout: sidebar + content ── */}
      <div className="app-shell">

        {/* Persistent collapsible sidebar */}
        <ChatSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          chatList={chatList}
          currentChatId={currentChatId}
          onNewChat={handleReset}
          onLoadChat={loadSavedChat}
          onDeleteChat={deleteChat}
        />
        
        {/* Mobile Sidebar Backdrop */}
        {isMobileSidebarOpen && (
          <div className="sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} />
        )}

        {/* Right side: header + main panes */}
        <div className="app-body">
          {/* Header */}
          <header className="app-header">
            <div className="header-brand">
              <button 
                className="mobile-menu-toggle" 
                onClick={() => setIsMobileSidebarOpen(true)}
                title="Open Menu"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <AnimatedLogo />
              <div className="header-text-container">
                <span className="brand-name">Proposal Generator Agent</span>
                <span className="header-tagline">AI-powered proposal assistant for Atoms Digital Solutions</span>
              </div>
            </div>
          </header>

          {/* Main content panes */}
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
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
                onNewChat={handleReset}
                onOpenPromptPanel={() => setPromptPanelOpen(true)}
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

          {/* Main App Footer */}
          <footer className="app-main-footer" style={{
            textAlign: 'center',
            padding: '8px 0',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(10,10,10,0.5)',
            borderTop: '1px solid rgba(255,255,255,0.05)'
          }}>
            <span>© 2026 All rights reserved | </span>
            <img src={atomLogo} alt="Atoms Logo" style={{ width: '12px', height: '12px', filter: 'grayscale(100%) opacity(0.7)' }} />
            <span>Atoms Digital Solutions</span>
          </footer>
        </div>
      </div>

      {/* ── System Prompt Panel ── */}
      <SystemPromptPanel
        isOpen={promptPanelOpen}
        onClose={() => setPromptPanelOpen(false)}
        customSystemPrompt={customSystemPrompt}
        onApply={setCustomSystemPrompt}
      />
    </div>
  );
}
