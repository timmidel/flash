"use client";

import { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import * as mammoth from "mammoth";
import { supabase } from "./lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import {
  createDocument,
  deleteDocument,
  getRecentDocumentsByUser,
} from "./services/documentService";
import { Trash2 } from "lucide-react";
import QuizTypeSelectionModal from "./components/QuizTypeSelectionModal";
import {
  createRationaleImage,
  extractImages,
} from "./services/rationaleImageService";
import Spinner from "./components/Spinner";
import { preprocessHtml, saveItemData } from "./services/extractorService";
import { Folder } from "./types/folder";
import { Document } from "./types/document";
import Navbar from "./components/Navbar";
import ConfirmationModal from "./components/ConfirmationModal";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [flag, setFlag] = useState("Answer:");
  const [rationaleFlag, setRationaleFlag] = useState("Rationale:");
  const [dragged, setDragged] =
    useState<React.DragEvent<HTMLDivElement> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined); // Add 'undefined' for loading state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isQuizTypeModalOpen, setIsQuizTypeModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateModalData, setGenerateModalData] = useState<{
    documentId: string;
    rationaleImageIndices: number[];
  } | null>(null);
  const [selectedDocIdForQuiz, setSelectedDocIdForQuiz] = useState<
    string | null
  >(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  const fetchDocuments = async () => {
    if (!user) return;
    try {
      const recentDocuments = await getRecentDocumentsByUser(user.id);
      setDocuments(recentDocuments || []);
    } catch (error) {
      console.log("Error fetching documents:", error);
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (documentToDelete) {
      try {
        await deleteDocument(documentToDelete);
        fetchDocuments(); // Refresh the document list
        toast.success("Document deleted successfully.");
      } catch (error) {
        toast.error("Failed to delete document.");
        console.error("Delete error:", error);
      }
      closeModal();
    }
  };

  const openModal = (docId: string) => {
    setDocumentToDelete(docId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDocumentToDelete(null);
  };

  if (user === undefined) {
    return <Spinner />;
  }

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

  const generateRationale = async (
    documentId: string,
    rationaleImageIndices: number[]
  ) => {
    const res = await fetch("/api/generate-rationale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, rationaleImageIndices }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  };

  const saveDocument = async (content: string, arrayBuffer: ArrayBuffer) => {
    try {
      const newDoc = await createDocument({
        title: file?.name || "Untitled Document",
        content,
        answer_flag: flag,
        rationale_flag: rationaleFlag,
        folder_id: currentFolder?.id || null,
        user_id: user?.id,
      });
      const extractedImages = await extractImages(arrayBuffer, rationaleFlag);
      if (extractedImages.length > 0) {
        for (const { file, rationaleIndex } of extractedImages) {
          const uploadResult = await createRationaleImage(
            {
              document_id: newDoc.id,
              rationale_index: rationaleIndex,
              image_url: "",
            },
            file
          );
          if (!uploadResult) {
            toast.error("Failed to upload rationale image.");
            return;
          }
        }
      }
      if (newDoc) {
        const { questionCount, rationaleCount } = await saveItemData(
          newDoc.id,
          content,
          flag,
          rationaleFlag
        );
        if (rationaleCount + extractedImages.length < questionCount) {
          const rationaleImageIndices = extractedImages.map(
            (img) => img.rationaleIndex
          );
          setGenerateModalData({
            documentId: newDoc.id,
            rationaleImageIndices,
          });
          setIsGenerateModalOpen(true);
        }
        toast.success("Document saved successfully.");
        setFile(null);
        await fetchDocuments();
      }
    } catch (error) {
      toast.error("Failed to save document." + error);
    } finally {
      setGenerating(false);
    }
  };

  const generateFlashcards = async () => {
    if (!file) {
      toast.error("Please upload a Word document.");
      return;
    }
    setGenerating(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const arrayBuffer = e.target.result as ArrayBuffer;
        const html = await mammoth.convertToHtml({ arrayBuffer });
        const preprocessedText = preprocessHtml(html.value);
        await saveDocument(preprocessedText, arrayBuffer);
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

  const handleDocumentClick = (docId: string) => {
    setSelectedDocIdForQuiz(docId);
    setIsQuizTypeModalOpen(true);
  };

  return loading ? (
    <Spinner />
  ) : (
    user && (
      <div
        className="flex h-screen bg-gray-900 text-gray-200"
        id="app-container"
      >
        <div className="flex-1 flex flex-col ">
          <Navbar
            user={user}
            currentFolder={currentFolder}
            setCurrentFolder={setCurrentFolder}
            newDocuments={documents}
            fetchRecentDocuments={fetchDocuments}
            handleDocumentClick={handleDocumentClick}
          />
          <main className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto mt-5">
              <h1 className="text-3xl md:text-4xl text-center font-extrabold text-purple-400">
                Flashcard Generator
              </h1>

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
                    <p className="text-xs text-gray-500 mb-3">
                      DOCX up to 10MB
                    </p>
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
                  <label
                    htmlFor="rationale-flag"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Rationale Flag
                  </label>
                  <div className="mt-1">
                    <input
                      id="rationale-flag"
                      name="rationale-flag"
                      type="text"
                      value={rationaleFlag}
                      onChange={(e) => setRationaleFlag(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    onClick={generateFlashcards}
                    disabled={generating}
                    className={`w-full flex justify-center cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      generating
                        ? "bg-gray-500"
                        : "bg-purple-600 hover:bg-purple-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-4`}
                  >
                    {generating ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
              <div className="mt-12">
                <h2 className="text-2xl font-extrabold text-purple-400 mb-4">
                  Recent Documents
                </h2>
                <ul className="space-y-4">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc.id)}
                      className="bg-gray-800 p-4 rounded-lg cursor-pointer flex justify-between items-center transition-transform duration-200 hover:scale-101 hover:bg-gray-700"
                    >
                      <div>
                        <p className="text-white font-semibold">{doc.title}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(doc.id);
                        }}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="z-10" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Toaster position="top-right" />
            <ConfirmationModal
              title="Delete Document"
              isOpen={isModalOpen}
              onClose={closeModal}
              onConfirm={confirmDelete}
              message="Are you sure you want to delete this document?"
            />
            <ConfirmationModal
              title="Incomplete Rationale"
              isOpen={isGenerateModalOpen}
              onClose={() => setIsGenerateModalOpen(false)}
              onConfirm={() => {
                if (generateModalData) {
                  generateRationale(
                    generateModalData.documentId,
                    generateModalData.rationaleImageIndices
                  );
                }
                setIsGenerateModalOpen(false);
              }}
              message={`Some questions do not have a rationale. Do you want to auto-generate them?`}
              confirmColor="purple"
            />
            <QuizTypeSelectionModal
              isOpen={isQuizTypeModalOpen}
              onClose={() => setIsQuizTypeModalOpen(false)}
              docId={selectedDocIdForQuiz}
            />
          </main>
        </div>
      </div>
    )
  );
}
