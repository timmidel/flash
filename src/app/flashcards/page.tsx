"use client";

import { Suspense } from "react";
import Flashcards from "./FlashCards";
import Spinner from "../components/Spinner";

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Flashcards />
    </Suspense>
  );
}
