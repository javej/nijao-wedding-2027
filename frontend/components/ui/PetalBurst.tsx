'use client';

import { motion, useReducedMotion } from 'motion/react';

// --- Palette colors from design tokens ---

const PETAL_COLORS = [
  'var(--color-matcha-chiffon)',
  'var(--color-strawberry-milk)',
  'var(--color-berry-meringue)',
];

// --- Petal shape variants for visual variety ---

const PETAL_SHAPES = [
  '80% 0 55% 50% / 55% 0 80% 50%',     // classic petal
  '50% 50% 50% 0 / 50% 50% 50% 0',       // teardrop
  '60% 40% 60% 40% / 40% 60% 40% 60%',   // rounded petal
];

// --- Petal configuration ---

interface PetalConfig {
  /** x keyframes: [start, burst, drift, final] as vw offsets from center */
  xPath: number[];
  /** y keyframes: [start, peak, mid, final] as vh offsets from center */
  yPath: number[];
  delay: number;
  duration: number;
  rotate: number;
  /** Y-axis rotation for 3D tumble effect */
  tumble: number;
  size: number;
  colorIndex: number;
  shapeIndex: number;
}

// 28 petals bursting from center in all directions with arc trajectories
const PETALS: PetalConfig[] = [
  // --- Top burst (upward) ---
  { xPath: [0, -8, -14, -18],  yPath: [0, -35, -20, 15],   delay: 0,   duration: 7.5, rotate: 200,  tumble: 360,  size: 28, colorIndex: 0, shapeIndex: 0 },
  { xPath: [0, 5, 10, 14],     yPath: [0, -40, -22, 20],   delay: 0.1, duration: 8.0, rotate: -160, tumble: -360, size: 22, colorIndex: 1, shapeIndex: 1 },
  { xPath: [0, -2, -6, -10],   yPath: [0, -45, -30, 8],    delay: 0.2, duration: 8.5, rotate: 240,  tumble: 540,  size: 32, colorIndex: 2, shapeIndex: 2 },
  { xPath: [0, 10, 18, 22],    yPath: [0, -32, -15, 25],   delay: 0.15,duration: 7.2, rotate: -200, tumble: -540, size: 20, colorIndex: 0, shapeIndex: 1 },

  // --- Upper-right burst ---
  { xPath: [0, 18, 28, 32],    yPath: [0, -25, -8, 18],    delay: 0.05,duration: 7.8, rotate: 180,  tumble: 360,  size: 26, colorIndex: 1, shapeIndex: 0 },
  { xPath: [0, 22, 30, 36],    yPath: [0, -18, -2, 28],    delay: 0.25,duration: 7.4, rotate: -220, tumble: -360, size: 18, colorIndex: 2, shapeIndex: 2 },
  { xPath: [0, 15, 24, 28],    yPath: [0, -30, -12, 14],   delay: 0.35,duration: 8.2, rotate: 260,  tumble: 540,  size: 24, colorIndex: 0, shapeIndex: 0 },

  // --- Right burst ---
  { xPath: [0, 25, 35, 40],    yPath: [0, -10, 5, 22],     delay: 0.08,duration: 7.6, rotate: -180, tumble: -540, size: 22, colorIndex: 1, shapeIndex: 1 },
  { xPath: [0, 30, 38, 42],    yPath: [0, -5, 10, 30],     delay: 0.3, duration: 7.0, rotate: 200,  tumble: 360,  size: 30, colorIndex: 2, shapeIndex: 0 },

  // --- Lower-right burst ---
  { xPath: [0, 20, 28, 34],    yPath: [0, 5, 18, 35],      delay: 0.12,duration: 7.5, rotate: -240, tumble: -360, size: 20, colorIndex: 0, shapeIndex: 2 },
  { xPath: [0, 16, 24, 30],    yPath: [0, 8, 22, 40],      delay: 0.4, duration: 8.0, rotate: 160,  tumble: 540,  size: 26, colorIndex: 1, shapeIndex: 1 },

  // --- Bottom burst (downward) ---
  { xPath: [0, 4, 8, 6],       yPath: [0, 12, 28, 42],     delay: 0.06,duration: 7.2, rotate: -200, tumble: -540, size: 24, colorIndex: 2, shapeIndex: 0 },
  { xPath: [0, -6, -10, -8],   yPath: [0, 15, 32, 45],     delay: 0.28,duration: 7.8, rotate: 220,  tumble: 360,  size: 18, colorIndex: 0, shapeIndex: 2 },

  // --- Lower-left burst ---
  { xPath: [0, -18, -26, -32], yPath: [0, 6, 20, 36],      delay: 0.14,duration: 8.0, rotate: -180, tumble: -360, size: 22, colorIndex: 1, shapeIndex: 0 },
  { xPath: [0, -22, -30, -36], yPath: [0, 3, 15, 32],      delay: 0.45,duration: 7.4, rotate: 240,  tumble: 540,  size: 28, colorIndex: 2, shapeIndex: 1 },

  // --- Left burst ---
  { xPath: [0, -28, -36, -40], yPath: [0, -8, 6, 24],      delay: 0.1, duration: 7.6, rotate: -260, tumble: -540, size: 20, colorIndex: 0, shapeIndex: 0 },
  { xPath: [0, -32, -40, -44], yPath: [0, -4, 8, 28],      delay: 0.32,duration: 8.4, rotate: 180,  tumble: 360,  size: 32, colorIndex: 1, shapeIndex: 2 },

  // --- Upper-left burst ---
  { xPath: [0, -20, -30, -34], yPath: [0, -22, -6, 20],    delay: 0.06,duration: 7.5, rotate: -200, tumble: -360, size: 24, colorIndex: 2, shapeIndex: 1 },
  { xPath: [0, -14, -22, -28], yPath: [0, -28, -14, 12],   delay: 0.2, duration: 8.2, rotate: 220,  tumble: 540,  size: 18, colorIndex: 0, shapeIndex: 0 },
  { xPath: [0, -24, -32, -38], yPath: [0, -18, -4, 22],    delay: 0.5, duration: 7.2, rotate: -240, tumble: -540, size: 26, colorIndex: 1, shapeIndex: 2 },

  // --- Extra scatter (second wave, longer delays) ---
  { xPath: [0, 12, 20, 26],    yPath: [0, -38, -20, 10],   delay: 0.7, duration: 8.5, rotate: 300,  tumble: 720,  size: 16, colorIndex: 2, shapeIndex: 0 },
  { xPath: [0, -10, -18, -24], yPath: [0, -42, -28, 5],    delay: 0.8, duration: 9.0, rotate: -300, tumble: -720, size: 20, colorIndex: 0, shapeIndex: 1 },
  { xPath: [0, 26, 34, 38],    yPath: [0, -15, 2, 26],     delay: 0.9, duration: 7.8, rotate: 260,  tumble: 540,  size: 14, colorIndex: 1, shapeIndex: 2 },
  { xPath: [0, -30, -38, -42], yPath: [0, -12, 4, 30],     delay: 1.0, duration: 7.5, rotate: -260, tumble: -540, size: 24, colorIndex: 2, shapeIndex: 0 },
  { xPath: [0, 2, 6, 4],       yPath: [0, -48, -35, 0],    delay: 0.6, duration: 9.5, rotate: 360,  tumble: 720,  size: 34, colorIndex: 0, shapeIndex: 1 },
  { xPath: [0, -4, -8, -6],    yPath: [0, -44, -30, 6],    delay: 1.1, duration: 9.0, rotate: -280, tumble: -720, size: 22, colorIndex: 1, shapeIndex: 0 },
  { xPath: [0, 18, 26, 30],    yPath: [0, -34, -18, 16],   delay: 1.2, duration: 8.2, rotate: 240,  tumble: 540,  size: 18, colorIndex: 2, shapeIndex: 2 },
  { xPath: [0, -16, -24, -30], yPath: [0, -36, -22, 12],   delay: 1.3, duration: 8.5, rotate: -220, tumble: -540, size: 26, colorIndex: 0, shapeIndex: 1 },
];

