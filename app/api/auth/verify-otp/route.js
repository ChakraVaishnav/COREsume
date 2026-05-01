import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

const OTP_PURPOSE = "pre-signup";

export async function POST(req) {
  try {
    const { username, email, password, otp } = await req.json();

    if (!username || !email || !password || !otp) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Guard: user might already exist if OTP was submitted twice
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Account already exists. Please login instead." },
        { status: 409 }
      );
    }

    // Validate OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        code: otp,
        purpose: OTP_PURPOSE,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please try again." },
        { status: 400 }
      );
    }

    // OTP is valid — create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        authProvider: "password",
        emailVerified: true, // verified right now via OTP
      },
    });

    // Consume the OTP
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    // Issue session
    const session = await createSession({ id: user.id, email: user.email });
    const response = NextResponse.json({ message: "Account created successfully!" }, { status: 200 });
    return appendSetCookieHeaders(response, session.cookieHeaders);
  } catch (error) {
    console.error("[verify-otp] error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", details: error.message },
      { status: 500 }
    );
  }
}
