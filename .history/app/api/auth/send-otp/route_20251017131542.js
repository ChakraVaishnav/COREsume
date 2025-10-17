import { PrismaClient } from "../../../generated/prisma";
import { sendOtpMail } from "@/lib/mail";
import { Serializer } from "cookie";
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, forceResend } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (forceResend) {
      await prisma.otp.deleteMany({
        where: { email },
      });
    }
    

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otp.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });

    await sendOtpMail(email, otp, "signup");

    return new Response(JSON.stringify({ message: "OTP sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
