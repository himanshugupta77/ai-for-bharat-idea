import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hover = true,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        backdrop-blur-lg bg-white/10 dark:bg-white/5
        border border-white/20 dark:border-white/10
        rounded-2xl shadow-lg
        transition-all duration-300
        ${hover ? 'hover:transform hover:-translate-y-1 hover:shadow-2xl' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
