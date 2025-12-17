import { VocabWord, Question } from '../types';

export const parseVocabData = (rawData: string): VocabWord[] => {
  const lines = rawData.trim().split('\n');
  const words: VocabWord[] = [];

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    // Support pipe delimiter for reliable parsing of multi-word English phrases
    // Format: ID|English|Pronunciation|Turkish
    if (line.includes('|')) {
      const parts = line.split('|');
      if (parts.length >= 4) {
        words.push({
          id: parseInt(parts[0]),
          english: parts[1].trim(),
          pronunciation: parts[2].trim(),
          turkish: parts[3].trim()
        });
      }
      return;
    }

    // Legacy fallback for space delimiter (less reliable for multi-word phrases)
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match) {
      const id = parseInt(match[1]);
      const rest = match[2];
      
      const parts = rest.split(/\s+/);
      
      if (parts.length >= 3) {
        const english = parts[0];
        const pronunciation = parts[1];
        const turkish = parts.slice(2).join(' ');

        words.push({
          id,
          english,
          pronunciation,
          turkish
        });
      }
    }
  });

  return words;
};

// Fisher-Yates shuffle
export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateQuiz = (allWords: VocabWord[], questionCount: number, excludedIds: number[] = []): Question[] => {
  // Filter out excluded words from being the target question
  const availableWords = allWords.filter(w => !excludedIds.includes(w.id));
  
  const shuffledWords = shuffleArray(availableWords);
  // Ensure we don't ask for more questions than we have available
  const actualCount = Math.min(questionCount, availableWords.length);
  const selectedWords = shuffledWords.slice(0, actualCount);

  return selectedWords.map(targetWord => {
    // Select 3 random distractors that are NOT the target word
    // Distractors CAN be words from the excluded list (it's fine to see them as options)
    const distractors = shuffleArray(
      allWords.filter(w => w.id !== targetWord.id)
    ).slice(0, 3);

    const options = shuffleArray([targetWord, ...distractors]);
    const correctOptionId = targetWord.id;

    return {
      word: targetWord,
      options,
      correctOptionId
    };
  });
};