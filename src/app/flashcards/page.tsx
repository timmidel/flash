"use client";

import { useContext, useState, useEffect } from "react";
import { FlashcardContext } from "../context/FlashcardContext";
import FlashcardComponent from "../components/Flashcard";

export default function FlashcardsPage() {
  const context = useContext(FlashcardContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

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

  const { flashcards } = context;
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
    );
    setIsFlipped(false);
  };

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-2xl">
          No flashcards available. Please generate them first.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center pt-10 py-20">
      <div className="w-full max-w-2xl">
        <FlashcardComponent
          flashcard={flashcards[currentIndex]}
          isFlipped={isFlipped}
          onClick={() => setIsFlipped(!isFlipped)}
        />
      </div>
      <div className="bg-gray-900/90 fixed bottom-0 left-0 right-0 p-4 flex items-center justify-center space-x-4">
        <button
          onClick={handlePrev}
          className="px-4 py-2 bg-purple-600  text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          &larr; Prev
        </button>
        <span className="text-white text-lg">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
