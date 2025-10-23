import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './icons';

interface LoadingIndicatorProps {
  steps: string[];
  currentStep: number;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-zinc-900/80 backdrop-blur-md p-8 rounded-xl shadow-lg border border-zinc-700">
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-xl font-bold text-gray-100">Working on it...</h3>
        <div className="w-full space-y-3 pt-4">
          {steps.map((step, index) => {
            const status = index < currentStep ? 'completed' : index === currentStep ? 'in-progress' : 'pending';
            
            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {status === 'completed' && (
                      <motion.div
                        key="completed"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Icons.check className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                    {status === 'in-progress' && (
                      <motion.div
                        key="in-progress"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                         <Icons.spinner className="w-5 h-5 text-green-400 animate-spin" />
                      </motion.div>
                    )}
                    {status === 'pending' && (
                       <motion.div
                          key="pending"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Icons.circle className="w-5 h-5 text-gray-600" />
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className={`transition-colors ${status === 'pending' ? 'text-gray-500' : 'text-gray-200'}`}>
                  {step}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
