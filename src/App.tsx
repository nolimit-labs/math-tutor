import React, { useState, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Calculator, PencilRuler, Brain, History } from 'lucide-react';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm Math Buddy, your friendly math tutor! I can help you with basic math concepts like addition, subtraction, multiplication, division, and more. What would you like to learn today?"
};

interface ChatHistory {
  id: number;
  user_message: string;
  bot_message: string;
  created_at: string;
}

function App() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const history = await response.json();
        setChatHistory(history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    const newMessages = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const botMessage = await response.json();
      setMessages([...newMessages, botMessage]);
      await fetchChatHistory(); // Refresh history after new message
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { role: 'assistant', content: "Oops! Something went wrong. Let's try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Calculator className="text-blue-500" size={32} />
            <Brain className="text-purple-500" size={32} />
            <PencilRuler className="text-blue-500" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Math Buddy</h1>
          <p className="text-gray-600">Your friendly K-5 math tutor!</p>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <History size={20} />
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat History Sidebar */}
          {showHistory && (
            <div className="md:col-span-1 bg-white rounded-2xl shadow-xl p-4 max-h-[70vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Chat History</h2>
              <div className="space-y-4">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="border-b pb-2">
                    <p className="text-sm text-gray-600">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                    <p className="font-medium">Q: {chat.user_message}</p>
                    <p className="text-gray-700">A: {chat.bot_message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Container */}
          <div className={`${showHistory ? 'md:col-span-2' : 'md:col-span-3'} bg-white rounded-2xl shadow-xl p-4`}>
            <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  isBot={message.role === 'assistant'}
                  message={message.content}
                />
              ))}
            </div>

            {/* Input Area */}
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>Remember: Always double-check your answers and ask for help when needed!</p>
        </div>
      </div>
    </div>
  );
}

export default App;