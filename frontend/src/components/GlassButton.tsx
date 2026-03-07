import React, { useState } from 'react';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  variant = 'secondary',
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Trigger click on Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) {
        onClick?.();
      }
    }
  };

  // Base styles shared by both variants
  const baseStyles = `
    relative overflow-hidden
    rounded-xl px-6 py-3
    font-medium text-white
    transition-all duration-300
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500
  `;

  // Variant-specific styles
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-[#FF7A18] via-[#22C55E] to-[#38BDF8]
      border border-white/20
      shadow-[0_0_20px_rgba(255,122,24,0.4)]
      ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:scale-105 hover:shadow-[0_0_40px_rgba(255,122,24,0.6)]'
      }
    `,
    secondary: `
      backdrop-blur-lg bg-white/10 dark:bg-white/5
      border border-white/20 dark:border-white/10
      ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-white/20 dark:hover:bg-white/10 hover:scale-105 hover:shadow-lg'
      }
    `,
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
          aria-hidden="true"
        />
      ))}
    </button>
  );
};
