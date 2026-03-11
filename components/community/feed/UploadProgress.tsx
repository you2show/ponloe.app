import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Video01Icon, Image01Icon, Tick02Icon } from '@hugeicons/core-free-icons';

interface UploadProgressProps {
  progress: number;
  type: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ progress, type }) => {
  const isComplete = progress === 100;
  const isVideo = type === 'វីដេអូ';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          {isComplete ? (
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="w-5 h-5" />
          ) : isVideo ? (
            <HugeiconsIcon icon={Video01Icon} strokeWidth={1.5} className="w-5 h-5 animate-pulse" />
          ) : (
            <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} className="w-5 h-5 animate-pulse" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-bold text-sm text-gray-900 font-khmer">
              {isComplete ? `បង្ហោះ${type}ជោគជ័យ` : `កំពុងបង្ហោះ${type}...`}
            </h4>
            <span className="text-xs font-bold text-gray-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      {!isComplete && isVideo && (
        <p className="text-xs text-gray-500 text-center font-khmer">
          សូមរង់ចាំបន្តិច វីដេអូកំពុងត្រូវបានបញ្ជូនទៅកាន់ម៉ាស៊ីនមេ...
        </p>
      )}
    </div>
  );
};
