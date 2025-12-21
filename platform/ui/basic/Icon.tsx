
import React from 'react';
import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

interface IconProps {
  name: IconName;
  size?: number | string;
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = 'currentColor', className = '' }) => {
  const LucideIcon = (LucideIcons as any)[name];
  
  if (!LucideIcon) {
    // Fix: Wrap 'name' in String() to avoid implicit conversion error if 'name' is a symbol
    console.warn(`Icon "${String(name)}" not found in lucide-react`);
    return null;
  }

  return <LucideIcon size={size} color={color} className={className} />;
};
