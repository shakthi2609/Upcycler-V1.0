
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { ProjectIdea, ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';
import { PaperAirplaneIcon } from './icons';

interface ProjectChatProps {
    project: ProjectIdea;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ project }) => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const systemInstruction = `You are a helpful DIY assistant. You are advising on the project named "${project.project_name}".
        Project Description: "${project.description}".
        Materials Needed: ${project.materials_used.join(', ')}.
        Step-by-step guide: ${project.step_by_step_guide.map((s, i) => `Step ${i+1}: ${s}`).join(' ')}
        Answer any questions the user has about this specific project. Be encouraging and provide clear, actionable advice. Use markdown for formatting.`;

        const initChat = () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-pro',
                    config: { systemInstruction },
                });
                setMessages([{ role: 'model', text: `I see you're looking at the "${project.project_name}" project. What questions do you have?` }]);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to initialize chat.');
            }
        };
        initChat();
    }, [project]);

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
    
    return (
        <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Chat about this Project</h3>
            <div className="border rounded-lg flex flex-col h-96 bg-gray-50">
                 <div className="flex-1 p-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="max-w-xl px-4 py-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                     )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-2 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="e.g., Can I use a different material?"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !userInput.trim()}
                            className="bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
             {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

export default ProjectChat;
