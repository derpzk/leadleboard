import type { Result } from "@/types/result";

const isResult = (value: unknown): value is Result => {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<Result>;
  return typeof record.id === "string" && typeof record.playerId === "string" &&
    typeof record.gameName === "string" && typeof record.datePlayed === "string" &&
    typeof record.submitTime === "string" &&
    Number.isFinite(Date.parse(record.submitTime)) &&
    (record.score === null || (typeof record.score === "number" && Number.isFinite(record.score))) &&
    (record.playerName === undefined || typeof record.playerName === "string") &&
    "result" in record;
};

const storageKey = "leadleboard.results.v1";
const legacyStorageKey = "battledle.results.v1";

export const loadResults = (): Result[] => {
  const currentStored = localStorage.getItem(storageKey);
  const stored = currentStored ?? localStorage.getItem(legacyStorageKey);
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) {
    throw new Error("Saved results have an unsupported format.");
  }

  let migrated = false;
  const entries: unknown[] = parsed.map((entry: unknown) => {
    if (entry && typeof entry === "object" && "record" in entry && isResult(entry.record)) {
      migrated = true;
      const playerName = "playerName" in entry && typeof entry.playerName === "string"
        ? entry.playerName : entry.record.playerName;
      return { ...entry.record, ...(playerName === undefined ? {} : { playerName }) };
    }
    return entry;
  });

  if (!entries.every(isResult)) {
    throw new Error("Saved results have an unsupported format.");
  }

  // Preserve existing submissions while removing the old envelope/share text.
  if (migrated || currentStored === null) {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }
  return entries;
};

export const saveResult = (entry: Result): "saved" | "duplicate" => {
  if (!isResult(entry)) throw new Error("Cannot save an invalid result record.");
  const entries = loadResults();
  // For Wordle, the puzzle date uniquely identifies the puzzle.
  const duplicate = entries.some((saved) =>
    saved.playerId === entry.playerId &&
    saved.gameName === entry.gameName &&
    saved.datePlayed === entry.datePlayed
  );
  if (duplicate) return "duplicate";

  localStorage.setItem(storageKey, JSON.stringify([...entries, entry]));
  return "saved";
};
