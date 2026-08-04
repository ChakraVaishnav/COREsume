import { PrismaClient } from "../../../generated/prisma";
import { signForgotPasswordToken, 
  buildForgotPasswordCookie
} from "@/lib/auth/token";

import { NextResponse } from "next/server";

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

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const record = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        code: otp,
        purpose: "forgot-password",
        expiresAt: { gt: new Date() }, // not expired
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }


    // Delete the OTP after successful verification
    await prisma.otp.deleteMany({ where: { email: normalizedEmail, purpose: "forgot-password"} });

    //create token for password reset
    const token = signForgotPasswordToken({
      id:user.id,
      email:user.email,
      purpose:"password-reset"
    });

    //create response 

    const response = NextResponse.json({
      message:"OTP verified successfully"
    });
    response.headers.append(
      "Set-Cookie",
      buildForgotPasswordCookie(token)
    );
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
