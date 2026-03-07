import React from 'react';
import { motion } from 'framer-motion';
import useLowBandwidth from '@/hooks/useLowBandwidth';

/**
 * GradientMesh Component
 * 
 * Creates animated glowing gradient overlays for the premium landing page background.
 * Features multiple overlapping gradient circles with slow continuous movement and heavy blur.
 * 
 * @param className - Optional additional CSS classes
 */

interface GradientMeshProps {
  className?: string;
}

const GradientMesh: React.FC<GradientMeshProps> = ({ className = '' }) => {
  const { isLowBandwidth } = useLowBandwidth();
  
  // Check for user's reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Disable animations if low bandwidth mode is enabled or user prefers reduced motion
  const shouldAnimate = !isLowBandwidth && !prefersReducedMotion;

  // Animation configuration for gradient mesh movement
  const meshAnimation = shouldAnimate ? {
    animate: {
      x: [0, 100, 0],
      y: [0, 50, 0],
    },
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  } : {};

  return (
    <div 
      className={`absolute inset-0 overflow-hidden ${className}`}
      data-testid="gradient-mesh"
    >
      {/* Saffron gradient circle */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, #FF7A18 0%, transparent 70%)',
          filter: 'blur(60px)',
          top: '10%',
          left: '10%',
          // Hardware acceleration hint
          willChange: shouldAnimate ? 'transform' : 'auto',
        }}
        {...meshAnimation}
        aria-hidden="true"
      />

      {/* Green gradient circle */}
      <motion.div
        className="absolute w-[32rem] h-[32rem] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, #22C55E 0%, transparent 70%)',
          filter: 'blur(60px)',
          top: '40%',
          right: '15%',
          willChange: shouldAnimate ? 'transform' : 'auto',
        }}
        {...(shouldAnimate ? {
          animate: {
            x: [0, -80, 0],
            y: [0, 60, 0],
          },
          transition: {
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        } : {})}
        aria-hidden="true"
      />

      {/* Blue gradient circle */}
      <motion.div
        className="absolute w-[28rem] h-[28rem] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, #38BDF8 0%, transparent 70%)',
          filter: 'blur(60px)',
          bottom: '15%',
          left: '30%',
          willChange: shouldAnimate ? 'transform' : 'auto',
        }}
        {...(shouldAnimate ? {
          animate: {
            x: [0, 60, 0],
            y: [0, -40, 0],
          },
          transition: {
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        } : {})}
        aria-hidden="true"
      />

      {/* Additional saffron accent */}
      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #FF7A18 0%, transparent 70%)',
          filter: 'blur(60px)',
          bottom: '25%',
          right: '25%',
          willChange: shouldAnimate ? 'transform' : 'auto',
        }}
        {...(shouldAnimate ? {
          animate: {
            x: [0, -50, 0],
            y: [0, 50, 0],
          },
          transition: {
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        } : {})}
        aria-hidden="true"
      />
    </div>
  );
};

export default GradientMesh;
