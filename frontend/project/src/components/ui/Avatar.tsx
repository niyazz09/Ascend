import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

  return (
    <div
      className={`rounded-full bg-gradient-to-tr from-accent-600 via-accent-500 to-sky-400 text-white font-bold flex items-center justify-center shadow-md select-none shrink-0 border border-white/20 ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
