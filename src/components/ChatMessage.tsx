import React from 'react';
import { Brain, User } from 'lucide-react';

interface ChatMessageProps {
  isBot: boolean;
  message: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ isBot, message }) => {
  return (
    <div className={`flex items-start space-x-3 ${isBot ? 'bg-blue-50' : 'bg-white'} p-4 rounded-lg`}>
      <div className={`p-2 rounded-full ${isBot ? 'bg-blue-200' : 'bg-purple-200'}`}>
        {isBot ? <Brain size={24} className="text-blue-700" /> : <User size={24} className="text-purple-700" />}
      </div>
      <div className="flex-1">
        <p className={`text-lg ${isBot ? 'text-blue-800' : 'text-purple-800'}`}>
          {isBot ? 'Math Buddy' : 'Student'}
        </p>
        <p className="text-gray-700 mt-1">{message}</p>
      </div>
    </div>
  );
};