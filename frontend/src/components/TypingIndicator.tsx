import React from 'react';

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce-dot"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce-dot"
        style={{ animationDelay: '0.2s' }}
      />
      <div
        className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce-dot"
        style={{ animationDelay: '0.4s' }}
      />
    </div>
  );
};
