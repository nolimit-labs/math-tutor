import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: number;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, grade }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ grade })
      });
      
      const data = await response.json();
      setQuestions(data.questions);
      setCurrentQuestion(0);
      setScore(0);
      setShowExplanation(false);
      setSelectedAnswer(null);
      setQuizStarted(true);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    if (answer === questions[currentQuestion].correct_answer) {
      setScore(prev => prev + 1);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      onClose();
      // Reset states for next time
      setQuizStarted(false);
      setQuestions([]);
    }
  };

  const handleClose = () => {
    onClose();
    setQuizStarted(false);
    setQuestions([]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-800">Math Quiz</h2>
          <button onClick={handleClose} className="p-2">
            <X size={24} />
          </button>
        </div>

        {!quizStarted && !isLoading && (
          <div className="text-center py-8">
            <h3 className="text-lg mb-4">Would you like to start a math quiz?</h3>
            <p className="text-gray-600 mb-6">
              This quiz will test your Grade {grade} math knowledge with 5 questions.
            </p>
            <button
              onClick={fetchQuestions}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Quiz
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader className="animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600">Preparing your quiz questions...</p>
          </div>
        )}

        {quizStarted && !isLoading && questions.length > 0 && (
          <>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>Score: {score}/{questions.length}</span>
              </div>
              <p className="text-lg mt-2">{questions[currentQuestion].question}</p>
            </div>

            <div className="space-y-2">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedAnswer === option
                      ? option === questions[currentQuestion].correct_answer
                        ? 'bg-green-100 border-green-500'
                        : 'bg-red-100 border-red-500'
                      : selectedAnswer && option === questions[currentQuestion].correct_answer
                      ? 'bg-green-100 border-green-500'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800">{questions[currentQuestion].explanation}</p>
              </div>
            )}

            {selectedAnswer && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 