// --- Framer Motion Variants (outside component body) ---

const petalVariants = {
  initial: {
    opacity: 0,
    x: 0,
    y: 0,
    scale: 0,
    rotate: 0,
    rotateY: 0,
  },
  animate: (petal: PetalConfig) => ({
    opacity: [0, 1, 1, 0.8, 0],
    x: petal.xPath.map((v) => `${v}vw`),
    y: petal.yPath.map((v) => `${v}vh`),
    scale: [0, 1.1, 1, 0.95, 0.6],
    rotate: petal.rotate,
    rotateY: petal.tumble,
    transition: {
      duration: petal.duration,
      delay: petal.delay,
      ease: [0.15, 0.6, 0.4, 1] as const,
      opacity: { times: [0, 0.04, 0.6, 0.85, 1], ease: 'easeOut' as const },
      scale: { times: [0, 0.05, 0.5, 0.85, 1], ease: 'easeOut' as const },
      x: { times: [0, 0.15, 0.55, 1], ease: 'easeOut' as const },
      y: { times: [0, 0.15, 0.55, 1], ease: [0.05, 0, 0.5, 1] as const },
      rotate: { ease: 'linear' as const },
      rotateY: { ease: 'linear' as const },
    },
  }),
};

// --- Component ---

export function PetalBurst() {
  const shouldReduceMotion = useReducedMotion();

  // AC 5: Suppress entirely when prefers-reduced-motion is set
  if (shouldReduceMotion) return null;

  // perspective: 800 controls 3D depth for rotateY tumble — lower = more dramatic, 800 is subtle
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ perspective: 800 }}
      aria-hidden="true"
    >
      {PETALS.map((petal, i) => (
        <motion.div
          key={i}
          custom={petal}
          variants={petalVariants}
          initial="initial"
          animate="animate"
          className="absolute left-1/2 top-1/2"
          style={{
            width: petal.size,
            height: petal.size * 1.5,
            borderRadius: PETAL_SHAPES[petal.shapeIndex],
            backgroundColor: PETAL_COLORS[petal.colorIndex],
            transformStyle: 'preserve-3d',
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}
