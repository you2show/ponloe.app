import { HugeiconsIcon } from '@hugeicons/react';
import { HorizontalResizeIcon, LayoutGridIcon, LayoutTwoColumnIcon, LayoutTwoRowIcon, SquareIcon } from '@hugeicons/core-free-icons';


import React from 'react';


export type ImageLayoutType = 'grid' | 'featured' | 'carousel' | 'list';

interface ImageLayoutSelectorProps {
  currentLayout: ImageLayoutType;
  onChange: (layout: ImageLayoutType) => void;
  disabled?: boolean;
}

export const ImageLayoutSelector: React.FC<ImageLayoutSelectorProps> = ({ currentLayout, onChange, disabled }) => {
  const layouts = [
    { id: 'grid', icon: LayoutGridIcon, label: 'Grid' },
    { id: 'featured', icon: SquareIcon, label: 'Featured' }, // Big first image
    { id: 'carousel', icon: LayoutTwoColumnIcon, label: 'Slide' },
    { id: 'list', icon: LayoutTwoRowIcon, label: 'List' },
  ];

  return (
    <div className={`flex items-center gap-2 p-1 bg-gray-100/80 rounded-lg w-fit ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {layouts.map((layout) => (
        <button
          key={layout.id}
          onClick={() => onChange(layout.id as ImageLayoutType)}
          className={`
            p-1.5 rounded-md transition-all flex items-center justify-center
            ${currentLayout === layout.id 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }
          `}
          title={layout.label}
        >
          <HugeiconsIcon icon={layout.icon} strokeWidth={1.5} className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};
