import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma"; // adjust if needed
import bcrypt from "bcryptjs";
import { serialize } from "cookie";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { username, email, password, otp } = await req.json();

    if (!username || !email || !password || !otp) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // ✅ Step 0: Check if user already exists
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

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    const cookieString = serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600,
    path: "/",
    sameSite: "strict",
  });
  console.log("Signup successful, user created:", token);
  return NextResponse.json(
    { message: "Signup successful" },
    { status: 200, headers: { "Set-Cookie": cookieString } }
  );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
