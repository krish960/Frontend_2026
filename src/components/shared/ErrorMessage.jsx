import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message = 'Something went wrong.' }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      <AlertCircle size={16} className="flex-shrink-0" />
      {message}
    </div>
  );
}
