import React from 'react';
import { motion } from 'framer-motion';
import useLowBandwidth from '@/hooks/useLowBandwidth';

interface AIOrbProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AIOrb: React.FC<AIOrbProps> = ({ className = '', size = 'lg' }) => {
  const { isLowBandwidth } = useLowBandwidth();

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  // Check for user's reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Disable animations in low bandwidth mode or if user prefers reduced motion
  const shouldAnimate = !isLowBandwidth && !prefersReducedMotion;

  // Limit concurrent animations: reduce particles from 12 to 6 for better performance
  const particleCount = 6;

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className}`}
      initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
      animate={shouldAnimate ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      data-testid="ai-orb"
      style={{
        // Use will-change for hardware acceleration hint
        willChange: shouldAnimate ? 'transform, opacity' : 'auto',
      }}
    >
      {/* Main orb with premium gradient, rotation, and floating motion */}
      <motion.div
        className={`
          w-full h-full rounded-full
          bg-gradient-to-br from-accent-saffron via-accent-green to-accent-blue
          shadow-2xl
        `}
        style={{
          boxShadow: shouldAnimate
            ? '0 0 40px rgba(255, 122, 24, 0.6), 0 0 80px rgba(34, 197, 94, 0.4), 0 0 120px rgba(56, 189, 248, 0.3)'
            : '0 0 20px rgba(255, 122, 24, 0.4)',
          // Hardware-accelerated properties only
          willChange: shouldAnimate ? 'transform' : 'auto',
        }}
        animate={
          shouldAnimate
            ? {
                rotate: 360,
                y: [-30, 30, -30],
              }
            : {}
        }
        transition={
          shouldAnimate
            ? {
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                },
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }
            : {}
        }
      >
        {/* Inner glow layer with pulsing effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"
          animate={
            shouldAnimate
              ? {
                  opacity: [0.3, 0.6, 0.3],
                }
              : {}
          }
          transition={
            shouldAnimate
              ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : {}
          }
          style={{
            willChange: shouldAnimate ? 'opacity' : 'auto',
          }}
        />

        {/* Secondary gradient layer for depth */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tl from-accent-blue/40 via-transparent to-accent-saffron/40" />

        {/* Particle emission effects - reduced from 12 to 6 particles for performance */}
        {shouldAnimate && (
          <>
            {[...Array(particleCount)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  background:
                    i % 3 === 0
                      ? 'rgba(255, 122, 24, 0.8)'
                      : i % 3 === 1
                      ? 'rgba(34, 197, 94, 0.8)'
                      : 'rgba(56, 189, 248, 0.8)',
                  // Hardware acceleration hint
                  willChange: 'transform, opacity',
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI) / 3) * 120],
                  y: [0, Math.sin((i * Math.PI) / 3) * 120],
                  opacity: [0.8, 0],
                  scale: [1, 0.5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Outer glow rings - reduced from 3 to 2 for performance */}
      {shouldAnimate && (
        <>
          {/* Primary glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderColor: 'rgba(255, 122, 24, 0.3)',
              willChange: 'transform, opacity',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Secondary glow ring with offset timing */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderColor: 'rgba(34, 197, 94, 0.3)',
              willChange: 'transform, opacity',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.25,
            }}
          />
        </>
      )}
    </motion.div>
  );
};
