"use client";

import { useRouter } from "next/navigation";

type QuizTypeSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  docId: string | null;
  flag: string | null;
  rationaleFlag: string | null;
};

const QuizTypeSelectionModal = ({
  isOpen,
  onClose,
  docId,
  flag,
  rationaleFlag,
}: QuizTypeSelectionModalProps) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSelectQuizType = (type: "classic" | "multiple-choice") => {
    if (docId && flag) {
      if (type === "classic") {
        router.push(
          `/flashcards?docId=${docId}&flag=${encodeURIComponent(flag)}&rationaleFlag=${encodeURIComponent(rationaleFlag)}`
        );
      } else {
        router.push(
          `/multiple-choice?docId=${docId}&flag=${encodeURIComponent(flag)}&rationaleFlag=${encodeURIComponent(rationaleFlag)}`
        );
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm mx-auto">
        <h3 className="text-lg font-bold text-white mb-4">Select Quiz Type</h3>
        <div className="space-y-4">
          <button
            onClick={() => handleSelectQuizType("classic")}
            className="w-full py-2 px-4 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Classic Flashcards
          </button>
          <button
            onClick={() => handleSelectQuizType("multiple-choice")}
            className="w-full py-2 px-4 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Multiple Choice
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 cursor-pointer border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizTypeSelectionModal;
