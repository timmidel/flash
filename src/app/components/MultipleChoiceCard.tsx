"use client";

import { Flashcard } from "../context/FlashcardContext";

type MultipleChoiceCardProps = {
  card: Flashcard;
  onChoiceSelected: (choice: string) => void;
  showRationale: boolean;
};

const MultipleChoiceCard = ({
  card,
  onChoiceSelected,
  showRationale,
}: MultipleChoiceCardProps) => {
  const handleChoiceClick = (choice: string) => {
    if (!card.isRevealed) {
      onChoiceSelected(choice);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white mt-8">
      <h2 className="md:text-xl md:font-semibold text-lg mb-4 whitespace-pre-wrap">
        {card.question}
      </h2>
      <div className="space-y-2">
        {card.choices?.map((choice) => {
          const isCorrect = choice.letter === card.answer;
          const isSelected = choice.letter === card.selectedAnswer;
          let buttonClass =
            "w-full text-left p-2 rounded-md cursor-pointer transition-colors ";

          if (card.isRevealed) {
            if (isCorrect) {
              buttonClass += "bg-green-500";
            } else if (isSelected) {
              buttonClass += "bg-red-500";
            } else {
              buttonClass += "bg-gray-700";
            }
          } else {
            buttonClass += "bg-gray-700 hover:bg-gray-600";
          }

          return (
            <button
              key={choice.letter}
              onClick={() => handleChoiceClick(choice.letter)}
              className={buttonClass}
              disabled={card.isRevealed}
            >
              {choice.letter}. {choice.text}
            </button>
          );
        })}
      </div>
      {showRationale &&
        card.isRevealed &&
        (card.rationaleImage ? (
          <div className="w-full">
            <p className="text-sm text-gray-400 font-semibold mt-5 mb-2">
              Rationale:
            </p>
            <img
              src={card.rationaleImage}
              alt="Rationale"
              className="mt-2 max-w-full h-auto rounded-lg"
            />
          </div>
        ) : card.rationale ? (
          <div className="w-full text-sm text-gray-400 border-t border-gray-700 pt-2">
            <p className="font-semibold">Rationale:</p>
            <p>{card.rationale}</p>
          </div>
        ) : null)}
    </div>
  );
};

export default MultipleChoiceCard;
