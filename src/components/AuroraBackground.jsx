// ============================================================
// AuroraBackground.jsx
// Glassmorphic Aurora — Golden-Hour mesh gradient +
// mouse-tracking radial spotlight
// z-index: -1  (sits behind all content)
// ============================================================

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// ── Golden-Hour Orb Definitions ───────────────────────────────
// Each orb is an animated blurred circle that drifts slowly,
// together forming the fluid "mesh gradient" effect.
const ORBS = [
  {
    id: 'orb-1',
    color: 'radial-gradient(circle, rgba(194, 97, 24, 0.75) 0%, transparent 70%)',
    size: '80vw',
    initial: { x: '-10%', y: '-10%' },
    animate: {
      x: ['-10%', '15%', '-5%', '-10%'],
      y: ['-10%', '5%',  '20%',  '-10%'],
    },
    duration: 28,
  },
  {
    id: 'orb-2',
    color: 'radial-gradient(circle, rgba(139, 60, 20, 0.70) 0%, transparent 65%)',
    size: '70vw',
    initial: { x: '50%', y: '0%' },
    animate: {
      x: ['50%', '30%', '60%', '50%'],
      y: ['0%',  '30%', '10%', '0%'],
    },
    duration: 34,
  },
  {
    id: 'orb-3',
    color: 'radial-gradient(circle, rgba(90, 35, 110, 0.65) 0%, transparent 65%)',
    size: '75vw',
    initial: { x: '20%', y: '60%' },
    animate: {
      x: ['20%', '50%', '10%', '20%'],
      y: ['60%', '40%', '70%', '60%'],
    },
    duration: 38,
  },
  {
    id: 'orb-4',
    color: 'radial-gradient(circle, rgba(210, 130, 40, 0.55) 0%, transparent 60%)',
    size: '60vw',
    initial: { x: '70%', y: '70%' },
    animate: {
      x: ['70%', '85%', '55%', '70%'],
      y: ['70%', '50%', '85%', '70%'],
    },
    duration: 32,
  },
  {
    id: 'orb-5',
    color: 'radial-gradient(circle, rgba(60, 20, 80, 0.60) 0%, transparent 68%)',
    size: '65vw',
    initial: { x: '-5%', y: '50%' },
    animate: {
      x: ['-5%', '20%', '-10%', '-5%'],
      y: ['50%', '70%', '30%',  '50%'],
    },
    duration: 42,
  },
  {
    id: 'orb-6',
    color: 'radial-gradient(circle, rgba(160, 70, 15, 0.50) 0%, transparent 60%)',
    size: '55vw',
    initial: { x: '40%', y: '20%' },
    animate: {
      x: ['40%', '55%', '25%', '40%'],
      y: ['20%', '5%',  '35%', '20%'],
    },
    duration: 26,
  },
];

// ── Spring config for the spotlight cursor ────────────────────
const SPRING_CONFIG = { damping: 30, stiffness: 120, mass: 0.8 };

export default function AuroraBackground() {
  // Raw mouse position
  const rawX = useMotionValue(
    typeof window !== 'undefined' ? window.innerWidth / 2 : 0
  );
  const rawY = useMotionValue(
    typeof window !== 'undefined' ? window.innerHeight / 2 : 0
  );

  // Smoothed position — creates the "lagging" spotlight feel
  const spotX = useSpring(rawX, SPRING_CONFIG);
  const spotY = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    const onMove = (e) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawX, rawY]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        // Deep shadow base — the "night" beneath the aurora
        background:
          'linear-gradient(135deg, #1a0a00 0%, #0d0012 40%, #200a00 75%, #0a0008 100%)',
      }}
    >
      {/* ── Animated Mesh Orbs ─────────────────────────────── */}
      {ORBS.map((orb) => (
        <motion.div
          key={orb.id}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            background: orb.color,
            filter: 'blur(80px)',
            borderRadius: '50%',
            willChange: 'transform',
            // Translate by -50% so the center of the orb is at x/y
            transform: 'translate(-50%, -50%)',
          }}
          initial={orb.initial}
          animate={orb.animate}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'loop',
          }}
        />
      ))}

      {/* ── Noise / Film-grain texture overlay ──────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }}
      />

      {/* ── Vignette — darker edges for cinematic depth ──────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Mouse-Tracking Spotlight ─────────────────────────── */}
      <motion.div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          // Golden warm spotlight
          background:
            'radial-gradient(circle, rgba(230, 145, 50, 0.12) 0%, rgba(180, 80, 20, 0.06) 40%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          willChange: 'transform',
          // Centre the spotlight on the cursor
          x: spotX,
          y: spotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </div>
  );
}
