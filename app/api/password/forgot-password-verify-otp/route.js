import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: "Email and OTP are required" }), { status: 400 });
    }

    const record = await prisma.otp.findFirst({
      where: {
        email,
        code: otp,
        expiresAt: { gt: new Date() }, // not expired
      },
    });

    if (!record) {
      return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), { status: 400 });
    }

    // Optionally delete used OTP
    await prisma.otp.deleteMany({ where: { email } });

    return new Response(JSON.stringify({ message: "OTP verified successfully" }), { status: 200 });
  } catch (err) {
    console.error("OTP verify error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
