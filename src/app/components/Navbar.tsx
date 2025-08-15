"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Folder } from "../types/folder";

interface NavbarProps {
  user: User | null | undefined;
  currentFolder: Folder | null;
  setCurrentFolder: (folder: Folder | null) => void;
}

export default function Navbar({
  user,
  currentFolder,
  setCurrentFolder,
}: NavbarProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  if (!user) return null;

  return (
    <nav className="bg-gray-800/50 text-white p-4 flex justify-between items-center">
      <button onClick={toggleSidebar} className="p-2 cursor-pointer">
        <Menu />
      </button>

      {/* Sidebar container */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 w-80 bg-gray-900 transform transition-transform duration-300 ease-in-out z-50 shadow-lg ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          userId={user.id}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
        />
      </div>

      <div className="flex items-center">
        {user ? (
          <button
            onClick={handleLogout}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
