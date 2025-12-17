export interface VocabWord {
  id: number;
  english: string;
  pronunciation: string;
  turkish: string;
}

export interface Question {
  word: VocabWord;
  options: VocabWord[];
  correctOptionId: number;
}

export interface QuizHistoryItem {
  word: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
}

export interface GameState {
  score: number;
  totalQuestions: number;
  history: QuizHistoryItem[];
}
