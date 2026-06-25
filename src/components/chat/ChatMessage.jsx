// ============================================================
// ChatMessage — Editable/Deletable with spring animation
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

function formatContent(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

// ── Spring variant ────────────────────────────────────────────
const bubbleVariants = {
  hidden: (isUser) => ({
    opacity: 0,
    y: 22,
    scale: 0.88,
    originX: isUser ? 1 : 0,
  }),
  visible: (isUser) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 22,
      mass: 0.75,
      delay: isUser ? 0 : 0.12,
    },
  }),
};

export default function ChatMessage({ message, index, onEdit, onDelete }) {
  const isUser = message.role === 'user';
  const prefix = isUser ? 'You' : 'AI';

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const editRef = useRef(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditText(message.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== message.content && onEdit) {
      onEdit(index, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDelete = () => {
    if (onDelete) onDelete(index);
  };

  return (
    <motion.div
      className={`message-wrapper ${isUser ? 'message-user' : 'message-assistant'}`}
      custom={isUser}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      style={{ animation: 'none' }}
    >
      <div className={`message-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
        {isEditing ? (
          <div className="message-edit-container">
            <textarea
              ref={editRef}
              className="message-edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              rows={2}
            />
            <div className="message-edit-actions">
              <button className="btn-edit-save" onClick={handleSaveEdit}>
                Save & Send
              </button>
              <button className="btn-edit-cancel" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="message-text">
              <strong>{prefix}:</strong>{' '}
              <span dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
            </p>

            {/* Hover actions — only for user messages */}
            {isUser && onEdit && onDelete && (
              <div className="message-actions">
                <button
                  className="msg-action-btn"
                  onClick={handleEdit}
                  title="Edit this message"
                >
                  ✏️
                </button>
                <button
                  className="msg-action-btn"
                  onClick={handleDelete}
                  title="Delete this message (and all below)"
                >
                  🗑️
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
