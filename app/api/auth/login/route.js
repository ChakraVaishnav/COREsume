import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found please SignIn" }, { status: 404 });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const session = await createSession({ id: user.id, email: user.email });

    const response = NextResponse.json({ message: "Login successful" }, { status: 200 });
    return appendSetCookieHeaders(response, session.cookieHeaders);
  }catch (error) {
  return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
}

}