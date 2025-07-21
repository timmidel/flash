"use client";

import { useContext, useState, useEffect } from "react";
import { FlashcardContext } from "../context/FlashcardContext";
import MultipleChoiceCard from "../components/MultipleChoiceCard";
import { Shuffle } from "lucide-react";

export default function MultipleChoicePage() {
  const context = useContext(FlashcardContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!context) {
    return null;
  }

  const { flashcards, setFlashcards } = context;

  const handleNext = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
      setIsFading(false);
    }, 150);
  };

  const handlePrev = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
      );
      setIsFading(false);
    }, 150);
  };

  const handleChoiceSelected = (selectedChoice: string) => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[currentIndex] = {
      ...updatedFlashcards[currentIndex],
      selectedAnswer: selectedChoice,
      isRevealed: true,
    };
    setFlashcards(updatedFlashcards);
  };

  const handleShuffle = () => {
    if (flashcards.length === 0) return;
    const shuffledFlashcards = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffledFlashcards);
    setCurrentIndex(0);
  };

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-2xl">
          No multiple choice questions available. Please generate them first.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative pt-10 pb-20">
      <div
        className={`w-full max-w-2xl transition-opacity duration-300 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        <MultipleChoiceCard
          card={flashcards[currentIndex]}
          onChoiceSelected={handleChoiceSelected}
        />
      </div>
      <div className="fixed top-4 right-4">
        <button
          onClick={handleShuffle}
          className="px-4 py-2 text-white rounded-md cursor-pointer hover:scale-125 transition-all focus:outline-none focus:ring-0"
        >
          <Shuffle className="w-9 h-9" />
        </button>
      </div>
      <div className="bg-gray-900/90 fixed bottom-0 left-0 right-0 p-4 flex items-center justify-center space-x-4">
        <button
          onClick={handlePrev}
          className="px-4 py-2 bg-purple-600 cursor-pointer text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          &larr; Prev
        </button>
        <span className="text-white text-lg">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-purple-600 cursor-pointer text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}