import React from 'react';
import { ImageIcon } from './icons';

interface ImagePlaceholderProps {
  isLoading?: boolean;
  error?: string;
  onGenerateClick?: (e: React.MouseEvent) => void;
}

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ isLoading, error, onGenerateClick }) => {
  return (
    <div className="w-full h-48 bg-gray-100 flex flex-col justify-center items-center text-center p-4">
      {isLoading ? (
        <>
          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-green-600 mb-2"></div>
          <span className="text-sm font-semibold text-gray-600">Generating Image...</span>
        </>
      ) : error ? (
        <div className="text-red-500">
            <ExclamationCircleIcon className="w-8 h-8 mx-auto mb-2" />
            <span className="text-xs font-semibold block">Image failed</span>
            <span className="text-xs text-red-400 block max-w-full truncate">{error}</span>
        </div>
      ) : (
        <>
            <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
            <button
                onClick={onGenerateClick}
                className="mt-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
                Generate Image
            </button>
        </>
      )}
    </div>
  );
};

export default ImagePlaceholder;