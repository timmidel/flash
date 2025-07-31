import React, { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Flashcard } from "../context/FlashcardContext";

interface QuestionNavigatorProps {
  flashcards: Flashcard[];
  currentIndex: number;
  onQuestionSelect: (index: number) => void;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  flashcards,
  currentIndex,
  onQuestionSelect,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getIndicatorColor = (flashcard: Flashcard) => {
    if (!flashcard.isRevealed) {
      return "bg-gray-700";
    }
    if (flashcard.selectedAnswer === flashcard.answer) {
      return "bg-green-500";
    }
    return "bg-red-500";
  };

  return (
    <div
      className={`fixed left-0 top-1/2 -translate-y-1/2 bg-gray-800 p-4 rounded-r-lg shadow-lg transition-all duration-300 ease-in-out z-10 ${
        isCollapsed ? "w-16 cursor-pointer" : "w-64"
      }`}
      onClick={isCollapsed ? toggleCollapse : undefined}
    >
      {isCollapsed ? (
        <ChevronRight className="w-7 h-7 mx-auto text-white" />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-lg">Questions</h3>
            <button
              onClick={toggleCollapse}
              className="text-white p-1 rounded-md hover:bg-gray-700 cursor-pointer"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {flashcards.map((flashcard, i) => (
              <div
                key={i}
                onClick={() => onQuestionSelect(i)}
                className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-colors ${
                  currentIndex === i ? "ring-2 ring-purple-500" : ""
                } ${getIndicatorColor(flashcard)}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionNavigator;
