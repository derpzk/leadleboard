import { validateGameResult } from "@/lib/games/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const POST = async (request: Request) => {
  // JSON comes from outside our program, so its shape starts as unknown.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send a valid JSON body." }, { status: 400 });
  }

  if (
    !body || typeof body !== "object" ||
    !("playerName" in body) || typeof body.playerName !== "string" ||
    !("gameName" in body) || typeof body.gameName !== "string" ||
    !("result" in body)
  ) {
    return Response.json(
      { error: "Provide playerName, gameName, and structured result data." },
      { status: 400 },
    );
  }

  const playerName = body.playerName.trim();
  if (!playerName) {
    return Response.json({ error: "A player name is required." }, { status: 400 });
  }

  // Dispatch to a supported game's rules; don't accept a client-provided score.
  const validation = validateGameResult(body.gameName, body.result, playerName);
  if (validation.status === "invalid") {
    return Response.json(
      { error: validation.message },
      { status: 400 },
    );
  }

  const record = validation.data;
  try {
    const supabase = createSupabaseServerClient();
    // Translate our TypeScript field names to the database's column names.
    const { error } = await supabase.from("results").insert({
      id: record.id,
      player_id: record.playerId,
      player_name: record.playerName ?? null,
      game_name: record.gameName,
      date_played: record.datePlayed,
      submit_time: record.submitTime,
      score: record.score,
      result: record.result,
    });

    if (error) {
      // PostgreSQL's unique constraint also prevents concurrent duplicates.
      if (error.code === "23505") {
        return Response.json(
          { error: `${playerName} already has a saved result for this ${record.gameName} puzzle.` },
          { status: 409 },
        );
      }
      return Response.json(
        { error: "Couldn't save the result to the database. Please try again." },
        { status: 500 },
      );
    }

    return Response.json({ saved: true, savedResult: record }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Couldn't connect to the database. Check the server configuration and try again." },
      { status: 500 },
    );
  }
};
