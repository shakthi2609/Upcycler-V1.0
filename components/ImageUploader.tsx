import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './icons';

interface ImageUploaderProps {
  onImagesSelect: (files: File[]) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelect, onAnalyze, isLoading }) => {
  const [filesWithPreviews, setFilesWithPreviews] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onImagesSelect(filesWithPreviews.map(fwb => fwb.file));
  }, [filesWithPreviews, onImagesSelect]);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const filesArray = Array.from(newFiles).filter(file => file.type.startsWith('image/'));
    
    filesArray.forEach(file => {
      // Prevent duplicates
      if (filesWithPreviews.some(f => f.file.name === file.name && f.file.size === file.size)) return;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilesWithPreviews(prev => [...prev, { file, url: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    if (event.target) {
        event.target.value = ""; // Allow selecting the same file again
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      handleFiles(event.dataTransfer.files);
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
    setFilesWithPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-zinc-900/80 backdrop-blur-md p-8 rounded-xl shadow-lg border border-zinc-700">
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full">
            <p className="text-center text-gray-400 mb-4">Upload one or more images of your recyclable items. The AI will find a project connecting them!</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-zinc-950/60 border-zinc-700 min-h-[120px]">
                <AnimatePresence>
                    {filesWithPreviews.map(({ url }, index) => (
                        <motion.div
                            key={url}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="relative group aspect-square"
                        >
                            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                            <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-black bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 focus:opacity-100"
                                aria-label={`Remove image ${index + 1}`}
                            >
                                <Icons.close className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="file-upload"
                />

                <label
                    htmlFor="file-upload"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="aspect-square border-2 border-dashed border-zinc-600 rounded-lg flex flex-col justify-center items-center text-center cursor-pointer hover:border-green-500 hover:bg-green-900/20 transition-colors"
                >
                    <Icons.image className="h-8 w-8 text-gray-500 mb-1" />
                    <span className="text-sm font-medium text-gray-400">Add Image</span>
                </label>
            </div>
        </div>
        
        <button
          onClick={onAnalyze}
          disabled={filesWithPreviews.length === 0 || isLoading}
          className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          {isLoading ? 'Creating Magic...' : `Get Ideas for ${filesWithPreviews.length} Image(s)`}
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
