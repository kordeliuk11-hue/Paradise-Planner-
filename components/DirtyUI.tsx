import React from 'react';

export const GrittyButton: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'neutral';
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, variant = 'primary', className = '', disabled }) => {
  const colors = {
    primary: 'bg-postal-rust text-white border-black hover:bg-orange-900',
    danger: 'bg-postal-alert text-white border-black hover:bg-red-900',
    neutral: 'bg-stone-600 text-stone-200 border-stone-800 hover:bg-stone-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${colors[variant]} 
        font-impact uppercase tracking-widest px-4 py-2 
        border-4 border-double shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
        active:translate-x-1 active:translate-y-1 active:shadow-none 
        transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export const DirtyCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-stone-200 border-4 border-stone-800 p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative ${className}`}>
    <div className="absolute top-0 right-0 p-1 opacity-20 pointer-events-none">
       <svg width="40" height="40" viewBox="0 0 100 100">
         <path d="M10,10 Q50,50 90,10 T90,90 T10,90" fill="none" stroke="black" strokeWidth="5" />
       </svg>
    </div>
    {children}
  </div>
);

export const PaperSheet: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`paper-texture border border-stone-400 p-6 shadow-md rotate-1 min-h-[300px] text-stone-900 font-dirty text-lg leading-6 ${className}`}>
    {children}
  </div>
);