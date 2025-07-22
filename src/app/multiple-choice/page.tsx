"use client";

import { Suspense } from "react";
import MultipleChoice from "./MultipleChoice";

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MultipleChoice />
    </Suspense>
  );
}
