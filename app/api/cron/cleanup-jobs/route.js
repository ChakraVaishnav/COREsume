import { NextResponse } from "next/server";

export async function GET(req) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    deleted: 0,
    message: "Cleanup disabled. Jobs retention is capped at 50 per user.",
  });
}
