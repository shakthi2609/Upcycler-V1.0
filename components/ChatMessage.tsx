import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-xl px-4 py-3 rounded-2xl ${
          isModel ? 'bg-gray-200 text-gray-800 rounded-bl-none' : 'bg-green-600 text-white rounded-br-none'
        }`}
      >
        <div className="prose prose-sm max-w-none text-left">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;