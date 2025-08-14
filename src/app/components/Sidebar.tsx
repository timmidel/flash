"use client";

import { useEffect, useState } from "react";
import {
  createFolder,
  getFoldersByUser,
  deleteFolder,
  getFolderById,
} from "../services/folderService";
import toast from "react-hot-toast";
import KebabMenu from "./KebabMenu";
import { ChevronLeft, Folder as FolderIcon, File } from "lucide-react";
import { Folder } from "../types/folder";
import { Document } from "../types/document";
import { getDocumentsByUser } from "../services/documentService";

interface SidebarProps {
  userId: string;
  currentFolder: Folder | null;
  setCurrentFolder: (folder: Folder | null) => void;
}

export default function Sidebar({
  userId,
  currentFolder,
  setCurrentFolder,
}: SidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [switchingFolder, setSwitchingFolder] = useState(false);
  const [parentFolder, setParentFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const fetchFolders = async () => {
    try {
      setSwitchingFolder(true);
      const data = await getFoldersByUser(userId, currentFolder?.id || null);
      setFolders(data);
    } catch (err) {
      console.error("Error fetching folders:", err);
      toast.error("Failed to load folders");
    } finally {
      setSwitchingFolder(false);
    }
  };

  const fetchDocuments = async () => {
    setSwitchingFolder(true);
    if (!userId) return;
    try {
      const userDocuments = await getDocumentsByUser(
        userId,
        currentFolder?.id || null
      );
      setDocuments(userDocuments || []);
    } catch (error) {
      console.log("Error fetching documents:", error);
      toast.error("Failed to fetch documents.");
    } finally {
      setSwitchingFolder(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchDocuments();
  }, [userId, currentFolder]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      setLoading(true);
      await createFolder({
        name: newFolderName,
        user_id: userId,
        parent_id: currentFolder?.id || null,
      });
      setNewFolderName("");
      await fetchFolders(); // Refresh folder list
    } catch (err) {
      console.error("Error creating folder:", err);
      toast.error("Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    console.log(currentFolder, parentFolder);
    try {
      await deleteFolder(id);
      await fetchFolders();
      console.log(currentFolder, parentFolder);
    } catch (err) {
      console.error("Error deleting folder:", err);
      toast.error("Failed to delete folder");
    }
  };

  const handleMove = (id: string) => {
    console.log("Move folder:", id);
    toast.success("Move functionality to be implemented.");
  };

  const handleFolderClick = async (folder: Folder | null) => {
    const parent = await getParent(folder?.parent_id || null);
    setSwitchingFolder(true);
    setParentFolder(parent);
    setCurrentFolder(folder);
  };

  const handleBack = async () => {
    setSwitchingFolder(true);
    setCurrentFolder(parentFolder);
    const grandparent = parentFolder?.parent_id
      ? await getParent(parentFolder.parent_id)
      : null;
    setParentFolder(grandparent);
  };

  const getParent = async (parentId: string | null) => {
    if (!parentId) {
      return null;
    }
    try {
      const folder = await getFolderById(parentId);
      return folder || null;
    } catch (err) {
      console.error("Error fetching parent folder:", err);
      toast.error("Failed to load parent folder");
    }
  };

  const handleDeleteFile = (id: string) => {
    console.log("Delete file:", id);
    toast.success("Delete functionality to be implemented.");
  };

  return (
    <div className="fixed top-0 left-0 h-screen transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-gray-900 text-white space-y-6 shadow-lg overflow-y-auto z-50 border-2 border-gray-800">
      <div className="flex gap-3 py-5 px-3">
        {currentFolder && (
          <span className="cursor-pointer">
            <ChevronLeft onClick={handleBack} className="mt-0.5" />
          </span>
        )}
        <h2 className="text-xl font-bold">
          {currentFolder?.name || "📁 My Vault"}
        </h2>
      </div>
      <div className="flex gap-2 px-2">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name"
          className="flex-1 px-2 py-1 rounded bg-gray-800 text-white border border-gray-700"
        />
        <button
          onClick={handleCreateFolder}
          disabled={loading}
          className={
            loading
              ? "bg-gray-700 text-gray-300 px-3 py-1 rounded text-sm cursor-pointer"
              : " bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm cursor-pointer"
          }
        >
          Add
        </button>
      </div>
      {!switchingFolder && (
        <ul className="space-y-2">
          {folders.map((folder) => (
            <li
              key={folder.id}
              className="flex justify-between items-center hover:bg-gray-800 transition-all px-4 rounded cursor-pointer"
              onClick={() => handleFolderClick(folder)}
            >
              <div className="flex gap-3">
                <FolderIcon className="text-purple-400" />
                <span>{folder.name}</span>
              </div>

              <KebabMenu
                onDelete={() => handleDeleteFolder(folder.id)}
                onMove={() => handleMove(folder.id)}
              />
            </li>
          ))}
          {documents.map((document: Document) => (
            <li
              key={document.id}
              className="flex justify-between items-center hover:bg-gray-800 transition-all px-4 rounded cursor-pointer"
            >
              <div className="flex gap-3">
                <File className="text-purple-400" />
                <span>{document.title}</span>
              </div>

              <KebabMenu
                onDelete={() => handleDeleteFile(document.id)}
                onMove={() => handleMove(document.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
