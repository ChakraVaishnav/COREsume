import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Make sure this is correct
import nodemailer from "nodemailer";

export async function POST(req) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    });

    await prisma.otp.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });
    return NextResponse.json({ message: "OTP sent and stored successfully!" });

  } catch (err) {
    return NextResponse.json({ error: "Failed to send and store OTP" }, { status: 500 });
  }
}
