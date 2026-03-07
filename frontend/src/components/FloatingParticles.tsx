import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import useLowBandwidth from '@/hooks/useLowBandwidth';

/**
 * FloatingParticles Component
 * 
 * Creates a futuristic atmosphere with randomly positioned and animated particles.
 * Validates Requirements 1.4, 8.5
 */

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  opacity: number;
  delay: number;
  duration: number;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({ 
  count = 20, // Reduced from 25 to 20 for better performance
  className = '' 
}) => {
  const { isLowBandwidth } = useLowBandwidth();
  
  // Check for user's reduced motion preference
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const shouldAnimate = !isLowBandwidth && !prefersReducedMotion;

  // Generate random particles with memoization to prevent regeneration on re-renders
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 2 + 2, // 2-4px
      x: Math.random() * 100, // 0-100%
      y: Math.random() * 100, // 0-100%
      opacity: Math.random() * 0.3 + 0.3, // 0.3-0.6
      delay: Math.random() * 5, // 0-5s delay
      duration: Math.random() * 4 + 6, // 6-10s duration
    }));
  }, [count]);

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      data-testid="floating-particles"
    >
      {particles.map((particle) => (
        shouldAnimate ? (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
              // Hardware acceleration hint
              willChange: 'transform, opacity',
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: particle.delay,
            }}
            data-testid="animated-particle"
          />
        ) : (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: particle.opacity,
            }}
            data-testid="static-particle"
          />
        )
      ))}
    </div>
  );
};

export default FloatingParticles;
