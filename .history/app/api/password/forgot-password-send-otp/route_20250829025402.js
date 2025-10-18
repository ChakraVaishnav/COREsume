import { PrismaClient } from "../../../generated/prisma/client";
import { sendOtpMail } from "@/lib/mail";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return new Response(JSON.stringify({ error: "No user with this email exists" }), { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    await prisma.otp.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });

    await sendOtpMail(email, otp, "forgot-password");


    return new Response(JSON.stringify({ message: "OTP sent successfully" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
