"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "red" | "green" | "purple";
}

const colorClasses: Record<string, string> = {
  red: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  green: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  purple: "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500",
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "red",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`py-2 px-4 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${colorClasses[confirmColor]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
