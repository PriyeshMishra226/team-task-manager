import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    default: 'bg-surface-100 text-surface-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    brand: 'bg-brand-100 text-brand-700',
    
    // Status badges
    todo: 'bg-surface-100 text-surface-600',
    in_progress: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    
    // Priority badges
    low: 'bg-green-50 text-green-600',
    medium: 'bg-amber-50 text-amber-600',
    high: 'bg-red-50 text-red-600',
  };

  const getVariant = () => variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${getVariant()} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
