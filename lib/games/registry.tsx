import type { ComponentType, ReactNode } from "react";
import type { Game } from "@/lib/games/Game";
import type { Result } from "@/types/result";
import { wordleGame } from "@/lib/games/WordleGame";
import WordleResultCard from "@/components/resultCards/WordleResultCard";
import type { WordleResult } from "@/types/wordle";

type ResultPreview = {
  gameName: string;
  result: unknown;
  renderCard: (player: string) => ReactNode;
};

type GameMatch =
  | { status: "unrecognized" }
  | { status: "invalid"; gameName: string; message: string }
  | { status: "valid"; preview: ResultPreview };

export type ResultIdentification =
  | { status: "empty" }
  | { status: "undetected"; message: string }
  | Exclude<GameMatch, { status: "unrecognized" }>;

// Pair each game's parser with a card accepting that parser's result type.
const registerGame = <TResult,>(
  game: Game<TResult>,
  Card: ComponentType<{ result: TResult; player?: string }>,
) => {
  return (text: string): GameMatch => {
    if (!game.recognizes(text)) return { status: "unrecognized" };

    const result = game.parse(text);
    if (result === null) {
      return {
        status: "invalid",
        gameName: game.gameName,
        message: `${game.gameName} detected, but the result format is invalid or unsupported. Copy the complete share result and preserve its original text and line breaks.`,
      };
    }

    return {
      status: "valid",
      preview: {
        gameName: game.gameName,
        result,
        renderCard: (player) => <Card result={result} player={player} />,
      },
    };
  };
};

const registeredGames = [registerGame(wordleGame, WordleResultCard)];

const isWordleResult = (value: unknown): value is WordleResult => {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<WordleResult>;
  return Number.isSafeInteger(result.puzzleNumber) &&
    typeof result.puzzleNumber === "number" && result.puzzleNumber >= 0 &&
    typeof result.guesses === "number" && Number.isInteger(result.guesses) &&
    result.guesses >= 1 && result.guesses <= 6 &&
    Array.isArray(result.grid) && result.grid.length === result.guesses &&
    result.grid.every((row) => typeof row === "string" && /^[⬛⬜🟨🟩]{5}$/u.test(row));
};

// Saved cards use structured data and the saved score, not reparsed share text.
const recordRenderers = [
  {
    gameName: wordleGame.gameName,
    render: (record: Result): ReactNode => isWordleResult(record.result) ? (
      <WordleResultCard
        result={record.result}
        player={record.playerName ?? record.playerId}
        datePlayed={record.datePlayed}
        score={record.score}
      />
    ) : null,
  },
];

export const renderSavedResult = (record: Result): ReactNode => {
  const renderer = recordRenderers.find((entry) => entry.gameName === record.gameName);
  return renderer?.render(record) ?? null;
};

export const identifyResult = (text: string): ResultIdentification => {
  if (!text.trim()) return { status: "empty" };

  let invalidMatch: Extract<GameMatch, { status: "invalid" }> | null = null;
  for (const parsePreview of registeredGames) {
    const match = parsePreview(text);
    if (match.status === "valid") return match;
    if (match.status === "invalid" && !invalidMatch) invalidMatch = match;
  }

  return (
    invalidMatch ?? {
      status: "undetected",
      message:
        "Couldn't identify a supported game. Paste the complete share result, including its game heading. The game may not be supported yet.",
    }
  );
};
