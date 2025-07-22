"use client";

import { Suspense } from "react";
import Flashcards from "./FlashCards";

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Flashcards />
    </Suspense>
  );
}
