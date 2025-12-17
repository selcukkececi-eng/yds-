import React from 'react';
import { BookOpen, GraduationCap, PlayCircle, EyeOff, RotateCcw } from 'lucide-react';

interface StartScreenProps {
  onStart: (count: number) => void;
  totalAvailable: number;
  excludedCount: number;
  onResetExcluded: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, totalAvailable, excludedCount, onResetExcluded }) => {
  const playableCount = totalAvailable - excludedCount;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-8 fade-in">
      <div className="bg-brand-red text-white p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300">
        <GraduationCap size={64} className="mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">YDS Vocab Master</h1>
        <p className="text-brand-gold font-semibold text-lg">Zafer Hoca YDS Academy Edition</p>
      </div>

      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
          <BookOpen className="text-brand-red" />
          Start Quiz
        </h2>
        
        <div className="text-gray-600 mb-8 space-y-2">
          <p>
            Test your vocabulary with words from YDS, YÖKDİL, and KPDS exams.
          </p>
          <div className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100 flex flex-col gap-1">
             <div className="flex justify-between">
                <span>Total Database:</span>
                <span className="font-bold">{totalAvailable}</span>
             </div>
             <div className="flex justify-between text-gray-400">
                <span>Hidden (Don't Show Again):</span>
                <span>{excludedCount}</span>
             </div>
             <div className="border-t border-gray-200 my-1"></div>
             <div className="flex justify-between text-brand-red font-bold">
                <span>Available for Quiz:</span>
                <span>{playableCount}</span>
             </div>
          </div>
          {excludedCount > 0 && (
             <button 
               onClick={onResetExcluded}
               className="text-xs text-brand-red hover:underline flex items-center justify-center gap-1 w-full mt-2"
             >
               <RotateCcw size={12} />
               Reset Hidden Words
             </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => onStart(10)}
            disabled={playableCount < 1}
            className="group relative w-full bg-white hover:bg-brand-red border-2 border-brand-red text-brand-red hover:text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>10 Questions</span>
            <PlayCircle className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button 
            onClick={() => onStart(20)}
            disabled={playableCount < 1}
            className="group relative w-full bg-white hover:bg-brand-red border-2 border-brand-red text-brand-red hover:text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>20 Questions</span>
            <PlayCircle className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button 
            onClick={() => onStart(50)}
            disabled={playableCount < 1}
            className="group relative w-full bg-white hover:bg-brand-red border-2 border-brand-red text-brand-red hover:text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>50 Questions</span>
            <PlayCircle className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
      
      <p className="text-gray-400 text-sm">
        Words extracted from "YDS – YÖKDİL ÇIKMIŞ KELİMELER LİSTESİ"
      </p>
    </div>
  );
};