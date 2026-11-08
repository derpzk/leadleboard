import { validateGameResult } from "@/lib/games/validation";

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

  // This first step validates only. Nothing has been saved.
  return Response.json({
    saved: false,
    validatedResult: validation.data,
  });
};
