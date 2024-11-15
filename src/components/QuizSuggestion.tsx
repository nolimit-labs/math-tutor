import React from 'react';
import { BookOpen } from 'lucide-react';

interface QuizSuggestionProps {
  topic: string;
  grade: number;
  onStart: () => void;
}

export const QuizSuggestion: React.FC<QuizSuggestionProps> = ({ topic, grade, onStart }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BookOpen size={24} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-800">Ready to test your knowledge?</h3>
          <p className="text-gray-600 mt-1">
            Take a quick quiz on {topic} for Grade {grade}
          </p>
          <button
            onClick={onStart}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}; 