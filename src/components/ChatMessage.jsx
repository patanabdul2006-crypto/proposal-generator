// ============================================================
// ChatMessage — spring "bungee" entry animation via framer-motion
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';

function formatContent(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

// ── Spring variant ────────────────────────────────────────────
// High stiffness + low damping = fast initial travel that gently
// overshoots and snaps back ("bungee" feel). originX mirrors the
// alignment so the bubble scales from its natural anchor point.
// delay: AI messages wait 120ms so the TypingIndicator exit animation
// finishes first — this eliminates the white flicker between states.
const bubbleVariants = {
  hidden: (isUser) => ({
    opacity: 0,
    y: 22,
    scale: 0.88,
    originX: isUser ? 1 : 0,  // scale from right for user, left for AI
  }),
  visible: (isUser) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 380,  // fast, snappy travel
      damping: 22,     // slight overshoot before settling
      mass: 0.75,
      delay: isUser ? 0 : 0.12,  // AI messages wait for typing indicator to exit
    },
  }),
};

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const prefix = isUser ? 'You' : 'AI';

  return (
    <motion.div
      className={`message-wrapper ${isUser ? 'message-user' : 'message-assistant'}`}
      // Pass isUser as a custom prop so the hidden variant can read it
      custom={isUser}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      // Remove the old CSS animation so they don't fight each other
      style={{ animation: 'none' }}
    >
      <div className={`message-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
        <p className="message-text">
          <strong>{prefix}:</strong>{' '}
          <span dangerouslySetInnerHTML={{ __html: formatContent(message.content) }} />
        </p>
      </div>
    </motion.div>
  );
}
