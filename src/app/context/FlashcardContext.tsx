'use client';

import { createContext, useState, ReactNode } from 'react';

export interface Flashcard {
  question: string;
  answer: string;
  rationale?: string;
  choices?: { letter: string; text: string }[];
  selectedAnswer?: string | null;
  isRevealed?: boolean;
}

interface FlashcardContextType {
  flashcards: Flashcard[];
  setFlashcards: (flashcards: Flashcard[]) => void;
}

export const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider = ({ children }: { children: ReactNode }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  return (
    <FlashcardContext.Provider value={{ flashcards, setFlashcards }}>
      {children}
    </FlashcardContext.Provider>
  );
};