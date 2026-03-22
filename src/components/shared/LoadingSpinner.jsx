import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-2 border-brand-500 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );
}

export function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}
