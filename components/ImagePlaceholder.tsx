import React from 'react';
import { ImageIcon } from './icons';

interface ImagePlaceholderProps {
  isLoading?: boolean;
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({ isLoading = false }) => (
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

export default ImagePlaceholder;
