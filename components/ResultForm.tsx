"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { identifyResult } from "@/lib/games/registry";
import { isResult } from "@/lib/resultStorage";

const ResultForm = () => {
  const [playerName, setPlayerName] = useState("");
  const [shareResult, setShareResult] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const playerNameId = useId();
  const shareResultId = useId();
  const shareInstructionsId = useId();
  const detectionFeedbackId = useId();
  const previewHeadingId = useId();
  const identification = identifyResult(shareResult);
  const preview = identification.status === "valid" ? identification.preview : null;
  const detectionError = identification.status === "invalid" || identification.status === "undetected"
    ? identification.message
    : "";
  const player = playerName.trim();
  const canSubmit = player.length > 0 && preview !== null && !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || !preview) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: player,
          gameName: preview.gameName,
          result: preview.result,
        }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = body && typeof body === "object" &&
          "error" in body && typeof body.error === "string"
          ? body.error : "The server couldn't save this result.";
        setFeedback(message);
        return;
      }
      if (!body || typeof body !== "object" ||
        !("saved" in body) || body.saved !== true ||
        !("savedResult" in body) || !isResult(body.savedResult)) {
        throw new Error("The server returned an invalid result record.");
      }
      setFeedback("Result saved to the database.");
    } catch {
      setFeedback("Couldn't validate or save this result. Your input is still here so you can try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-6 grid min-w-0 grid-cols-1 items-start gap-8 md:grid-cols-2">
    <form className="flex min-w-0 flex-col gap-2" onSubmit={handleSubmit}>
      <label htmlFor={playerNameId}>Player name</label>
      <input
        id={playerNameId}
        name="playerName"
        type="text"
        value={playerName}
        onChange={(event) => {
          setPlayerName(event.target.value);
          setFeedback("");
        }}
        className="rounded border border-zinc-400 px-3 py-2"
        required
        disabled={isSubmitting}
      />
      <label htmlFor={shareResultId} className="mt-2">
        Game result
      </label>
      <p
        id={shareInstructionsId}
        className="text-sm text-zinc-600 dark:text-zinc-400"
      >
        Paste the full share result from a supported game, preserving its original
        text and line breaks. A valid result appears automatically in the preview.
      </p>
      <textarea
        id={shareResultId}
        name="shareResult"
        rows={8}
        value={shareResult}
        onChange={(event) => {
          setShareResult(event.target.value);
          setFeedback("");
        }}
        aria-describedby={`${shareInstructionsId} ${detectionFeedbackId}`}
        aria-invalid={Boolean(detectionError)}
        placeholder="Paste your game's share result here…"
        className="w-full min-w-0 resize-y rounded border border-zinc-400 px-3 py-2"
        required
        disabled={isSubmitting}
      />
      <p id={detectionFeedbackId} role="status" className="text-sm text-red-700 dark:text-red-400">
        {detectionError}
      </p>
      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-3 self-start rounded-lg bg-zinc-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Submitting…" : "Submit result"}
      </button>
      <p role="status">{feedback}</p>
    </form>
    <section aria-labelledby={previewHeadingId} className="min-w-0">
      <h3 id={previewHeadingId} className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        Result preview
      </h3>
      <p role="status" className="sr-only">
        {preview ? `Valid ${preview.gameName} result. Preview available.` : "Waiting for a valid game result."}
      </p>
      {preview ? (
        preview.renderCard(player)
      ) : (
        <div className="flex min-h-64 items-center justify-center rounded-3xl border-2 border-dashed border-zinc-300 px-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Paste a valid game result to see your card here.
        </div>
      )}
    </section>
    </div>
  );
};

export default ResultForm;
