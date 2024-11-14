import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Brain } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Calculator className="text-blue-500" size={48} />
          <Brain className="text-purple-500" size={48} />
        </div>
        
        <h1 className="text-5xl font-bold text-blue-800 mb-4">
          Math Buddy
        </h1>
        <p className="text-xl text-gray-700 mb-4">
          Your personal K-5 math tutor powered by AI
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800">
            ⚠️ This is a portfolio project demonstration and not a full-fledged application. 
            Built to showcase React, TypeScript, and AI integration skills.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/auth')}
            className="w-full sm:w-auto px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}; 