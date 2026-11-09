import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-amber-950/50 border-b border-amber-500/30 px-3 sm:px-4 py-2 text-[11px] sm:text-xs text-amber-200/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="leading-snug">
            <strong className="font-semibold text-amber-300">NASA RESEARCH PROTOTYPE:</strong>{' '}
            FIREWISE-X provides scientific decision support derived from PSI-25 BASS-II flight data. It is not a certified spacecraft suppression system and does not replace NASA-approved flight safety procedures.
          </p>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="text-amber-400/80 hover:text-amber-200 p-1 rounded-md hover:bg-amber-900/40 transition-colors shrink-0 cursor-pointer"
          title="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
