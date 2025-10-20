import React from 'react';
import { ImageIcon } from './icons';

interface ImagePlaceholderProps {
  isLoading?: boolean;
  error?: string;
}

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ isLoading = false, error }) => {
  if (error) {
    return (
        <div className="relative w-full h-48 bg-red-100 flex flex-col items-center justify-center overflow-hidden text-red-700 p-4 text-center">
            <ExclamationCircleIcon className="w-10 h-10 mb-2" />
            <span className="text-sm font-semibold">Image Failed</span>
            <span className="text-xs mt-1">{error.includes('SAFETY') ? "Blocked by safety filter" : "Could not generate"}</span>
        </div>
    );
  }
  
  return (
    <div className="relative w-full h-48 bg-gray-200 flex flex-col items-center justify-center overflow-hidden text-gray-500">
      {isLoading ? (
        <>
          <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
          <div className="relative z-10 flex flex-col items-center">
              <ImageIcon className="w-10 h-10 mb-2 animate-bounce" />
              <span className="text-sm font-medium">Generating Image...</span>
          </div>
        </>
      ) : (
        <ImageIcon className="w-12 h-12 text-gray-400" />
      )}
    </div>
  );
};

export default ImagePlaceholder;