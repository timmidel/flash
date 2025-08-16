"use client";

import React from "react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = "Generating rationales...",
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin"></div>
        {/* Optional message */}
        <p className="text-white text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
