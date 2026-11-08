import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Result } from "@/types/result";

type ResultRow = {
  id: string;
  player_id: string;
  player_name: string | null;
  game_name: string;
  date_played: string;
  submit_time: string;
  score: number | null;
  result: unknown;
};

export const getResults = async (): Promise<Result[]> => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("results")
    .select("id, player_id, player_name, game_name, date_played, submit_time, score, result")
    .order("submit_time", { ascending: false })
    .order("id", { ascending: false })
    .returns<ResultRow[]>();

  if (error) throw new Error("Couldn't load results from the database.");

  // Convert database columns to the existing Result contract used by cards.
  return (data ?? []).map((row) => ({
    id: row.id,
    playerId: row.player_id,
    ...(row.player_name === null ? {} : { playerName: row.player_name }),
    gameName: row.game_name,
    datePlayed: row.date_played,
    submitTime: row.submit_time,
    score: row.score,
    result: row.result,
  }));
};
