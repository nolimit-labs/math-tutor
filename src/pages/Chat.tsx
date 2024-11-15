import React, { useState, useEffect } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ChatMessage } from '../components/ChatMessage';
import { Brain, LogOut, GraduationCap, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuizModal } from '../components/QuizModal';
import { QuizSuggestion } from '../components/QuizSuggestion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  quizSuggestion?: {
    topic: string;
    grade: number;
  };
}

interface GradeMessages {
  [grade: number]: Message[];
}

export const Chat: React.FC = () => {
  const [gradeMessages, setGradeMessages] = useState<GradeMessages>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);

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

  const handleStartQuiz = async (topic: string, grade: number) => {
    try {
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ topic, grade })
      });
      
      const quiz = await response.json();
      setActiveQuiz(quiz);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const handleQuizSubmit = async (answers: Record<number, string>) => {
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers
        })
      });
      
      const result = await response.json();
      setActiveQuiz(null);
      
      // Add quiz results to chat
      if (selectedGrade) {
        setGradeMessages(prev => ({
          ...prev,
          [selectedGrade]: [
            ...prev[selectedGrade],
            {
              role: 'assistant',
              content: `Quiz Results:\nScore: ${result.score}/${result.total}\n\n${result.feedback}`
            }
          ]
        }));
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  };

  const currentMessages = selectedGrade ? gradeMessages[selectedGrade] || [] : [];

  return (
    <div className="h-screen flex bg-gradient-to-b from-blue-50 to-purple-50 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu size={24} className="text-blue-500" />
      </button>

      {/* Desktop Toggle Button */}
      <button
        onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
        className="hidden lg:flex fixed top-4 left-4 z-20 p-2 bg-white rounded-lg shadow-md"
      >
        {isDesktopSidebarOpen ? (
          <X size={24} className="text-blue-500" />
        ) : (
          <Menu size={24} className="text-blue-500" />
        )}
      </button>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDesktopSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
          fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-sm
          transition-transform duration-300 ease-in-out z-40
        `}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="text-blue-500" size={24} />
            <h1 className="text-xl font-bold text-blue-800">Math Buddy</h1>
          </div>
          {/* Close button for mobile only */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto h-[calc(100vh-140px)]">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Grade Level</h2>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((grade) => (
              <button
                key={grade}
                onClick={() => {
                  handleGradeSelect(grade);
                  setIsSidebarOpen(false);
                }}
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
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
      <div 
        className={`
          flex-1 flex flex-col h-screen
          transition-[margin] duration-300 ease-in-out
          ${isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
        `}
      >
        <div className="flex-1 overflow-auto p-4 pt-16 lg:pt-16">
          <div className="max-w-3xl mx-auto">
            {currentMessages.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="mx-auto text-blue-300" size={64} />
                <h2 className="mt-6 text-2xl font-semibold text-gray-700">
                  Select a Grade Level to Begin
                </h2>
                <p className="mt-2 text-gray-600">
                  {isDesktopSidebarOpen || isSidebarOpen 
                    ? "Choose your grade from the sidebar to start learning math!"
                    : "Open the menu to select your grade and start learning math!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentMessages.map((message, index) => (
                  <React.Fragment key={index}>
                    <ChatMessage
                      isBot={message.role === 'assistant'}
                      message={message.content}
                    />
                    {message.quizSuggestion && (
                      <QuizSuggestion
                        topic={message.quizSuggestion.topic}
                        grade={message.quizSuggestion.grade}
                        onStart={() => handleStartQuiz(message.quizSuggestion!.topic, message.quizSuggestion!.grade)}
                      />
                    )}
                  </React.Fragment>
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
                onQuizStart={() => setShowQuiz(true)}
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

      {/* New Quiz Modal */}
      {showQuiz && selectedGrade && (
        <QuizModal
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          grade={selectedGrade}
        />
      )}
    </div>
  );
}; 