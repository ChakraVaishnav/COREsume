import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, email, password, otp } = await req.json();

    // Find the latest OTP for the email (not expired)
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        code: otp,
        expiresAt: { gt: new Date() }, // expiresAt is in the future
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      
      return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), { status: 400 });
    }

    // Check if user already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
    }

    // Hash password before saving!
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    // Delete the OTP record after successful verification
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    return new Response(JSON.stringify({ success: true, user: newUser }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to verify OTP" }), { status: 500 });
  }
}
