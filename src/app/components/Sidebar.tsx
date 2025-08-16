"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  createFolder,
  getFoldersByUser,
  deleteFolder,
  getFolderById,
  updateFolder,
} from "../services/folderService";
import toast from "react-hot-toast";
import KebabMenu from "./KebabMenu";
import { ChevronLeft, Folder as FolderIcon, File } from "lucide-react";
import { Folder } from "../types/folder";
import { Document } from "../types/document";
import {
  deleteDocument,
  getDocumentsByUser,
  updateDocument,
} from "../services/documentService";
import { useDrag, useDrop, useDragLayer } from "react-dnd";

interface SidebarProps {
  userId: string;
  currentFolder: Folder | null;
  setCurrentFolder: (folder: Folder | null) => void;
  newDocuments: Document[] | [];
  fetchRecentDocuments: () => Promise<void>;
  handleDocumentClick: (docId: string) => void;
}
interface DroppableFolderProps {
  folder: Folder;
  onDropInside: (folder: DraggedFolder | DraggedFile, folderId: string) => void;
  children?: ReactNode;
}
interface DraggableFolderProps {
  folder: Folder;
  onClick?: () => void;
}

interface DraggedFolder {
  id: string;
  type: typeof ItemTypes.FOLDER;
}

interface DraggedFile {
  id: string;
  type: typeof ItemTypes.FILE;
}

const ItemTypes = {
  FOLDER: "FOLDER",
  FILE: "FILE",
};

