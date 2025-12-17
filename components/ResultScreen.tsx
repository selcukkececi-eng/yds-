import React from 'react';
import { GameState } from '../types';
import { RefreshCcw, Check, X, Trophy } from 'lucide-react';

interface ResultScreenProps {
  state: GameState;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ state, onRestart }) => {
  const percentage = Math.round((state.score / state.totalQuestions) * 100);
  
  let message = "";
  if (percentage === 100) message = "Perfect Score! You are a master!";
  else if (percentage >= 80) message = "Excellent work! Keep it up!";
  else if (percentage >= 60) message = "Good job, but room for improvement.";
  else message = "Keep practicing, you'll get there!";

  return (
    <div className="max-w-3xl mx-auto p-4 fade-in">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 mb-8">
        <div className="bg-brand-red p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
             {percentage >= 60 ? <Trophy className="text-brand-gold w-10 h-10" /> : <RefreshCcw className="text-brand-red w-10 h-10" />}
          </div>
          <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-brand-light opacity-90">{message}</p>
        </div>

        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100 min-w-[150px]">
                    <span className="block text-4xl font-bold text-green-600">{state.score}</span>
                    <span className="text-green-800 text-sm font-semibold uppercase">Correct</span>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-xl border border-red-100 min-w-[150px]">
                    <span className="block text-4xl font-bold text-red-600">{state.totalQuestions - state.score}</span>
                    <span className="text-red-800 text-sm font-semibold uppercase">Incorrect</span>
                </div>
                 <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100 min-w-[150px]">
                    <span className="block text-4xl font-bold text-blue-600">{percentage}%</span>
                    <span className="text-blue-800 text-sm font-semibold uppercase">Accuracy</span>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-xl text-gray-800 border-b pb-2 mb-4">Review</h3>
                {state.history.map((item, idx) => (
                    <div key={idx} className={`flex items-start p-3 rounded-lg ${item.correct ? 'bg-gray-50' : 'bg-red-50 border border-red-100'}`}>
                        <div className="mt-1 mr-3 flex-shrink-0">
                            {item.correct ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg">{item.word}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Your answer: <span className={item.correct ? "text-green-700 font-medium" : "text-red-600 font-medium line-through"}>{item.userAnswer}</span>
                            </p>
                            {!item.correct && (
                                <p className="text-sm text-green-700 font-medium mt-1">
                                    Correct answer: {item.correctAnswer}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="bg-gray-50 p-6 flex justify-center border-t border-gray-200">
             <button 
                onClick={onRestart}
                className="bg-brand-red hover:bg-brand-darkRed text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <RefreshCcw size={20} />
                Try Again
              </button>
        </div>
      </div>
    </div>
  );
};