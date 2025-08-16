"use client";

import { useContext, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FlashcardContext, Flashcard } from "../context/FlashcardContext";
import MultipleChoiceCard from "../components/MultipleChoiceCard";
import { Shuffle, Eye, EyeOff, RotateCcw, ArrowLeft } from "lucide-react";
import { getDocumentById } from "../services/documentService";
import { getRationaleImageByDocument } from "../services/rationaleImageService";
import Spinner from "../components/Spinner";
import QuestionNavigator from "../components/QuestionNavigator";
import {
  getQuestionsByDocument,
  updateQuestions,
} from "../services/questionService";
import { Question } from "../types/item";
import { useRouter } from "next/navigation";

export default function MultipleChoice() {
  const context = useContext(FlashcardContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [showRationale, setShowRationale] = useState(false);
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");

  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const fetchAndBuildMultipleChoice = async () => {
      if (docId && context) {
        try {
          const document = await getDocumentById(docId);
          const rationaleImages = await getRationaleImageByDocument(docId);
          if (document) {
            const itemData = await getQuestionsByDocument(docId);
            const newFlashcards: Flashcard[] = itemData.map(
              (q: Question, index: number) => ({
                id: q.id || "",
                question: q.question_text,
                choices: q.choices ?? [],
                answer: q.answer,
                rationale: q.rationale ?? "",
                selectedAnswer: q.selected_answer ?? "",
                isRevealed: q.selected_answer ? true : false,
                rationaleImage:
                  rationaleImages.find((img) => img.rationale_index === index)
                    ?.image_url || "",
              })
            );
            const correctCount = newFlashcards.filter(
              (card) =>
                card.selectedAnswer && card.selectedAnswer === card.answer
            ).length;
            const answeredCount = newFlashcards.filter(
              (card) => card.selectedAnswer
            ).length;
            setScore(correctCount);
            setAnswersCount(answeredCount);
            context.setFlashcards(newFlashcards);
          }
        } catch (error) {
          console.error(
            "Error fetching or building multiple choice questions:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAndBuildMultipleChoice();
  }, [docId]);

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

  const handleChoiceSelected = async (selectedChoice: string) => {
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[currentIndex] = {
      ...updatedFlashcards[currentIndex],
      selectedAnswer: selectedChoice,
      isRevealed: true,
    };
    try {
      updateQuestions([updatedFlashcards[currentIndex].id], {
        selected_answer: selectedChoice,
      });
    } catch (error) {
      console.error("Error updating choice:", error);
    }

    setFlashcards(updatedFlashcards);
    if (selectedChoice === updatedFlashcards[currentIndex].answer) {
      setScore((prevScore) => prevScore + 1);
    }
    setAnswersCount((prevCount) => prevCount + 1);
  };

  const handleShuffle = () => {
    if (flashcards.length === 0) return;
    const shuffledFlashcards = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffledFlashcards);
    setCurrentIndex(0);
  };

  const handleReset = async () => {
    if (flashcards.length === 0) return;
    const flashcardIds = flashcards.map((card) => card.id);
    try {
      const updatedQuestions = await updateQuestions(flashcardIds, {
        selected_answer: "",
      });
      if (updatedQuestions) {
        const resetFlashcards = flashcards.map((card) => ({
          ...card,
          selectedAnswer: "",
          isRevealed: false,
        }));
        setFlashcards(resetFlashcards);
        setScore(0);
        setAnswersCount(0);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error resetting questions:", error);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsFading(false);
    }, 150);
  };

  if (loading) {
    return <Spinner />;
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-2xl">
          No multiple choice questions available or invalid document format.
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
          showRationale={showRationale}
        />
      </div>
      <QuestionNavigator
        flashcards={flashcards}
        currentIndex={currentIndex}
        onQuestionSelect={handleQuestionSelect}
      />
      <div className="fixed top-0 right-0 p-2 flex justify-between px-4 bg-gray-900/90 w-full">
        <div className="flex items-center">
          <ArrowLeft
            onClick={() => router.push("/")}
            className="cursor-pointer"
          />
        </div>

        <div className="flex items-center">
          <span className="text-white text-md flex items-center mx-4">
            Score: {Number(score)} / {answersCount}
          </span>
          <span className="text-white text-md flex items-center mx-4">
            Percent: {((score / answersCount || 0) * 100).toFixed(2)}%
          </span>
          <button
            onClick={handleReset}
            className="px-3 py-2 text-white rounded-md cursor-pointer hover:scale-125 transition-all focus:outline-none focus:ring-0"
          >
            <RotateCcw className="w-7 h-7" />
          </button>
          <button
            onClick={handleShuffle}
            className="px-3 py-2 text-white rounded-md cursor-pointer hover:scale-125 transition-all focus:outline-none focus:ring-0"
          >
            <Shuffle className="w-7 h-7" />
          </button>
          {(flashcards[currentIndex]?.rationale ||
            flashcards[currentIndex]?.rationaleImage) && (
            <button
              onClick={() => setShowRationale(!showRationale)}
              className="px-3 py-2 text-white rounded-md cursor-pointer hover:scale-125 transition-all focus:outline-none focus:ring-0"
            >
              {showRationale ? (
                <Eye className="w-8 h-8" />
              ) : (
                <EyeOff className="w-8 h-8" />
              )}
            </button>
          )}
        </div>
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
