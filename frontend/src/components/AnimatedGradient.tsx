import React from 'react';

interface AnimatedGradientProps {
  className?: string;
}

export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ className = '' }) => {
  return (
    <div
      className={`
        absolute inset-0 -z-10
        bg-gradient-to-br from-saffron via-white to-green
        bg-[length:200%_200%]
        animate-gradient
        ${className}
      `}
    />
  );
};
