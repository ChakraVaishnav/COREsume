import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  PASSWORD_RESET_COOKIE,
  TOKEN_PURPOSE,
  verifyForgotPasswordToken,
  buildClearForgotPasswordCookie,
} from "@/lib/auth/token";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import { logApiError } from "@/lib/logger";


export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const token = req.cookies.get(PASSWORD_RESET_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 401 }
      );
    }

    let payload;

    try {
      payload = verifyForgotPasswordToken(token);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Verify token purpose
    if (!payload || payload.purpose !== TOKEN_PURPOSE.FORGOT_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const rateLimitResponse = await enforceRateLimit({
      req,
      type: "RESET_PASSWORD",
      identifier: String(payload.id),
    });
    if (rateLimitResponse) return rateLimitResponse;

    // Check JTI in database
    const dbToken = await prisma.token.findUnique({
      where: {
        jti: payload.jti,
      },
    });

    if (
      !dbToken ||
      dbToken.isRevoked ||
      dbToken.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password + revoke ALL tokens (reset + refresh) atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: payload.id },
        data: { password: hashedPassword },
      }),
      prisma.token.updateMany({
        where: {
          userId: payload.id,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      }),
    ]);


    const response = NextResponse.json(
      {
        message: "Password reset successful",
      },
      {
        status: 200,
      }
    );

    // Clear reset cookie
    response.headers.append(
      "Set-Cookie",
      buildClearForgotPasswordCookie()
    );

    return response;
  } catch (error) {
    logApiError("API/PASSWORD/RESET_PASSWORD", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
