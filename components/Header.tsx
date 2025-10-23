import React from 'react';
import { Icons } from './icons';

interface HeaderProps {
    onEditApiKey: () => void;
}

const Header: React.FC<HeaderProps> = ({ onEditApiKey }) => {
    return (
        <header className="bg-zinc-900/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-zinc-700/80">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5V4H4zm0 12h5v5H4v-5zm12 0h5v5h-5v-5zM9 9l6-6m-6 12l6-6" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-50 tracking-tight">Upcycle AI</h1>
                </div>
                <button
                    onClick={onEditApiKey}
                    className="p-2 text-gray-300 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-green-500"
                    aria-label="Edit API Key"
                >
                    <Icons.pencil className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default Header;
