// ============================================================
// TypingIndicator — Custom CSS "AI is thinking" animation
// Replaces the Lottie animation with a custom pure CSS wave
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      className="message-wrapper message-assistant"
      // Smooth entrance for the whole typing bubble
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <div className="ai-thinking-container">
        <span className="ai-dot dot-left"></span>
        <span className="ai-dot dot-center"></span>
        <span className="ai-dot dot-right"></span>
      </div>
    </motion.div>
  );
}
