import React from 'react';
import GradientMesh from './GradientMesh';
import FloatingParticles from './FloatingParticles';

/**
 * AnimatedBackground Component
 * 
 * Combines dark gradient base, gradient mesh, and floating particles to create
 * the complete animated background for the premium landing page.
 * 
 * Validates Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 * 
 * @param className - Optional additional CSS classes
 */

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className = '' }) => {
  return (
    <div 
      className={`fixed inset-0 -z-10 ${className}`}
      data-testid="animated-background"
    >
      {/* Dark gradient base layer */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #020617 0%, #0F172A 50%, #1E293B 100%)',
        }}
        aria-hidden="true"
      />

      {/* Gradient mesh overlay */}
      <GradientMesh />

      {/* Floating particles top layer - reduced count for performance */}
      <FloatingParticles count={20} />
    </div>
  );
};

export default AnimatedBackground;
