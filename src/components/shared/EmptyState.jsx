import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
          <Icon size={24} className="text-brand-400" />
        </div>
      )}
      <h3 className="font-semibold text-slate-200 mb-2">{title}</h3>
      {description && <p className="text-slate-500 text-sm mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
