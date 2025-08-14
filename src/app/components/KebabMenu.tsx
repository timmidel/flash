"use client";

import { useState } from "react";

interface KebabMenuProps {
  onDelete: () => void;
  onMove: () => void;
}

export default function KebabMenu({ onDelete, onMove }: KebabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md p-2  text-xl font-medium text-white focus:outline-none focus:ring-0 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // prevents the click from reaching <li>
            toggleMenu();
          }}
        >
          ⋮
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevents the click from reaching <li>
                onMove();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              role="menuitem"
            >
              Move
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevents the click from reaching <li>
                onDelete();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-white"
              role="menuitem"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
