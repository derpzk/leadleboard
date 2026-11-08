import Link from "next/link";
import { Suspense } from "react";
import { io } from "next/cache";
import ResultsGrid from "@/components/ResultsGrid";
import { getResults } from "@/lib/supabase/results";
import type { Result } from "@/types/result";

const SavedResults = async () => {
  // Keep credentials and database reads out of the prerendered page shell.
  await io();

  let entries: Result[];
  try {
    entries = await getResults();
  } catch {
    return <p role="alert">Couldn't load results from the database. Please reload to try again.</p>;
  }

  return <ResultsGrid entries={entries} />;
};

const Results = () => {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12 sm:px-10">
      <Link href="/" className="underline underline-offset-4">Back to home</Link>
      <header className="my-8">
        <h1 className="text-3xl font-bold">All results</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Submitted plays from the shared database, newest first.
        </p>
      </header>
      <Suspense fallback={<p role="status">Loading results…</p>}>
        <SavedResults />
      </Suspense>
    </main>
  );
};

export default Results;
