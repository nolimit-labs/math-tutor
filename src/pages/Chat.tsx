import React, { useState } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ChatMessage } from '../components/ChatMessage';
import { Brain, LogOut, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface GradeMessages {
  [grade: number]: Message[];
}

export const Chat: React.FC = () => {
  const [gradeMessages, setGradeMessages] = useState<GradeMessages>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const handleGradeSelect = (grade: number) => {
    setSelectedGrade(grade);
    if (!gradeMessages[grade]) {
      setGradeMessages(prev => ({
        ...prev,
        [grade]: [{
          role: 'assistant',
          content: `Hi! I'm your Grade ${grade} math teacher. Would you like to start today's lesson? Just let me know when you're ready!`
        }]
      }));
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedGrade) return;
    
    setIsLoading(true);
    const currentMessages = gradeMessages[selectedGrade] || [];
    const newMessages = [...currentMessages, { role: 'user' as const, content: message }];
    
    setGradeMessages(prev => ({
      ...prev,
      [selectedGrade]: newMessages
    }));

    try {
      const isFirstResponse = currentMessages.length === 1 && currentMessages[0].role === 'assistant';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          messages: newMessages,
          grade: selectedGrade,
          isFirstResponse
        })
      });

      const data = await response.json();
      setGradeMessages(prev => ({
        ...prev,
        [selectedGrade]: [...newMessages, { role: 'assistant' as const, content: data.content }]
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMessages = selectedGrade ? gradeMessages[selectedGrade] || [] : [];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-500" size={24} />
            <h1 className="text-xl font-bold text-blue-800">Math Buddy</h1>
          </div>
        </div>
        
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Grade Level</h2>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((grade) => (
              <button
                key={grade}
                onClick={() => handleGradeSelect(grade)}
                className={`w-full px-4 py-2 rounded-lg text-left transition-colors
                  ${selectedGrade === grade 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-blue-50'}`}
              >
                Grade {grade}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto">
            {currentMessages.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="mx-auto text-blue-300" size={64} />
                <h2 className="mt-6 text-2xl font-semibold text-gray-700">
                  Select a Grade Level to Begin
                </h2>
                <p className="mt-2 text-gray-600">
                  Choose your grade from the sidebar to start learning math!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentMessages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    isBot={message.role === 'assistant'}
                    message={message.content}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedGrade && (
          <div className="bg-white border-t">
            <div className="max-w-3xl mx-auto p-4">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
              {isLoading && (
                <p className="text-sm text-gray-500 mt-2">
                  Math Buddy is thinking...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 