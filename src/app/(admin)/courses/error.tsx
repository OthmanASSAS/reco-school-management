"use client";

import { useEffect } from "react";

export default function CoursesError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="p-6">
      <h1 className="text-red-600 text-xl">Une erreur est survenue</h1>
      <p>{error.message}</p>
      <button onClick={() => reset()} className="mt-4 btn">
        Réessayer
      </button>
    </div>
  );
}
