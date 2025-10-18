import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST() {
  // Create a Set-Cookie header that removes the token by expiring it immediately
  const cookie = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });

  return NextResponse.json(
    { success: true },
    { status: 200, headers: { "Set-Cookie": cookie } }
  );
}
