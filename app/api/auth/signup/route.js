import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpMail } from "@/lib/mail";

const OTP_PURPOSE = "pre-signup";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if a verified account already exists for this email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please login instead." },
        { status: 409 }
      );
    }

    // Clear any stale pre-signup OTPs for this email
    await prisma.otp.deleteMany({ where: { email, purpose: OTP_PURPOSE } });

    // Generate OTP (valid for 10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otp.create({
      data: { email, code: otp, expiresAt, purpose: OTP_PURPOSE },
    });

    await sendOtpMail(email, otp, "signup");

    return NextResponse.json({ message: "OTP sent. Please check your email." }, { status: 200 });
  } catch (error) {
    console.error("[signup/send-otp] error:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", details: error.message },
      { status: 500 }
    );
  }
}
