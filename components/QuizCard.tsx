import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, Volume2, EyeOff, Eye, ArrowRight } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean, selected: string, correct: string) => void;
  onExclude: (id: number) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ 
  question, 
  questionIndex, 
  totalQuestions, 
  onAnswer,
  onExclude
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isExcluded, setIsExcluded] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsExcluded(false);
  }, [question]);

  const handleOptionClick = (optionId: number) => {
    if (isAnswered) return;

    setSelectedOption(optionId);
    setIsAnswered(true);
    // Auto-advance removed to allow user to review answer
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === question.correctOptionId;
    const selectedText = question.options.find(o => o.id === selectedOption)?.turkish || "";
    
    onAnswer(isCorrect, selectedText, question.word.turkish);
  };

  const handleExcludeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExclude(question.word.id);
    setIsExcluded(true);
  };

  const getButtonStyles = (optionId: number) => {
    const baseStyle = "w-full p-4 rounded-xl text-left font-semibold text-lg transition-all duration-300 border-2 shadow-sm flex items-center justify-between";
    
    if (!isAnswered) {
      return `${baseStyle} bg-white border-gray-200 text-gray-700 hover:border-brand-gold hover:bg-yellow-50 hover:shadow-md`;
    }

    if (optionId === question.correctOptionId) {
      return `${baseStyle} bg-green-100 border-green-500 text-green-800 shadow-green-100 scale-[1.02]`;
    }

    if (optionId === selectedOption && optionId !== question.correctOptionId) {
      return `${baseStyle} bg-red-100 border-red-500 text-red-800`;
    }

    return `${baseStyle} bg-gray-50 border-gray-200 text-gray-400 opacity-60`;
  };

  const isLastQuestion = questionIndex === totalQuestions - 1;

  return (
    <div className="w-full max-w-2xl mx-auto fade-in">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
          <span>Question {questionIndex + 1} of {totalQuestions}</span>
          <span>{Math.round(((questionIndex) / totalQuestions) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-brand-red h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 relative">
        
        {/* Header / Question Word */}
        <div className="bg-brand-red p-8 text-center relative overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-gold opacity-20 rounded-full"></div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2 relative z-10">
                {question.word.english}
            </h2>
            <div className="flex items-center justify-center gap-2 text-brand-gold/90 font-mono text-lg relative z-10">
                <Volume2 size={18} />
                <span>/{question.word.pronunciation}/</span>
            </div>
        </div>

        {/* Options */}
        <div className="p-8 bg-brand-light/30">
          <p className="text-gray-500 mb-4 text-sm uppercase tracking-wider font-bold text-center">
            {isAnswered ? "Review your answer" : "Select the correct meaning"}
          </p>
          <div className="grid grid-cols-1 gap-4">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                disabled={isAnswered}
                className={getButtonStyles(option.id)}
              >
                <span className="flex-1">{option.turkish}</span>
                {isAnswered && option.id === question.correctOptionId && (
                    <CheckCircle className="text-green-600 ml-2" />
                )}
                {isAnswered && option.id === selectedOption && option.id !== question.correctOptionId && (
                    <XCircle className="text-red-600 ml-2" />
                )}
              </button>
            ))}
          </div>

          {isAnswered && (
            <div className="mt-8 flex justify-center fade-in">
              <button
                onClick={handleNext}
                className="bg-brand-red hover:bg-brand-darkRed text-white text-lg font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 w-full md:w-auto justify-center"
              >
                <span>{isLastQuestion ? "Finish Quiz" : "Next Question"}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100 flex justify-between items-center">
            <span>Word ID: {question.word.id}</span>
            <button 
              onClick={handleExcludeClick}
              disabled={isExcluded}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 ${
                isExcluded 
                  ? 'bg-gray-200 text-gray-500 cursor-default' 
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-red-600'
              }`}
            >
              {isExcluded ? <EyeOff size={14} /> : <Eye size={14} />}
              {isExcluded ? 'Hidden for future' : 'Don\'t show again'}
            </button>
        </div>
      </div>
    </div>
  );
};