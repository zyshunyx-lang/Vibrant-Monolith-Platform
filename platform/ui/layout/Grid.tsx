
import React from 'react';

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: number;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({ children, cols = 3, gap = 6, className = '' }) => {
  const gridCols: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
  };

  const colsClass = gridCols[cols] || gridCols[3];
  // Note: Tailwind dynamic classes like gap-${gap} may not work with the CDN if not explicitly used elsewhere.
  // Using a safe fallback or common gaps.
  const gapClass = gap === 6 ? 'gap-6' : `gap-${gap}`;

  return (
    <div className={`grid ${colsClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
};
