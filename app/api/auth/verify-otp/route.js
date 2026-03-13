import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export async function POST(req) {
  try {
    const { username, email, password, otp } = await req.json();

    if (!username || !email || !password || !otp) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists. Please login instead." },
        { status: 409 }
      );
    }

    // ✅ Step 1: Validate OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        code: otp,
        expiresAt: {
          gt: new Date(), // ensure not expired
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // ✅ Step 2: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Step 3: Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // ✅ Step 4: Delete used OTP
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });
    const session = await createSession({ id: user.id, email: user.email });
    const response = NextResponse.json({ message: "Signup successful" }, { status: 200 });
    return appendSetCookieHeaders(response, session.cookieHeaders);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
