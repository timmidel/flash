"use client";

import { useContext, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Shuffle, Eye, EyeOff } from "lucide-react";
import { FlashcardContext, Flashcard } from "../context/FlashcardContext";
import FlashcardComponent from "../components/Flashcard";
import { getDocumentById } from "../services/documentService";
import { getRationaleImageByDocument } from "../services/rationaleImageService";
import Spinner from "../components/Spinner";

export default function Flashcards() {
  const context = useContext(FlashcardContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRationale, setShowRationale] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
  const flag = searchParams.get("flag");
  const rationaleFlag = searchParams.get("rationaleFlag");

  useEffect(() => {
    const fetchAndBuildFlashcards = async () => {
      if (docId && flag && context) {
        try {
          const document = await getDocumentById(docId);
          const rationaleImages = await getRationaleImageByDocument(docId);
          if (document) {
            const lines = document.content.split("\n");
            const newFlashcards: Flashcard[] = [];
            let currentQuestion = "";
            let rationaleIndex = 0;

            for (const line of lines) {
              if (line.includes(flag)) {
                const parts = line.split(flag);
                const question = currentQuestion.trim();
                const answer = parts[1].trim();
                if (question) {
                  newFlashcards.push({
                    question,
                    answer,
                    rationale: "", // Initialize empty, will be filled later
                  });
                }
                currentQuestion = "";
              } else if (rationaleFlag && line.includes(rationaleFlag)) {
                const parts = line.split(rationaleFlag);
                const rationaleImageWithIndex = rationaleImages.find(
                  (img) => img.rationale_index === rationaleIndex
                );
                // Apply to the last created flashcard
                if (rationaleImageWithIndex && newFlashcards.length > 0)
                  newFlashcards[newFlashcards.length - 1].rationaleImage =
                    rationaleImageWithIndex.image_url;
                else if (newFlashcards.length > 0)
                  newFlashcards[newFlashcards.length - 1].rationale =
                    parts[1].trim();
                rationaleIndex++;
              } else if (line.trim()) {
                // Only add non-empty lines
                currentQuestion += line + "\n";
              }
            }
            context.setFlashcards(newFlashcards);
          }
        } catch (error) {
          console.error("Error fetching or building flashcards:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAndBuildFlashcards();
  }, [docId, flag, rationaleFlag]);

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
    const duration = isFlipped ? 250 : 150;
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
      setIsFlipped(false);
      setIsFading(false);
    }, duration);
  };

  const handlePrev = () => {
    setIsFading(true);
    const duration = isFlipped ? 250 : 150;
    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? flashcards.length - 1 : prevIndex - 1
      );
      setIsFlipped(false);
      setIsFading(false);
    }, duration);
  };

  const handleShuffle = () => {
    if (flashcards.length === 0) return;
    const shuffledFlashcards = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffledFlashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) {
    return <Spinner />;
  }

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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative pt-10 pb-20">
      <div
        className={`w-full max-w-2xl transition-opacity duration-300 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        <FlashcardComponent
          flashcard={flashcards[currentIndex]}
          isFlipped={isFlipped}
          onClick={() => setIsFlipped(!isFlipped)}
          showRationale={showRationale}
        />
      </div>
      <div className="fixed top-4 right-4 flex space-x-2">
        <button
          onClick={handleShuffle}
          className="px-4 py-2 text-white rounded-md cursor-pointer hover:scale-125 transition-all focus:outline-none focus:ring-0"
        >
          <Shuffle className="w-9 h-9" />
        </button>
        {(flashcards[currentIndex]?.rationale ||
          flashcards[currentIndex]?.rationaleImage) && (
          <button
            onClick={() => setShowRationale(!showRationale)}
            className="px-4 py-2 text-white rounded-md cursor-pointer hover:scale-125 transition-all focus:outline-none focus:ring-0"
          >
            {showRationale ? (
              <Eye className="w-9 h-9" />
            ) : (
              <EyeOff className="w-9 h-9" />
            )}
          </button>
        )}
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
