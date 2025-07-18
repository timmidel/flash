import { Flashcard } from "../context/FlashcardContext";

interface FlashcardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onClick: () => void;
}

export default function FlashcardComponent({
  flashcard,
  isFlipped,
  onClick,
}: FlashcardProps) {
  // Create a hidden element to measure the maximum height needed
  const measureContent = (content: string) => {
    return (
      <div className="invisible absolute pointer-events-none bg-gray-800 rounded-lg p-6 flex items-center justify-center min-h-[120px] w-full">
        <p className="text-2xl text-gray-200 whitespace-pre-wrap text-center">
          {content}
        </p>
      </div>
    );
  };

  return (
    <div
      className="relative w-full cursor-pointer"
      onClick={onClick}
      style={{ perspective: "1000px" }}
    >
      {/* Hidden elements to measure content */}
      {measureContent(flashcard.question)}
      {measureContent(flashcard.answer)}

      <div
        className={`relative transition-transform duration-100 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="bg-gray-800 rounded-lg p-6 backface-hidden flex items-center justify-center min-h-[120px]">
          <p className="text-2xl text-gray-200 whitespace-pre-wrap">
            {flashcard.question}
          </p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 bg-gray-800 rounded-lg p-6 rotate-y-180 backface-hidden flex items-center justify-center">
          <p className="text-2xl text-gray-200 whitespace-pre-wrap">
            {flashcard.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
