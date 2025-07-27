import React from "react";
interface SpinnerProps {
  children?: React.ReactNode;
}

const Spinner = ({ children }: SpinnerProps) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 space-y-4">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
    {children && (
      <div className="text-center text-2xl font-semibold text-purple-500 animate-pulse">
        {children}
      </div>
    )}
  </div>
);

export default Spinner;
