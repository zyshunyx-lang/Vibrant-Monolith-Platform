
import React from 'react';

type CardVariant = 'blue' | 'orange' | 'white' | 'indigo' | 'rose';

interface ColorCardProps {
  variant?: CardVariant;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const ColorCard: React.FC<ColorCardProps> = ({
  variant = 'white',
  title,
  children,
  className = '',
  headerAction
}) => {
  const themes = {
    blue: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 text-blue-900",
    orange: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100 text-orange-900",
    indigo: "bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent text-white",
    rose: "bg-gradient-to-br from-rose-500 to-pink-600 border-transparent text-white",
    white: "bg-white border-slate-200 text-slate-900"
  };

  return (
    <div className={`rounded-3xl border shadow-sm overflow-hidden flex flex-col ${themes[variant]} ${className}`}>
      {title && (
        <div className="px-6 py-5 flex items-center justify-between border-b border-black/5">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6 flex-1">
        {children}
      </div>
    </div>
  );
};
