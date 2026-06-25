import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function SplashScreen({ onComplete }) {
  const [hasCompleted, setHasCompleted] = useState(false);
  const [dotLottie, setDotLottie] = useState(null);

  const triggerComplete = useCallback(() => {
    if (!hasCompleted) {
      setHasCompleted(true);
      onComplete();
    }
  }, [hasCompleted, onComplete]);

  // The user requested to cut off the long trailing end of the animation.
  // 4.2 seconds is exactly enough time for the "Welcome" text to write out 
  // before we trigger the smooth Framer Motion fadeout.
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerComplete();
    }, 4200);
    return () => clearTimeout(timer);
  }, [triggerComplete]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999, // ensures it sits on top of absolutely everything
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 10, 14, 0.70)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div style={{ width: 400, height: 400 }}>
        <DotLottieReact
          src="https://lottie.host/e1f3f77c-bc31-46b5-b151-dc3e91efe1d5/PFAuPUXMkT.lottie"
          autoplay
          dotLottieRefCallback={setDotLottie}
          // Removed the 'loop' prop so it finishes and triggers 'complete'
        />
      </div>
    </motion.div>
  );
}
