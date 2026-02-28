"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const formulas = [
  { formula: 'f(x) = σ(Wx + b)', delay: 0, x: 15, y: 20 },
  { formula: '∇θ J(θ)', delay: 0.5, x: 80, y: 15 },
  { formula: 'P(A|B) = P(B|A)P(A)/P(B)', delay: 1, x: 25, y: 60 },
  { formula: 'y = wx + b', delay: 1.5, x: 70, y: 50 },
  { formula: 'L = -log(P(y|θ))', delay: 2, x: 10, y: 80 },
  { formula: 'H(x) = -Σ p(x)log(p(x))', delay: 2.5, x: 85, y: 75 },
  { formula: 'f(x) = max(0, x)', delay: 3, x: 50, y: 30 },
  { formula: 'θ = θ - α∇θ', delay: 3.5, x: 30, y: 45 },
  { formula: 'E[Y|X] = ∫ y·P(y|X)dy', delay: 4, x: 60, y: 70 },
  { formula: 'σ(z) = 1/(1+e⁻ᶻ)', delay: 4.5, x: 20, y: 35 },
  { formula: 'KL(P||Q) = Σ P(x)log(P(x)/Q(x))', delay: 5, x: 75, y: 40 },
  { formula: '∇·F = ∂Fx/∂x + ∂Fy/∂y', delay: 5.5, x: 45, y: 85 },
];

export default function MathFormulas() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    setMounted(true);
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    >
      {formulas.map((item, index) => {
        const baseX = (dimensions.width * item.x) / 100;
        const baseY = (dimensions.height * item.y) / 100;
        const driftX = (Math.random() - 0.5) * 200;
        const driftY = (Math.random() - 0.5) * 200;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: baseX, y: baseY, scale: 0.8 }}
            animate={{
              opacity: [0.7, 0.95, 0.7],
              x: [baseX, baseX + driftX, baseX + driftX * 0.5, baseX],
              y: [baseY, baseY + driftY, baseY + driftY * 0.5, baseY],
              rotateX: [0, 360],
              rotateY: [0, 360],
              rotateZ: [0, 180],
              scale: [1.0, 1.3, 1.1, 1.0],
            }}
            transition={{
              duration: 25 + Math.random() * 15,
              repeat: Infinity,
              delay: item.delay,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              fontFamily: "'Courier New', Monaco, Consolas, monospace",
              fontSize: 'clamp(0.9rem, 1.8vw, 1.5rem)',
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              transformStyle: 'preserve-3d',
              perspective: '1000px',
              textShadow:
                '0 0 15px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4), 0 0 45px rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.8)',
              userSelect: 'none',
              willChange: 'transform, opacity',
            }}
          >
            {item.formula}
          </motion.div>
        );
      })}
    </div>
  );
}
