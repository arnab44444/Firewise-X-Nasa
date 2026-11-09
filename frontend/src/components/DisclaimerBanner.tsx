import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="w-full bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200/90 flex items-center justify-between backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center space-x-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="leading-tight">
          <strong className="font-semibold text-amber-300">NASA RESEARCH PROTOTYPE:</strong>{' '}
          FIREWISE-X provides scientific decision support derived from PSI-25 BASS-II data. It is not a certified spacecraft suppression system and does not replace NASA-approved emergency flight safety procedures.
        </p>
      </div>
      <button 
        onClick={() => setDismissed(true)}
        className="text-amber-400/70 hover:text-amber-300 p-1 rounded transition-colors ml-2"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
