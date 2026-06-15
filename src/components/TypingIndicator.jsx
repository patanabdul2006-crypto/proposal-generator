// ============================================================
// TypingIndicator — LottieFiles dotLottie animation
// Replaces the CSS/framer-motion bouncing dots with the Lottie
// animation selected from lottie.host (React integration)
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// ── Asset URL from LottieFiles (React › Handoff panel) ────────
// Format: dotLottie (.lottie) hosted on lottie.host CDN
// NOTE: The URL below is taken from the visible portion of your
//       LottieFiles handoff panel. If the animation doesn't load,
//       copy the full "Asset link" from the panel and paste it here.
const LOTTIE_SRC = 'https://lottie.host/1d257b02-92ce-463a-aee7-d92f42b78ebd/9LTAnlIPzq.lottie';

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
      {/* No avatar shown — consistent with existing chat style */}
      <div className="bubble-assistant typing-bubble" style={bubbleStyle}>
        <DotLottieReact
          src={LOTTIE_SRC}
          loop
          autoplay
          style={lottieStyle}
        />
      </div>
    </motion.div>
  );
}

// ── Inline styles ─────────────────────────────────────────────
// Constrain the Lottie player so it fits naturally inside the
// existing chat bubble without extra whitespace.
const bubbleStyle = {
  padding: '4px 10px',
  display: 'flex',
  alignItems: 'center',
  minHeight: 48,
};

const lottieStyle = {
  width: 80,
  height: 48,
};
