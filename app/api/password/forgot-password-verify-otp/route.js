import { PrismaClient } from "../../../generated/prisma";
import {
  signForgotPasswordToken,
  buildForgotPasswordCookie,
} from "@/lib/auth/token";
import { NextResponse } from "next/server";
import { enforceRateLimit, getClientIp } from "@/lib/security/rateLimit";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const rateLimitResponse = await enforceRateLimit({
      req,
      type: "FORGOT_PASSWORD_VERIFY_OTP",
      identifier: `${getClientIp(req)}:${normalizedEmail}`,
    });

    if (rateLimitResponse) return rateLimitResponse;

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify OTP
    const record = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        code: otp,
        purpose: "forgot-password",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Consume OTP
    await prisma.otp.deleteMany({
      where: {
        email: normalizedEmail,
        purpose: "forgot-password",
      },
    });

    // Generate forgot password JWT
    const resetToken = signForgotPasswordToken({
      id: user.id,
      email: user.email,
    });

    // Store JTI in database
    await prisma.token.create({
      data: {
        userId: user.id,
        jti: resetToken.jti,
        purpose: resetToken.purpose,
        expiresAt: resetToken.expiresAt,
      },
    });

    // Send JWT as HttpOnly cookie
    const response = NextResponse.json(
      {
        message: "OTP verified successfully",
      },
      {
        status: 200,
      }
    );

    response.headers.append(
      "Set-Cookie",
      buildForgotPasswordCookie(resetToken.token)
    );

    return response;
  } catch (err) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
