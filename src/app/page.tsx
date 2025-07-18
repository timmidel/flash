"use client";

import { useState, useContext, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import * as mammoth from "mammoth";
import { FlashcardContext } from "./context/FlashcardContext";
import { supabase } from "./lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [flag, setFlag] = useState("Answer:");
  const [dragged, setDragged] =
    useState<React.DragEvent<HTMLDivElement> | null>(null);
  const context = useContext(FlashcardContext);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined); // Add 'undefined' for loading state

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Optional: do an initial check right away
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
      </div>
    );
  }

  if (!context) {
    return null;
  }

  const { setFlashcards } = context;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (e.target.files.length === 0) {
        toast.error("Please select a file.");
        return;
      }
      if (e.target.files[0].size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit.");
        return;
      }
      if (
        e.target.files[0].type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        toast.error("Please upload a valid DOCX file.");
        return;
      }
      setDragged(null);
      setFile(e.target.files[0]);
    }
  };

  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlag(e.target.value);
  };

  const generateFlashcards = async () => {
    if (!file) {
      toast.error("Please upload a Word document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const arrayBuffer = e.target.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        const lines = text.split("\n");
        const newFlashcards: { question: string; answer: string }[] = [];
        let currentQuestion = "";

        for (const line of lines) {
          if (line.includes(flag)) {
            const parts = line.split(flag);
            const question = currentQuestion.trim();
            const answer = parts[1].trim();
            if (question) {
              newFlashcards.push({ question, answer });
            }
            currentQuestion = "";
          } else {
            currentQuestion += line + "\n";
          }
        }

        setFlashcards(newFlashcards);
        router.push("/flashcards");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragged(e);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragged(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragged(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    user && (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-purple-400">
              Flashcard Generator
            </h1>
            <button
              onClick={handleLogout}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Logout
            </button>
          </div>
          <div className="mt-8 space-y-6">
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all cursor-pointer ${
                dragged ? "border-purple-500" : "border-gray-600"
              } hover:border-purple-500`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".docx"
              />

              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-400 justify-center">
                  <span className="font-medium text-purple-400">
                    Upload a file
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">DOCX up to 10MB</p>
                {file && (
                  <p className="text-sm text-gray-300 font-semibold">
                    {file.name}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="flag"
                className="block text-sm font-medium text-gray-300"
              >
                Answer Flag
              </label>
              <div className="mt-1">
                <input
                  id="flag"
                  name="flag"
                  type="text"
                  value={flag}
                  onChange={handleFlagChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <button
                onClick={generateFlashcards}
                className="w-full flex justify-center cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Generate Flashcards
              </button>
            </div>
          </div>
        </div>
        <Toaster position="top-right" />
      </div>
    )
  );
}
