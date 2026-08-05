import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { appendSetCookieHeaders, TOKEN_PURPOSE } from "@/lib/auth/token";

export async function POST(req) {
  try {
    const { email, password, force = false } = await req.json();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check for an active session
    const activeSession = await prisma.token.findFirst({
      where: {
        userId: user.id,
        purpose: TOKEN_PURPOSE.REFRESH,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // Ask frontend whether to continue
    if (activeSession && !force) {
      return NextResponse.json(
        {
          conflict: true,
          error:
            "Your account is already logged in on another device.",
        },
        { status: 409 }
      );
    }

    // User chose "Continue"
    if (force) {
      await prisma.token.updateMany({
        where: {
          userId: user.id,
          purpose: TOKEN_PURPOSE.REFRESH,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      });
    }

    // Create new session
    const session = await createSession({
      id: user.id,
      email: user.email,
    });

    // Save new refresh token JTI
    await prisma.token.create({
      data: {
        userId: user.id,
        jti: session.refreshToken.jti,
        purpose: session.refreshToken.purpose,
        expiresAt: session.refreshToken.expiresAt,
      },
    });

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    return appendSetCookieHeaders(response, session.cookieHeaders);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}