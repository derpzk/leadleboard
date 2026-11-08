import type { Result } from "@/types/result";
import type { WordleResult } from "@/types/wordle";

// These display fixtures contain guess counts, not full parsed Wordle results.
export const sampleResults: Result<Pick<WordleResult, "guesses">>[] = [
  {
    id: "sample-result-1",
    playerId: "sample-player-a-bot",
    playerName: "A Bot",
    submitTime: "2026-10-15T18:00:00Z",
    gameName: "Wordle",
    datePlayed: "2026-10-15",
    score: null,
    result: { guesses: 6 },
  },
  {
    id: "sample-result-2",
    playerId: "sample-player-noob",
    playerName: "Noob",
    submitTime: "2026-10-15T19:00:00Z",
    gameName: "Wordle",
    datePlayed: "2026-10-15",
    score: null,
    result: { guesses: 5 },
  },
  {
    id: "sample-result-3",
    playerId: "sample-player-zbot",
    playerName: "ZBot",
    submitTime: "2026-10-15T20:00:00Z",
    gameName: "Wordle",
    datePlayed: "2026-10-15",
    score: null,
    result: { guesses: 4 },
  },
];
