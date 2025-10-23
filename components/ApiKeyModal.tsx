import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
  onClose?: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose }) => {
  const [key, setKey] = useState('');
  const isEditMode = !!onClose;

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
      if (onClose) {
          onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-zinc-900/80 backdrop-blur-md rounded-lg shadow-2xl max-w-md w-full p-8 text-center border border-zinc-700"
      >
        <h2 className="text-2xl font-bold text-gray-100 mb-4">
            {isEditMode ? 'Update API Key' : 'Enter Gemini API Key'}
        </h2>
        <p className="text-gray-400 mb-6">
          {isEditMode 
            ? 'Enter a new API key below. The existing key will be overwritten.'
            : "To use Upcycle AI, please provide your Google AI Gemini API key. Your key will be stored in your browser's local storage."
          }
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your API key here"
          className="w-full px-4 py-2 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-zinc-800 text-gray-200 mb-6"
        />
        <div className={`flex ${isEditMode ? 'space-x-4' : ''}`}>
            {isEditMode && (
                <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-zinc-700 text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors"
                >
                    Cancel
                </button>
            )}
            <button
              onClick={handleSave}
              disabled={!key.trim()}
              className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors"
            >
              {isEditMode ? 'Save Changes' : 'Save and Start Upcycling'}
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ApiKeyModal;
