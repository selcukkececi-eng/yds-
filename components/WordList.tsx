import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { VocabWord } from '../types';
import { 
  Eye, EyeOff, Search, Volume2, RotateCcw, Image as ImageIcon, Loader2, 
  ChevronLeft, ChevronRight, LayoutGrid, RectangleHorizontal, CheckCircle, XCircle, RefreshCw, Shuffle, Archive, BookOpen
} from 'lucide-react';

interface WordListProps {
  words: VocabWord[];
  excludedIds: number[];
  onExclude: (id: number) => void;
  onInclude: (id: number) => void;
  onResetExcluded: () => void;
}

// Sub-component to handle individual image loading state
const WordImage: React.FC<{ word: string; large?: boolean }> = ({ word, large = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const width = large ? 800 : 400;
  const height = large ? 400 : 250;
  const imageUrl = `https://image.pollinations.ai/prompt/minimalist%20flat%20vector%20educational%20illustration%20of%20${encodeURIComponent(word)}%20white%20background?width=${width}&height=${height}&nologo=true`;

  if (hasError) return null;

  return (
    <div className={`relative w-full bg-gray-50 overflow-hidden border-b border-gray-100 transition-opacity ${large ? 'h-56 md:h-64' : 'h-48'}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
           <Loader2 className="animate-spin" size={24} />
        </div>
      )}
      <img 
        src={imageUrl} 
        alt={word}
        className={`w-full h-full object-contain mix-blend-multiply transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};

// Helper for shuffling options
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const WordList: React.FC<WordListProps> = ({ words, excludedIds, onExclude, onInclude, onResetExcluded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [listType, setListType] = useState<'active' | 'hidden'>('active');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Card Quiz State
  const [quizQueue, setQuizQueue] = useState<VocabWord[]>([]);
  const [currentOptions, setCurrentOptions] = useState<VocabWord[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [addedToReview, setAddedToReview] = useState(false);
  
  // Global settings
  const [showMeaningsGrid, setShowMeaningsGrid] = useState(true);
  const [showImages, setShowImages] = useState(true);

  // Filter words based on search term AND list type (active vs hidden)
  const filteredWords = useMemo(() => {
    return words.filter(word => {
      const matchesSearch = 
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.turkish.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isExcluded = excludedIds.includes(word.id);
      
      // If listType is 'active', show words NOT in excludedIds
      // If listType is 'hidden', show words IN excludedIds
      const matchesListType = listType === 'active' ? !isExcluded : isExcluded;

      return matchesSearch && matchesListType;
    });
  }, [words, searchTerm, excludedIds, listType]);

  // Sync queue with filtered words when filter changes (Reset quiz flow)
  // AUTOMATIC SHUFFLE: We shuffle immediately when loading the list.
  useEffect(() => {
    const shuffled = shuffleArray([...filteredWords]);
    setQuizQueue(shuffled);
    setCurrentIndex(0);
    setIsAnswered(false);
    setSelectedOptionId(null);
    setAddedToReview(false);
  }, [filteredWords]); // Intentionally depends on filteredWords to reset when tab changes

  // Determine which word to show based on view mode
  const currentWord = quizQueue[currentIndex];

  // Initialize options for the current card
  useEffect(() => {
    if (!currentWord || viewMode !== 'card') return;

    setIsAnswered(false);
    setSelectedOptionId(null);
    setAddedToReview(false);

    // Get 3 random distractors that are not the current word
    // We pool from 'words' (all words) to ensure good distractors
    const others = words.filter(w => w.id !== currentWord.id);
    
    // Safety check
    if (others.length < 3) return;
    
    const distractors = shuffleArray(others).slice(0, 3);
    const options = shuffleArray([currentWord, ...distractors]);
    
    setCurrentOptions(options);
  }, [currentWord, viewMode, words]);

  // Navigation Handlers
  const handleNext = useCallback(() => {
    if (currentIndex < quizQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, quizQueue.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleShuffle = useCallback(() => {
    const shuffled = shuffleArray([...quizQueue]);
    setQuizQueue(shuffled);
    setCurrentIndex(0);
    setIsAnswered(false);
    setSelectedOptionId(null);
  }, [quizQueue]);

  const handleOptionClick = (optionId: number) => {
    if (isAnswered) return;
    
    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const isCorrect = optionId === currentWord.id;

    if (!isCorrect) {
        setQuizQueue(prev => [...prev, currentWord]);
        setAddedToReview(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'card') return;
      
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, handleNext, handlePrev]);

  // Helper for option styling
  const getOptionStyle = (optionId: number, isCorrect: boolean) => {
    const baseStyle = "w-full p-4 rounded-xl text-left font-semibold text-lg transition-all duration-200 border-2 flex items-center justify-between group";
    
    if (!isAnswered) {
      return `${baseStyle} bg-white border-gray-100 text-gray-700 hover:border-brand-red/30 hover:bg-red-50 hover:shadow-sm`;
    }

    if (isCorrect) {
      return `${baseStyle} bg-green-50 border-green-500 text-green-800 shadow-sm`;
    }

    if (selectedOptionId === optionId && !isCorrect) {
      return `${baseStyle} bg-red-50 border-red-500 text-red-800`;
    }

    return `${baseStyle} bg-gray-50 border-gray-100 text-gray-400 opacity-50`;
  };

  return (
    <div className="space-y-6 fade-in">
      
      {/* Tab Switcher */}
      <div className="flex gap-4 border-b border-gray-200 pb-1">
        <button 
          onClick={() => setListType('active')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            listType === 'active' 
              ? 'border-brand-red text-brand-red' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen size={18} />
          Çalışma Listesi ({words.length - excludedIds.length})
        </button>
        <button 
          onClick={() => setListType('hidden')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            listType === 'hidden' 
              ? 'border-brand-red text-brand-red' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Archive size={18} />
          Gizlenenler ({excludedIds.length})
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-20 z-40">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
          
          {/* Search */}
          <div className="relative w-full xl:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={listType === 'active' ? "Kelime ara..." : "Gizlenenlerde ara..."}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
            
            <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-brand-red"
                title="Listeyi Karıştır"
            >
                <Shuffle size={16} />
                <span className="hidden sm:inline">Karıştır</span>
            </button>

            {/* View Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 mr-2">
                <button
                    onClick={() => setViewMode('card')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'card' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <RectangleHorizontal size={16} />
                    Quiz
                </button>
                <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'grid' ? 'bg-white text-brand-red shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <LayoutGrid size={16} />
                    Grid
                </button>
            </div>

            <button
              onClick={() => setShowImages(!showImages)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors border ${
                showImages 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ImageIcon size={16} />
              <span className="hidden sm:inline">Görseller</span>
            </button>

            {viewMode === 'grid' && (
                <button
                onClick={() => setShowMeaningsGrid(!showMeaningsGrid)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    showMeaningsGrid 
                    ? 'bg-brand-light text-brand-darkRed border border-brand-red/20' 
                    : 'bg-gray-800 text-white'
                }`}
                >
                {showMeaningsGrid ? <Eye size={18} /> : <EyeOff size={18} />}
                <span className="hidden sm:inline">{showMeaningsGrid ? 'Anlamları Gizle' : 'Anlamları Göster'}</span>
                </button>
            )}
          </div>
        </div>

        {/* Stats Line */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500 border-t pt-3">
            <span>
                {viewMode === 'card' && quizQueue.length > 0
                    ? `${currentIndex + 1} / ${quizQueue.length}`
                    : `${quizQueue.length} kelime gösteriliyor`
                }
            </span>
            {listType === 'hidden' && excludedIds.length > 0 && (
                <button 
                    onClick={onResetExcluded}
                    className="flex items-center gap-1 text-brand-red hover:underline"
                >
                    <RotateCcw size={14} />
                    Tümünü Listeye Geri Al
                </button>
            )}
        </div>
      </div>

      {/* ----------- CARD VIEW (QUIZ MODE) ----------- */}
      {viewMode === 'card' && quizQueue.length > 0 && currentWord && (
        <div className="max-w-3xl mx-auto flex flex-col items-center">
            
            <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 flex flex-col relative">
                {/* Image Area */}
                {showImages && (
                    <WordImage word={currentWord.english} large />
                )}

                {/* Question Area */}
                <div className="bg-white p-6 pb-2 text-center border-b border-gray-50">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">{currentWord.english}</h2>
                    <div className="flex items-center justify-center gap-2 text-brand-gold font-mono text-lg">
                        <Volume2 size={20} />
                        <span>/{currentWord.pronunciation}/</span>
                    </div>
                </div>

                {/* Options Area */}
                <div className="p-6 md:p-8 bg-gray-50/50">
                    <div className="grid grid-cols-1 gap-3">
                        {currentOptions.map((option) => {
                            const isCorrect = option.id === currentWord.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionClick(option.id)}
                                    disabled={isAnswered}
                                    className={getOptionStyle(option.id, isCorrect)}
                                >
                                    <span className="flex-1">{option.turkish}</span>
                                    {isAnswered && isCorrect && (
                                        <CheckCircle className="text-green-600 ml-2 animate-in zoom-in duration-300" />
                                    )}
                                    {isAnswered && selectedOptionId === option.id && !isCorrect && (
                                        <XCircle className="text-red-600 ml-2 animate-in zoom-in duration-300" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Feedback Message for Wrong Answer */}
                    {addedToReview && (
                        <div className="mt-4 p-3 bg-brand-light border border-brand-red/20 rounded-lg flex items-center gap-3 text-brand-darkRed animate-in slide-in-from-top-2 fade-in">
                            <RefreshCw className="shrink-0 animate-spin-slow" size={20} />
                            <p className="text-sm font-semibold">
                                Yanlış cevap. Bu kelime tekrar edilmek üzere listenin sonuna eklendi.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                     {listType === 'active' ? (
                        <button
                            onClick={() => onExclude(currentWord.id)}
                            className="text-xs font-medium text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                            title="Listeden çıkar"
                        >
                            <EyeOff size={14} />
                            Bir daha gösterme
                        </button>
                     ) : (
                        <button
                            onClick={() => onInclude(currentWord.id)}
                            className="text-xs font-bold text-green-600 hover:text-green-800 flex items-center gap-1 transition-colors"
                            title="Listeye geri ekle"
                        >
                            <Eye size={14} />
                            Bir daha göster
                        </button>
                     )}
                    <span className="text-xs font-mono text-gray-300">ID: {currentWord.id}</span>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 w-full max-w-md">
                <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0}
                    className="flex-1 bg-white border-2 border-gray-200 hover:border-brand-red hover:text-brand-red text-gray-600 disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:text-gray-600 font-bold py-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                    <ChevronLeft />
                    Önceki
                </button>
                <button 
                    onClick={handleNext} 
                    disabled={currentIndex === quizQueue.length - 1}
                    className={`flex-1 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                        isAnswered 
                        ? 'bg-brand-red border-2 border-brand-red hover:bg-brand-darkRed hover:border-brand-darkRed text-white animate-pulse'
                        : 'bg-white border-2 border-gray-300 text-gray-400 hover:border-gray-400'
                    } disabled:opacity-50 disabled:animate-none`}
                >
                    Sonraki
                    <ChevronRight />
                </button>
            </div>

            <p className="text-gray-400 text-sm mt-4 text-center">
                Gezinmek için <kbd className="bg-gray-200 px-1 rounded text-gray-600">Yön Tuşlarını</kbd> kullanabilirsiniz
            </p>
        </div>
      )}

      {/* ----------- GRID VIEW ----------- */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quizQueue.map((word, index) => (
            <div key={`${word.id}-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group transform hover:-translate-y-1">
                
                {showImages && (
                <WordImage word={word.english} />
                )}

                <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{word.english}</h3>
                    <span className="text-xs font-mono text-gray-300 shrink-0 mt-1">#{word.id}</span>
                </div>
                
                <div className="flex items-center gap-2 text-brand-gold/90 font-mono text-sm mb-4">
                    <Volume2 size={14} />
                    <span>/{word.pronunciation}/</span>
                </div>

                <div className="mt-auto">
                    <div className={`transition-all duration-300 ${showMeaningsGrid ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className={`p-3 rounded-lg bg-gray-50 border border-gray-100 ${!showMeaningsGrid ? 'blur-sm select-none group-hover:blur-0' : ''}`}>
                            <p className="text-gray-800 font-medium text-lg">{word.turkish}</p>
                        </div>
                        {!showMeaningsGrid && (
                            <p className="text-center text-xs text-gray-400 mt-1 group-hover:opacity-0 transition-opacity">Görmek için üzerine gelin</p>
                        )}
                    </div>
                </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-end">
                    {listType === 'active' ? (
                        <button
                            onClick={() => onExclude(word.id)}
                            className="text-xs font-medium text-gray-400 hover:text-brand-red flex items-center gap-1 transition-colors"
                            title="Listeden çıkar"
                        >
                            <EyeOff size={14} />
                            Bir daha gösterme
                        </button>
                    ) : (
                        <button
                            onClick={() => onInclude(word.id)}
                            className="text-xs font-bold text-green-600 hover:text-green-800 flex items-center gap-1 transition-colors"
                            title="Listeye geri ekle"
                        >
                            <Eye size={14} />
                            Bir daha göster
                        </button>
                    )}
                </div>
            </div>
            ))}
        </div>
      )}

      {filteredWords.length === 0 && (
        <div className="text-center py-20 text-gray-400">
            <p className="text-lg">"{listType === 'active' ? 'Çalışma Listesi' : 'Gizlenenler'}" içinde "{searchTerm}" ile eşleşen kelime bulunamadı.</p>
            {listType === 'active' && excludedIds.length > 0 && (
               <p className="text-sm mt-2 text-brand-red cursor-pointer hover:underline" onClick={() => setListType('hidden')}>
                   Gizlenenler sekmesine bakmak ister misiniz?
               </p>
            )}
            <button 
                onClick={() => setSearchTerm('')} 
                className="mt-2 text-brand-red font-bold hover:underline"
            >
                Aramayı Temizle
            </button>
        </div>
      )}
    </div>
  );
};