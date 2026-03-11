import React from 'react';

interface GlobalProgressBarProps {
  progress: number;
  visible: boolean;
}

export const GlobalProgressBar: React.FC<GlobalProgressBarProps> = ({ progress, visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100]">
      <div 
        className="h-full bg-emerald-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
