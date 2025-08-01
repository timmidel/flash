import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flash!",
  description: "A document parser for flashcards generation",
};

import { FlashcardProvider } from "./context/FlashcardContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <FlashcardProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-200`}
        >
          {children}
        </body>
      </FlashcardProvider>
    </html>
  );
}