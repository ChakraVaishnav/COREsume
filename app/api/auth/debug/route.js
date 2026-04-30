import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    console.log("[auth/debug] received cookies:", cookieHeader);
    return NextResponse.json({ cookie: cookieHeader });
  } catch (error) {
    console.error("[auth/debug] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
