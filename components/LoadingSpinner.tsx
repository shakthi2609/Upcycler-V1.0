
import React from 'react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center space-y-4 my-8">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-600"></div>
    <p className="text-lg text-gray-700">Upcycling ideas coming your way...</p>
  </div>
);

export default LoadingSpinner;
