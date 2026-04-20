import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

const USERNAME_REGEX = /^[a-zA-Z0-9._ -]+$/;

export async function PATCH(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const username = typeof body?.username === "string" ? body.username.trim() : "";

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 50) {
      return NextResponse.json(
        { error: "Username must be between 2 and 50 characters" },
        { status: 400 }
      );
    }

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username can contain letters, numbers, spaces, dots, underscores, and hyphens only",
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: { username },
      select: {
        username: true,
        email: true,
        creds: true,
        totalJobsSearched: true,
      },
    });

    const response = NextResponse.json(
      { message: "Username updated", user: updatedUser },
      { status: 200 }
    );

    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
