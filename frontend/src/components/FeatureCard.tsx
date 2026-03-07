import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import useLowBandwidth from '../hooks/useLowBandwidth';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className = '',
}) => {
  const { isLowBandwidth } = useLowBandwidth();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAnimate = !isLowBandwidth && !prefersReducedMotion;

  const cardContent = (
    <GlassCard 
      className={`p-6 rounded-2xl group relative overflow-hidden ${className}`}
      hover={false}
    >
      {/* Gradient background overlay - only visible on hover - matching SchemeCard colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A18]/10 via-transparent to-[#22C55E]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#38BDF8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <article className="relative flex flex-col items-start space-y-4">
        <div className="icon-3d" aria-hidden="true">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
      </article>
    </GlassCard>
  );

  if (!shouldAnimate) {
    return cardContent;
  }

  return (
    <motion.div
      whileHover={{
        y: -4,
        boxShadow: '0 0 30px rgba(255, 122, 24, 0.3), 0 20px 40px rgba(0, 0, 0, 0.3)',
      }}
      transition={{ duration: 0.3 }}
      className="h-full"
      style={{
        // Hardware acceleration hint
        willChange: shouldAnimate ? 'transform' : 'auto',
      }}
    >
      {cardContent}
    </motion.div>
  );
};
