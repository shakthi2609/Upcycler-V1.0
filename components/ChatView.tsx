



import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';
import { Icons } from './icons';

const ChatView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = () => {
            try {
                const apiKey = JSON.parse(localStorage.getItem('gemini-api-key') || 'null');
                 if (!apiKey) {
                    setError('Gemini API key not found. Please set it on the home page via the pencil icon.');
                    return;
                }
                const ai = new GoogleGenAI({ apiKey });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-pro',
                    config: {
                        systemInstruction: 'You are Upcycle AI, a friendly and creative assistant who helps people with upcycling, recycling, and DIY projects. Keep your answers concise and helpful. Use markdown for formatting when appropriate.',
                    },
                });
                setMessages([{ role: 'model', text: 'Hello! How can I help you with your upcycling projects today?' }]);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to initialize chat.');
            }
        };
        initChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chatRef.current) return;

        const newUserMessage: ChatMessageType = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await chatRef.current.sendMessageStream({ message: currentInput });
            
            let text = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of response) {
                text += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = text;
                    return newMessages;
                });
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            setMessages(prev => [...prev, { role: 'model', text: `Sorry, I ran into an error: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (error && messages.length === 0) {
        return <div className="text-center p-8 bg-red-900/40 text-red-300 rounded-lg">{error}</div>
    }

    return (
        <div className="flex flex-col h-[calc(100vh-250px)] max-w-3xl mx-auto bg-zinc-900/80 backdrop-blur-md shadow-lg rounded-lg border border-zinc-700">
            <div className="flex-1 p-6 overflow-y-auto">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="max-w-xl px-4 py-3 rounded-2xl bg-zinc-700 text-gray-200 rounded-bl-none">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
             <div className="p-4 border-t border-zinc-700">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask anything about upcycling..."
                        className="flex-1 px-4 py-2 border border-zinc-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-zinc-800 text-gray-200"
                        disabled={isLoading || !!error}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim() || !!error}
                        className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                    >
                        <Icons.paperAirplane className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatView;