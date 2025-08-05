"use client";

import { createContext, useState, ReactNode } from "react";
import { Choice } from "../types/item";
export interface Flashcard {
  id: string;
  question: string;
  choices: Choice[];
  answer: string;
  rationale?: string;
  selectedAnswer?: string;
  isRevealed?: boolean;
  rationaleImage?: string;
}

interface FlashcardContextType {
  flashcards: Flashcard[];
  setFlashcards: (flashcards: Flashcard[]) => void;
}

export const FlashcardContext = createContext<FlashcardContextType | undefined>(
  undefined
);

export const FlashcardProvider = ({ children }: { children: ReactNode }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  return (
    <FlashcardContext.Provider value={{ flashcards, setFlashcards }}>
      {children}
    </FlashcardContext.Provider>
  );
};
