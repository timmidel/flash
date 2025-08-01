"use client";

import { useEffect, useState } from "react";
import {
  createFolder,
  getFoldersByUser,
  deleteFolder,
} from "../services/folderService";
import toast from "react-hot-toast";

interface Folder {
  id: string;
  name: string;
  user_id: string;
  parent_folder_id?: string | null;
  created_at?: string;
}

interface SidebarProps {
  userId: string;
}

export default function Sidebar({ userId }: SidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFolders = async () => {
    try {
      const data = await getFoldersByUser(userId);
      setFolders(data);
    } catch (err) {
      console.error("Error fetching folders:", err);
      toast.error("Failed to load folders");
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [userId]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      setLoading(true);
      await createFolder({ name: newFolderName, user_id: userId });
      setNewFolderName("");
      await fetchFolders(); // Refresh folder list
    } catch (err) {
      console.error("Error creating folder:", err);
      toast.error("Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFolder(id);
      await fetchFolders();
    } catch (err) {
      console.error("Error deleting folder:", err);
      toast.error("Failed to delete folder");
    }
  };

  return (
    <div className="fixed top-0 left-0 h-screen transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-gray-900 text-white p-4 space-y-6 shadow-lg overflow-y-auto z-50 border-2 border-gray-800">
      <h2 className="text-xl font-bold mb-2">📁 My Folders</h2>

      <div className="flex gap-2">
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
          className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
        >
          {loading ? "..." : "Add"}
        </button>
      </div>
      <ul className="space-y-2">
        {folders.map((folder) => (
          <li
            key={folder.id}
            className="flex justify-between items-center bg-gray-800 p-2 rounded"
          >
            <span>{folder.name}</span>
            <button
              onClick={() => handleDelete(folder.id)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
