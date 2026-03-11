import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { SpecialInputProps } from './types';

export const CameraView: React.FC<SpecialInputProps> = ({ onCancel }) => {
    return (
        <div className="bg-black rounded-xl overflow-hidden mb-4 relative aspect-video flex items-center justify-center animate-in fade-in zoom-in-95">
            <p className="text-white/50 text-sm">Camera Preview Placeholder</p>
            <button onClick={onCancel} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"><HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} className="w-4 h-4"/></button>
            <div className="absolute bottom-4 flex gap-4">
                <button className="w-12 h-12 rounded-full border-4 border-white bg-transparent hover:bg-white/20"></button>
            </div>
        </div>
    );
};
