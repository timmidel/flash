"use client";

import { useState, useRef, useEffect } from "react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface KebabMenuProps {
  onDelete: () => void;
  onMove: () => void;
  deleteTitle: string;
  deleteMessage: string;
}

export default function KebabMenu({
  onDelete,
  onMove,
  deleteTitle,
  deleteMessage,
}: KebabMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative inline-block text-left w-12">
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
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
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
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
              role="menuitem"
            >
              Move
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevents the click from reaching <li>
                setIsModalOpen(true);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-white cursor-pointer"
              role="menuitem"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      <DeleteConfirmationModal
        title={deleteTitle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(e) => {
          e?.stopPropagation?.(); // prevent bubbling to parent <li>
          onDelete();
          setIsModalOpen(false);
        }}
        message={deleteMessage}
      />
    </div>
  );
}
