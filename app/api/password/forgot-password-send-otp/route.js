import { PrismaClient } from "../../../generated/prisma";
import { sendOtpMail } from "@/lib/mail";
import { logApiError } from "@/lib/logger";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "No user with this email exists",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Remove any previous forgot-password OTPs
    await prisma.otp.deleteMany({
      where: {
        email: normalizedEmail,
        purpose: "forgot-password",
      },
    });

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await prisma.otp.create({
      data: {
        email: normalizedEmail,
        code: otp,
        expiresAt,
        purpose: "forgot-password",
      },
    });

    await sendOtpMail(
      normalizedEmail,
      otp,
      "forgot-password"
    );

    return new Response(
      JSON.stringify({
        message: "OTP sent successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    logApiError(error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}