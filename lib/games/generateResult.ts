import type { Game } from "@/lib/games/Game";
import type { Result } from "@/types/result";

export const generateResult = <TResult>(
  game: Game<TResult>,
  playerId: string,
  result: TResult,
): Result<TResult> => {
  const normalizedPlayerId = playerId.trim();
  if (!normalizedPlayerId) {
    throw new Error("A player ID is required to create a result record.");
  }

  const datePlayed = game.dayPlayed(result);
  if (datePlayed === null) {
    throw new Error(`Couldn't determine the puzzle date for ${game.gameName}.`);
  }

  return {
    id: crypto.randomUUID(),
    playerId: normalizedPlayerId,
    gameName: game.gameName,
    datePlayed,
    submitTime: new Date().toISOString(),
    score: game.standardScore(result),
    result,
  };
};
