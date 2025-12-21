
import React from 'react';

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: number;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({ children, cols = 3, gap = 6, className = '' }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
  };

  const gapStyles = `gap-${gap}`;

  return (
    <div className={`grid ${gridCols[cols]} ${gapStyles} ${className}`}>
      {children}
    </div>
  );
};
