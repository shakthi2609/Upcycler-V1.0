import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isModel ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div
        className={`max-w-xl px-4 py-3 rounded-2xl ${
          isModel ? 'bg-zinc-700 text-gray-200 rounded-bl-none' : 'bg-green-600 text-white rounded-br-none'
        }`}
      >
        <div className="prose prose-sm prose-invert max-w-none text-left">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
