import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma"; // adjust if needed
import bcrypt from "bcryptjs";

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
    await prisma.user.create({
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

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
