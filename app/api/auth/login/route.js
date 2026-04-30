import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    // Debug: log login attempts (do not log passwords)
    try {
      console.log("[auth/login] login attempt for:", { email });
    } catch (logErr) {
      /* ignore logging errors */
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found please SignIn" }, { status: 404 });
    try { console.log("[auth/login] user found id:", user.id); } catch (e) {}

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    try { console.log("[auth/login] password match:", Boolean(isMatch)); } catch (e) {}
    if (!isMatch) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const session = await createSession({ id: user.id, email: user.email });
    try { console.log("[auth/login] session cookie headers:", session.cookieHeaders); } catch (e) {}

    const response = NextResponse.json({ message: "Login successful" }, { status: 200 });
    return appendSetCookieHeaders(response, session.cookieHeaders);
  }catch (error) {
  console.error("[auth/login] error:", error);
  return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
}

}