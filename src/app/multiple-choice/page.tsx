"use client";

import { Suspense } from "react";
import MultipleChoice from "./MultipleChoice";
import Spinner from "../components/Spinner";

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <MultipleChoice />
    </Suspense>
  );
}
