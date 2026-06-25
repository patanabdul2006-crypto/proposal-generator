// ============================================================
// ChatSidebar — Gemini-style persistent collapsible sidebar
// Two states: expanded (280px) ↔ collapsed (68px)
// Uses CSS custom-property driven transitions (cubic-bezier)
// ============================================================

import React, { useState, useRef, useEffect } from 'react';

// ── Date grouping helper ──────────────────────────────────────
function groupChatsByDate(chats) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7 = new Date(today);
  last7.setDate(last7.getDate() - 7);

  const groups = {
    Today: [],
    Yesterday: [],
    'Last 7 Days': [],
    Older: [],
  };

  for (const chat of chats) {
    const d = new Date(chat.updatedAt);
    if (d >= today) groups.Today.push(chat);
    else if (d >= yesterday) groups.Yesterday.push(chat);
    else if (d >= last7) groups['Last 7 Days'].push(chat);
    else groups.Older.push(chat);
  }

  return groups;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ── Material Symbol icon helper ───────────────────────────────
function Icon({ name, size = 22, filled = false, style = {} }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {name}
    </span>
  );
}

// ── Tooltip for collapsed icon buttons ────────────────────────
function Tooltip({ label, children }) {
  return (
    <div className="gs-tooltip-wrap" title={label} style={{ display: 'inline-flex', width: 'max-content' }}>
      {children}
      <span className="gs-tooltip">{label}</span>
    </div>
  );
}

export default function ChatSidebar({
  isOpen,           // external open signal (from hamburger in chat header)
  onClose,          // called when external logic needs to close
  chatList,
  currentChatId,
  onNewChat,
  onLoadChat,
  onDeleteChat,
  // expansion state is fully self-managed inside
}) {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const searchInputRef = useRef(null);

  // When the external "open" signal fires (e.g. hamburger inside chat pane),
  // always expand the sidebar. If it becomes false (e.g. backdrop clicked),
  // close the sidebar on mobile.
  useEffect(() => {
    if (isOpen) {
      setExpanded(true);
    } else {
      if (window.innerWidth <= 850) {
        setExpanded(false);
      }
    }
  }, [isOpen]);

  const toggle = () => {
    setExpanded((v) => {
      const next = !v;
      if (!next) onClose(); // Hide mobile backdrop if collapsing
      return next;
    });
  };

  const handleActionClose = () => {
    if (window.innerWidth <= 850) {
      setExpanded(false);
      onClose();
    }
  };

  const handleSearchClick = () => {
    if (!expanded) {
      setExpanded(true);
      setTimeout(() => searchInputRef.current?.focus(), 320);
    } else {
      searchInputRef.current?.focus();
    }
  };

  const filteredChats = chatList.filter((c) =>
    !searchQuery || (c.clientName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const groups = groupChatsByDate(filteredChats);

  return (
    <aside className={`gs-sidebar ${expanded ? 'gs-sidebar--expanded' : 'gs-sidebar--collapsed'}`}>

      {/* ── Top nav row ──────────────────────────────────────── */}
      <div className="gs-top-nav">
        {/* Hamburger toggle */}
        <button className="gs-icon-btn" onClick={toggle} title="Toggle sidebar" aria-label="Toggle sidebar">
          <Icon name="menu" size={22} />
        </button>

        {/* "New chat" pencil icon — only visible in expanded state */}
        <button
          className="gs-icon-btn gs-icon-btn--expanded-only"
          onClick={() => { onNewChat(); handleActionClose(); }}
          title="New chat"
          aria-label="New chat"
        >
          <Icon name="edit_square" size={22} />
        </button>
      </div>

      {/* ── New Chat button ───────────────────────── */}
      <div className="gs-new-chat-wrap">
        <Tooltip label="New chat">
          <button className="gs-new-chat-btn" onClick={() => { onNewChat(); handleActionClose(); }} aria-label="New chat">
            <Icon name="add" size={22} className="gs-new-chat-icon" />
            <span className="gs-label">New chat</span>
          </button>
        </Tooltip>
      </div>

      {/* ── Search bar ───────────────────────────────────────── */}
      <div className="gs-search-wrap">
        <Tooltip label="Search">
          <div className="gs-search-bar" onClick={handleSearchClick}>
            <Icon name="search" size={22} className="gs-search-icon" />
            <div className="gs-search-input-wrap gs-label">
              <input
                ref={searchInputRef}
                type="text"
                className="gs-search-input"
                placeholder="Search chats"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="gs-search-clear" onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }} aria-label="Clear search">
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
          </div>
        </Tooltip>
      </div>

      {/* ── Recent chats list ────────────────────────────────── */}
      <div className="gs-chat-list">
        {expanded && chatList.length > 0 && (
          <div className="gs-section-label">
            {searchQuery ? `Results for "${searchQuery}"` : 'Recent'}
          </div>
        )}

        {chatList.length === 0 ? (
          expanded ? (
            <div className="gs-empty">
              <Icon name="chat_bubble_outline" size={32} style={{ color: 'rgba(255,255,255,0.18)' }} />
              <p className="gs-empty-title">No chats yet</p>
              <p className="gs-empty-hint">Start a conversation to see it here</p>
            </div>
          ) : null
        ) : (
          expanded
            ? Object.entries(groups).map(([label, chats]) =>
                chats.length > 0 && (
                  <div key={label} className="gs-group">
                    <div className="gs-group-label">{label}</div>
                    {chats.map((chat) => (
                      <ChatItem
                        key={chat.chatId}
                        chat={chat}
                        isActive={chat.chatId === currentChatId}
                        isHovered={hoveredId === chat.chatId}
                        onHover={setHoveredId}
                        onLoad={(id) => { onLoadChat(id); handleActionClose(); }}
                        onDelete={onDeleteChat}
                        expanded={true}
                      />
                    ))}
                  </div>
                )
              )
            : null
        )}
      </div>
    </aside>
  );
}

// ── Individual chat item ──────────────────────────────────────
function ChatItem({ chat, isActive, isHovered, onHover, onLoad, onDelete, expanded }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      className={`gs-chat-item ${isActive ? 'gs-chat-item--active' : ''} ${!expanded ? 'gs-chat-item--icon' : ''}`}
      onClick={() => { if (!menuOpen) onLoad(chat.chatId); }}
      onMouseEnter={() => onHover(chat.chatId)}
      onMouseLeave={() => onHover(null)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onLoad(chat.chatId)}
    >
      <span className="gs-chat-icon">
        <Icon name="chat_bubble_outline" size={18} filled={isActive} />
      </span>

      {expanded && (
        <>
          <div className="gs-chat-info">
            <span className="gs-chat-name">{chat.clientName || 'New Chat'}</span>
            <span className="gs-chat-meta">
              {chat.clientType && <span className="gs-chat-type">{chat.clientType}</span>}
              <span className="gs-chat-time">{formatTime(chat.updatedAt)}</span>
            </span>
          </div>
          
          <div className="gs-chat-options-container" ref={menuRef}>
            <button
              className={`gs-chat-options-btn ${menuOpen ? 'open' : ''}`}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              title="Options"
              aria-label="Options"
            >
              <Icon name="more_vert" size={16} />
            </button>
            {menuOpen && (
              <div className="gs-chat-menu">
                <button
                  className="gs-chat-menu-item delete"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(chat.chatId); }}
                >
                  <Icon name="delete" size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
