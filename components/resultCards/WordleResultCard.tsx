import ResultCard from "@/components/ResultCard";
import { wordleGame } from "@/lib/games/WordleGame";
import type { WordleResult } from "@/types/wordle";

type WordleResultCardProps = {
  result: WordleResult;
  player?: string;
  datePlayed?: string;
  score?: number | null;
};

const WordleResultCard = ({ result, player, datePlayed, score }: WordleResultCardProps) => {
  return (
    <ResultCard
      gameName="Wordle"
      player={player}
      datePlayed={datePlayed ?? wordleGame.dayPlayed(result) ?? undefined}
      score={score === undefined ? wordleGame.standardScore(result) : score}
      message={wordleGame.resultMessage(result)}
      resultLabel={`Puzzle #${result.puzzleNumber.toLocaleString("en-US")} · ${result.grid[result.grid.length - 1] === "🟩🟩🟩🟩🟩" ? result.guesses : "X"}/6`}
    >
      <figure>
        <figcaption className="sr-only">Wordle guess grid</figcaption>
        <ol className="flex flex-col gap-1">
          {result.grid.map((row, index) => (
            <li key={index}>
              <span className="sr-only">
                Guess {index + 1}:{" "}
                {Array.from(row)
                  .map((tile) => {
                    if (tile === "🟩") return "correct position";
                    if (tile === "🟨") return "wrong position";
                    return "absent";
                  })
                  .join(", ")}
              </span>
              <span aria-hidden="true" className="whitespace-pre text-2xl leading-relaxed tracking-wider">
                {row}
              </span>
            </li>
          ))}
        </ol>
      </figure>
    </ResultCard>
  );
};

export default WordleResultCard;
