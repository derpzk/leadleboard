export abstract class Game<TResult> {
  abstract readonly gameName: string;
  // Quick detection if it is for the game
  abstract recognizes(text: string): boolean;
  // Returns result based on pasted text, null if not valid
  abstract parse(text: string): TResult | null;
  // Validate structured JSON independently of the original share text.
  abstract validateResult(value: unknown): TResult | null;
  // Puzzle calendar date (YYYY-MM-DD), not the submission timestamp.
  abstract dayPlayed(result: TResult): string | null;
  // Return a standardized score from 0–100, or null while scoring is undefined.
  abstract standardScore(result: TResult): number | null;
  // Return a string representing the result of the game
  abstract resultMessage(result: TResult): string;
}
