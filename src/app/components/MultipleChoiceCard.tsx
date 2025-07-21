"use client";

import { Flashcard } from '../context/FlashcardContext';

type MultipleChoiceCardProps = {
  card: Flashcard;
  onChoiceSelected: (choice: string) => void;
};

const MultipleChoiceCard = ({ card, onChoiceSelected }: MultipleChoiceCardProps) => {
  const handleChoiceClick = (choice: string) => {
    if (!card.isRevealed) {
      onChoiceSelected(choice);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-bold mb-4">{card.question}</h2>
      <div className="space-y-2">
        {card.choices?.map((choice) => {
          const isCorrect = choice.letter === card.answer;
          const isSelected = choice.letter === card.selectedAnswer;
          let buttonClass = "w-full text-left p-2 rounded-md ";

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
    </div>
  );
};

export default MultipleChoiceCard;
