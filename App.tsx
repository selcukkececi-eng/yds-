import React, { useState, useMemo } from 'react';
import { RAW_OCR_DATA } from './data/rawText';
import { parseVocabData } from './utils/dataProcessor';
import { WordList } from './components/WordList';

const App: React.FC = () => {
  // Load and parse data once
  const allWords = useMemo(() => parseVocabData(RAW_OCR_DATA), []);

  // Manage excluded IDs (words user selected "Don't show again")
  const [excludedIds, setExcludedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('yds_excluded_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleExcludeWord = (id: number) => {
    if (!excludedIds.includes(id)) {
      const newExcluded = [...excludedIds, id];
      setExcludedIds(newExcluded);
      localStorage.setItem('yds_excluded_ids', JSON.stringify(newExcluded));
    }
  };

  const handleIncludeWord = (id: number) => {
    const newExcluded = excludedIds.filter(exId => exId !== id);
    setExcludedIds(newExcluded);
    localStorage.setItem('yds_excluded_ids', JSON.stringify(newExcluded));
  };

  const handleResetExcluded = () => {
    if (window.confirm('Are you sure you want to restore all hidden words?')) {
      setExcludedIds([]);
      localStorage.removeItem('yds_excluded_ids');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        {/* Navigation / Header */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-brand-red rounded flex items-center justify-center text-white font-bold mr-2">Z</div>
                        <span className="font-bold text-xl text-gray-800 hidden sm:inline">Zafer Hoca <span className="text-brand-red">YDS</span></span>
                        <span className="font-bold text-xl text-gray-800 sm:hidden">YDS</span>
                    </div>
                    <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                        Database: <span className="text-brand-red font-bold">{allWords.length}</span> Words
                    </div>
                </div>
            </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <WordList 
                words={allWords} 
                excludedIds={excludedIds}
                onExclude={handleExcludeWord} 
                onInclude={handleIncludeWord}
                onResetExcluded={handleResetExcluded}
            />
        </main>
    </div>
  );
};

export default App;