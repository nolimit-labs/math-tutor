import React, { useState } from 'react';
import { Send, BookOpen } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onQuizStart: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onQuizStart, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask me any math question!"
        className="flex-1 p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none text-lg"
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={onQuizStart}
        className="p-4 bg-blue-100 text-blue-500 rounded-xl hover:bg-blue-200 transition-colors"
      >
        <BookOpen size={24} />
      </button>
      <button
        type="submit"
        disabled={isLoading || !message.trim()}
        className="p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
      >
        <Send size={24} />
      </button>
    </form>
  );
};