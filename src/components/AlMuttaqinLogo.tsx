import React from 'react';

interface AlMuttaqinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  alt?: string;
}

export const AlMuttaqinLogo: React.FC<AlMuttaqinLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'Logo Pondok Pesantren Al Muttaqin',
}) => {
  let sizeClasses = 'w-10 h-10';

  if (size === 'sm') sizeClasses = 'w-7 h-7';
  if (size === 'md') sizeClasses = 'w-10 h-10';
  if (size === 'lg') sizeClasses = 'w-16 h-16';
  if (size === 'xl') sizeClasses = 'w-24 h-24';
  if (size === 'custom') sizeClasses = '';

  return (
    <img
      src="/logo-al-muttaqin.svg"
      alt={alt}
      className={`object-contain select-none shrink-0 drop-shadow-xs ${sizeClasses} ${className}`}
      loading="eager"
    />
  );
};
