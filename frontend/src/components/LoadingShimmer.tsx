import React from 'react';

interface LoadingShimmerProps {
  width?: string;
  height?: string;
  shape?: 'rectangle' | 'circle' | 'rounded';
  className?: string;
}

export const LoadingShimmer: React.FC<LoadingShimmerProps> = ({
  width = 'w-full',
  height = 'h-4',
  shape = 'rounded',
  className = '',
}) => {
  const shapeClass = {
    rectangle: '',
    circle: 'rounded-full',
    rounded: 'rounded-lg',
  }[shape];

  return (
    <div
      className={`
        ${width} ${height} ${shapeClass}
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
        dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
        bg-[length:1000px_100%]
        animate-shimmer
        ${className}
      `}
    />
  );
};
