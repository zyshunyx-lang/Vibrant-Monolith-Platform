
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
      <input
        className={`
          px-4 py-2.5 rounded-xl border border-slate-200 bg-white
          focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500
          transition-all duration-200 placeholder:text-slate-400
          ${error ? 'border-rose-300 ring-rose-500/10' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs font-medium text-rose-500 ml-1">{error}</span>}
    </div>
  );
};