export default function Sidebar({
  userId,
  currentFolder,
  setCurrentFolder,
  newDocuments,
  fetchRecentDocuments,
  handleDocumentClick,
}: SidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [switchingFolder, setSwitchingFolder] = useState(false);
  const [parentFolder, setParentFolder] = useState<Folder | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const fetchFolders = async () => {
    try {
      const data = await getFoldersByUser(userId, currentFolder?.id || null);
      setFolders(data);
    } catch (err) {
      console.error("Error fetching folders:", err);
      toast.error("Failed to load folders");
    }
  };

  const fetchDocuments = async () => {
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
    }
  };

  const fetchData = async () => {
    setSwitchingFolder(true);
    await fetchFolders();
    await fetchDocuments();
    setSwitchingFolder(false);
  };

  useEffect(() => {
    fetchData();
  }, [userId, currentFolder]);

  useEffect(() => {
    fetchDocuments();
  }, [newDocuments]);

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

  const handleMove = async (id: string) => {
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

  const handleDeleteFile = async (id: string) => {
    try {
      await deleteDocument(id);
      await fetchDocuments();
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document");
    }
  };

  function DraggableFolder({ folder, onClick }: DraggableFolderProps) {
    const [{ isDragging }, dragRef] = useDrag(() => ({
      type: ItemTypes.FOLDER,
      item: { id: folder.id, type: ItemTypes.FOLDER },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    return (
      <li
        ref={dragRef as unknown as React.Ref<HTMLLIElement>}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        className="flex justify-between items-center hover:bg-gray-800 pl-4 rounded cursor-pointer"
        onClick={onClick}
      >
        <div className="flex gap-3">
          <FolderIcon className="text-purple-400" />
          <span>{folder.name}</span>
        </div>
        <KebabMenu
          onDelete={async () => {
            await handleDeleteFolder(folder.id);
            await fetchRecentDocuments();
          }}
          onMove={async () => {
            await handleMove(folder.id);
            await fetchRecentDocuments();
          }}
          deleteTitle={"Delete Folder"}
          deleteMessage={`Are you sure you want to delete the folder "${folder.name}"?`}
        />
      </li>
    );
  }

  function DraggableFile({ file }: { file: Document }) {
    const [{ isDragging }, dragRef] = useDrag(() => ({
      type: ItemTypes.FILE,
      item: { id: file.id, type: ItemTypes.FILE },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    return (
      <li
        ref={dragRef as unknown as React.Ref<HTMLLIElement>}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        onClick={() => handleDocumentClick(file.id)}
        className="flex justify-between items-center hover:bg-gray-800 pl-4 rounded cursor-pointer"
      >
        <div className="flex gap-3">
          <File className="text-purple-400" />
          <span>{file.title}</span>
        </div>
        <KebabMenu
          onDelete={async () => {
            await handleDeleteFile(file.id);
            await fetchRecentDocuments();
          }}
          onMove={async () => {
            await handleMove(file.id);
            await fetchRecentDocuments();
          }}
          deleteTitle={"Delete Document"}
          deleteMessage={`Are you sure you want to delete the document "${file.title}"?`}
        />
      </li>
    );
  }

  function DroppableFolder({
    folder,
    onDropInside,
    children,
  }: DroppableFolderProps) {
    const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
      accept: [ItemTypes.FOLDER, ItemTypes.FILE],
      drop: (item) => {
        onDropInside(item, folder.id);
      },
      canDrop: (item: DraggedFile | DraggedFolder) => item.id !== folder.id, // prevent dropping into itself
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }));

    return (
      <div
        ref={dropRef as unknown as React.Ref<HTMLDivElement>}
        className={` rounded ${
          isOver && canDrop ? "bg-purple-700" : "hover:bg-gray-800"
        }`}
      >
        {children}
      </div>
    );
  }

  function DroppableParentFolder({
    onDropInside,
  }: {
    onDropInside: (
      folder: DraggedFolder | DraggedFile,
      folderId: string | null
    ) => void;
  }) {
    const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
      accept: [ItemTypes.FOLDER, ItemTypes.FILE],
      drop: (item) => {
        onDropInside(item, currentFolder?.parent_id || null);
      },
      canDrop: (item: DraggedFile | DraggedFolder) =>
        item.id !== currentFolder?.id, // prevent dropping into itself
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }));

    return (
      <div
        className={`flex gap-3 py-5 px-3 mb-2 ${
          isOver && canDrop ? "bg-purple-700" : ""
        }`}
        ref={dropRef as unknown as React.Ref<HTMLDivElement>}
      >
        <span className="cursor-pointer">
          <ChevronLeft onClick={handleBack} className="mt-0.5" />
        </span>
        <h2 className="text-xl font-bold">{currentFolder?.name}</h2>
      </div>
    );
  }

  const handleDropInside = async (
    item: DraggedFolder | DraggedFile,
    targetFolderId: string | null
  ) => {
    if (item.type === ItemTypes.FOLDER) {
      // Handle folder drop
      const folder = folders.find((f) => f.id === item.id);
      if (!folder) return;

      try {
        await updateFolder(folder.id, {
          name: folder.name,
          parent_id: targetFolderId,
        });
        console.log("UPDATED FOLDER" + folder.name, folder.id, targetFolderId);
        await fetchFolders();
      } catch (err) {
        console.error("Error moving folder:", err);
        toast.error("Failed to move folder");
      }
    } else if (item.type === ItemTypes.FILE) {
      // Handle file drop
      const document = documents.find((d) => d.id === item.id);
      if (!document) return;
      try {
        await updateDocument(document.id, { folder_id: targetFolderId });
        await fetchDocuments();
      } catch (err) {
        console.error("Error moving file:", err);
        toast.error("Failed to move file");
      }
    }
    console.log("Dropped item:", item, "into folder:", targetFolderId);
  };

  function CustomDragLayer() {
    const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
      isDragging: monitor.isDragging(),
      item: monitor.getItem(),
      currentOffset: monitor.getSourceClientOffset(),
    }));
    let name = "";
    if (item) {
      if (item.type === ItemTypes.FOLDER) {
        const folder = folders.find((f) => f.id === item.id);
        name = folder ? folder.name : "Unknown Folder";
      } else if (item.type === ItemTypes.FILE) {
        const file = documents.find((d) => d.id === item.id);
        name = file ? file.title : "Unknown File";
      }
    }

    if (!isDragging || !currentOffset) return null;

    const { x, y } = currentOffset;

    return (
      <div
        style={{
          position: "fixed",
          pointerEvents: "none",
          left: 0,
          top: 0,
          transform: `translate(${x}px, ${y}px)`,
          zIndex: 1000,
        }}
        className="flex gap-2"
      >
        <FolderIcon className="text-purple-400 w-7" /> {name}
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white space-y-6 shadow-lg overflow-y-auto z-50 border-2 border-gray-800">
      {currentFolder ? (
        <DroppableParentFolder onDropInside={handleDropInside} />
      ) : (
        <h2 className="text-xl font-bold py-5 px-4 mb-2">🗃️ My Vault</h2>
      )}
      <div className="flex gap-2 px-2">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          maxLength={30}
          placeholder="New folder name"
          className="flex-1 px-2 py-1 rounded bg-gray-800 text-white border border-gray-700"
        />
        <button
          onClick={handleCreateFolder}
          disabled={loading}
          className={
            loading
              ? "bg-gray-700 text-gray-300 px-3 py-1 rounded text-sm cursor-pointer w-full"
              : " bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm cursor-pointer w-full"
          }
        >
          Add
        </button>
      </div>
      {!switchingFolder && (
        <ul className="space-y-2">
          {folders.map((folder) => (
            <DroppableFolder
              key={folder.id}
              folder={folder}
              onDropInside={handleDropInside}
            >
              <DraggableFolder
                folder={folder}
                onClick={() => handleFolderClick(folder)}
              />
            </DroppableFolder>
          ))}

          {documents.map((document) => (
            <DraggableFile key={document.id} file={document} />
          ))}
        </ul>
      )}
      <CustomDragLayer />
    </div>
  );
}
