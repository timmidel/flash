import { useEffect, useRef, useState } from "react";
import { Flashcard } from "../context/FlashcardContext";

interface FlashcardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onClick: () => void;
  showRationale: boolean;
}

export default function FlashcardComponent({
  flashcard,
  isFlipped,
  onClick,
  showRationale,
}: FlashcardProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number>(120);

  useEffect(() => {
    const updateHeight = () => {
      const frontHeight = frontRef.current?.offsetHeight || 0;
      const backHeight = backRef.current?.offsetHeight || 0;
      const maxHeight = Math.max(frontHeight, backHeight, 120);
      setCardHeight(maxHeight);
    };

    updateHeight();

    // Watch for image load changes (for rationale images)
    const images = backRef.current?.getElementsByTagName("img") || [];
    for (const img of images) {
      img.onload = updateHeight;
    }
  }, [flashcard, showRationale, isFlipped]);

  return (
    <div
      className="relative w-full cursor-pointer"
      onClick={onClick}
      style={{ perspective: "1000px", minHeight: cardHeight }}
    >
      {/* Front and Back Sizing Measurement */}
      <div className="absolute opacity-0 pointer-events-none w-full">
        <div ref={frontRef} className="p-6 flex items-center justify-center">
          <p className="md:text-2xl text-lg text-gray-200 whitespace-pre-wrap mt-5">
            {flashcard.question}
          </p>
          {flashcard.choices.map((choice, index) => (
            <p key={index} className="text-sm text-gray-400 mt-2">
              {choice.letter}. {choice.text}
            </p>
          ))}
        </div>
        <div ref={backRef} className="p-6 flex flex-col space-y-4">
          <p className="text-2xl text-gray-200 whitespace-pre-wrap">
            {flashcard.answer}
          </p>
          {showRationale &&
            (flashcard.rationaleImage ? (
              <div>
                <p className="text-sm text-gray-400 font-semibold mt-5 mb-2">
                  Rationale:
                </p>
                <img
                  src={flashcard.rationaleImage}
                  alt="Rationale"
                  className="mt-2 max-w-full h-auto rounded-lg"
                />
              </div>
            ) : flashcard.rationale ? (
              <div className="w-full text-sm text-gray-400 border-t border-gray-700 pt-2">
                <p className="font-semibold">Rationale:</p>
                <p>{flashcard.rationale}</p>
              </div>
            ) : null)}
        </div>
      </div>

      {/* Actual Flipping Card */}
      <div
        className={`relative transition-transform duration-200 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{ minHeight: cardHeight }}
      >
        {/* Front */}
        <div
          className="bg-gray-800 rounded-lg p-6 backface-hidden flex items-center justify-center min-h-[120px]"
          style={{ minHeight: cardHeight }}
        >
          <p className="md:text-2xl text-lg text-gray-200 whitespace-pre-wrap">
            {flashcard.question}
            {flashcard.choices.map((choice, index) => (
              <p
                key={index}
                className="md:text-2xl text-lg text-gray-200 whitespace-pre-wrap mt-5"
              >
                {choice.letter}. {choice.text}
              </p>
            ))}
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-gray-800 rounded-lg p-6 rotate-y-180 backface-hidden flex flex-col items-start justify-start space-y-4 overflow-y-auto"
          style={{ minHeight: cardHeight }}
        >
          <p className="text-2xl text-gray-200 whitespace-pre-wrap">
            {flashcard.answer}
          </p>

          {showRationale &&
            (flashcard.rationaleImage ? (
              <div className="w-full">
                <p className="text-sm text-gray-400 font-semibold mt-2">
                  Rationale:
                </p>
                <img
                  src={flashcard.rationaleImage}
                  alt="Rationale"
                  className="mt-2 max-w-full h-auto rounded-lg"
                />
              </div>
            ) : flashcard.rationale ? (
              <div className="w-full text-sm text-gray-400 border-t border-gray-700 pt-2">
                <p className="font-semibold">Rationale:</p>
                <p>{flashcard.rationale}</p>
              </div>
            ) : null)}
        </div>
      </div>
    </div>
  );
}
