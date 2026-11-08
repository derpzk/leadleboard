import type { Game } from "@/lib/games/Game";
import { wordleGame } from "@/lib/games/WordleGame";
import { generateResult } from "@/lib/games/generateResult";
import type { Result } from "@/types/result";

type GameValidation =
  | {
      status: "valid";
      data: Result;
    }
  | { status: "invalid"; message: string };

// Keep each game's parsed type paired with its own date and scoring methods.
const registerValidator = <TResult>(game: Game<TResult>) => {
  return {
    gameName: game.gameName,
    validate: (value: unknown, playerName: string): GameValidation => {
      const result = game.validateResult(value);
      if (result === null) {
        return {
          status: "invalid",
          message: `The structured ${game.gameName} result is invalid.`,
        };
      }

      if (game.dayPlayed(result) === null) {
        return {
          status: "invalid",
          message: `Couldn't determine the puzzle date for ${game.gameName}.`,
        };
      }

      return {
        status: "valid",
        data: {
          // Still a temporary name-based identity until authentication exists.
          ...generateResult(game, `local:${playerName.toLowerCase()}`, result),
          playerName,
        },
      };
    },
  };
};

// Register additional game classes here once their rules are implemented.
const validators = [registerValidator(wordleGame)];

export const validateGameResult = (
  gameName: string,
  value: unknown,
  playerName: string,
): GameValidation => {
  const validator = validators.find((game) => game.gameName === gameName);
  return validator ? validator.validate(value, playerName) : {
    status: "invalid",
    message: "This game is not supported yet.",
  };
};
