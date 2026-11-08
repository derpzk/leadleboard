import type { WordleResult } from "@/types/wordle";
import { Game } from "@/lib/games/Game";

export class WordleGame extends Game<WordleResult> {
  readonly gameName = "Wordle";

  // Recognition selects a possible game; parsing still validates the full result.
  recognizes(text: string): boolean {
    return /^Wordle\s/.test(text.trim());
  }

  // Supports solved and unsuccessful results in the standard tile palette.
  parse(text: string): WordleResult | null {
    if (!this.recognizes(text)) {
      return null;
    }

    const lines = text.trim().replaceAll("\r\n", "\n").split("\n");
    const match = lines[0].match(
      /^Wordle ([1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+) ([1-6]|X)\/6\*?$/,
    );

    if (!match) {
      return null;
    }

    const puzzleNumber = Number(match[1].replaceAll(",", ""));
    const won = match[2] !== "X";
    const guesses = won ? Number(match[2]) : 6;
    const grid = lines.slice(1);

    // A single blank line may separate the header and grid.
    if (grid[0] === "") {
      grid.shift();
    }

    const result = this.validateResult({ puzzleNumber, guesses, grid });
    if (result === null || (grid[grid.length - 1] === "🟩🟩🟩🟩🟩") !== won) {
      return null;
    }

    return result;
  }

  validateResult(value: unknown): WordleResult | null {
    if (!value || typeof value !== "object") return null;
    const result = value as Partial<WordleResult>;
    const { puzzleNumber, guesses, grid } = result;
    if (
      typeof puzzleNumber !== "number" || !Number.isSafeInteger(puzzleNumber) || puzzleNumber < 1 ||
      typeof guesses !== "number" || !Number.isInteger(guesses) || guesses < 1 || guesses > 6 ||
      !Array.isArray(grid) || grid.length !== guesses ||
      !grid.every((row) => typeof row === "string" && /^[⬛⬜🟨🟩]{5}$/u.test(row))
    ) {
      return null;
    }

    const winningRow = "🟩🟩🟩🟩🟩";
    if (
      (grid[grid.length - 1] !== winningRow && guesses !== 6) ||
      grid.slice(0, -1).includes(winningRow)
    ) {
      return null;
    }

    return { puzzleNumber, guesses, grid: [...grid] };
  }

  dayPlayed(result: WordleResult): string | null {
    if (!Number.isSafeInteger(result.puzzleNumber) || result.puzzleNumber < 0) {
      return null;
    }

    // Puzzle #0 was June 19, 2021. JavaScript month indexes start at zero.
    const firstPuzzleDate = Date.UTC(2021, 5, 19);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const puzzleDate = new Date(
      firstPuzzleDate + result.puzzleNumber * millisecondsPerDay,
    );

    if (
      Number.isNaN(puzzleDate.getTime()) ||
      puzzleDate.getUTCFullYear() > 9999
    ) {
      return null;
    }

    return puzzleDate.toISOString().slice(0, 10);
  }

  standardScore(result: WordleResult): number {
    const lastRow = result.grid[result.grid.length - 1];
    if (lastRow === "🟩🟩🟩🟩🟩") {
      return 100 - (result.guesses - 1) * 10;
    }

    // Array.from treats each emoji as one tile, rather than UTF-16 code units.
    const greens = Array.from(lastRow ?? "").filter((tile) => tile === "🟩").length;
    return greens * 10;
  }

  resultMessage(result: WordleResult): string {
    if (result.grid[result.grid.length - 1] !== "🟩🟩🟩🟩🟩") {
      return `Wordle puzzle ${result.puzzleNumber}: not solved in ${result.guesses} guesses.`;
    }
    const guessLabel = result.guesses === 1 ? "guess" : "guesses";
    return `Wordle puzzle ${result.puzzleNumber}: solved in ${result.guesses} ${guessLabel}.`;
  }

  getFeedback(text: string): string {
    const result = this.parse(text);

    if (!result) {
      return "Couldn't read this result. Paste a Wordle result with its header (1–6/6 or X/6) and each five-tile row on a separate line, using ⬛, ⬜, 🟨, or 🟩. Remove any links.";
    }

    return this.resultMessage(result);
  }
}

// Game behavior is shared; individual submissions are plain result records.
export const wordleGame = new WordleGame();
