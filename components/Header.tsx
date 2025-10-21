
import React from 'react';
import { PencilIcon } from './icons';

interface HeaderProps {
    currentView: 'home' | 'saved' | 'chat';
    setCurrentView: (view: 'home' | 'saved' | 'chat') => void;
    savedProjectsCount: number;
    onEditApiKey: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, savedProjectsCount, onEditApiKey }) => {
  
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500";
    const activeClasses = "bg-green-600 text-white";
    const inactiveClasses = "bg-white text-gray-700 hover:bg-gray-100";

    return (
        <header className="bg-white shadow-md sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l-2.387-.477a2 2 0 01-.547-1.806l.477-2.387a6 6 0 013.86-.517l.318.158a6 6 0 003.86-.517l2.387.477a2 2 0 011.806.547a2 2 0 01.547 1.806l-.477 2.387a6 6 0 01-3.86.517l-.318-.158a6 6 0 00-3.86.517l-2.387-.477a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 003.86.517l.318.158a6 6 0 003.86.517l2.387-.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86z" />
                    </svg>
                    <h1 className="text-2xl font-bold text-gray-800">Upcycle AI</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <nav className="bg-gray-200 p-1 rounded-lg flex space-x-1">
                        <button onClick={() => setCurrentView('home')} className={`${baseClasses} ${currentView === 'home' ? activeClasses : inactiveClasses}`}>
                            Home
                        </button>
                        <button onClick={() => setCurrentView('chat')} className={`${baseClasses} ${currentView === 'chat' ? activeClasses : inactiveClasses}`}>
                            Chat
                        </button>
                        <button onClick={() => setCurrentView('saved')} className={`${baseClasses} ${currentView === 'saved' ? activeClasses : inactiveClasses} relative`}>
                            My Projects
                            {savedProjectsCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {savedProjectsCount}
                                </span>
                            )}
                        </button>
                    </nav>
                     <button
                        onClick={onEditApiKey}
                        className="ml-2 p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        aria-label="Edit API Key"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
