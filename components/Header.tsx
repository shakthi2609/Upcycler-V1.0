import React from 'react';
import { PencilIcon } from './icons';

interface HeaderProps {
    onEditApiKey: () => void;
}

const Header: React.FC<HeaderProps> = ({ onEditApiKey }) => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l2.387-.477a2 2 0 01.547-1.806z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Upcycle AI <span className="text-green-600 font-semibold">v2</span></h1>
                </div>
                <button
                    onClick={onEditApiKey}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    aria-label="Edit API Key"
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default Header;
