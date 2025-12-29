import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'glass' | 'outline';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = "", 
  title, 
  subtitle, 
  headerAction,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass': return 'glass shadow-2xl';
      case 'outline': return 'bg-transparent border-2 border-slate-100 shadow-none';
      default: return 'bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]';
    }
  };

  return (
    <div className={`rounded-[2.5rem] overflow-hidden transition-all duration-300 ${getVariantStyles()} ${className}`}>
      {(title || subtitle) && (
        <div className="px-8 py-6 border-b border-slate-50/50 flex items-center justify-between">
          <div className="space-y-0.5">
            {title && <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>}
          </div>
          {headerAction && <div className="animate-in">{headerAction}</div>}
        </div>
      )}
      <div className="p-8">
        {children}
      </div>
    </div>
  );
};