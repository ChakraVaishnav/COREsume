import { PrismaClient } from "../../../generated/prisma";
import bcrypt from "bcryptjs";
import{
  PASSWORD_RESET_COOKIE,
  verifyForgotPasswordToken,
  buildClearForgotPasswordCookie
}
from "@/lib/auth/token";

import { NextResponse } from "next/server"; 
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (!password) {
      return new Response(JSON.stringify({ error: "Password required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    const token = req.cookies.get(PASSWORD_RESET_COOKIE)?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }),{
        status:401,
        headers: { "Content-Type": "application/json" },
      });
    }

    let payload;
    try {
      payload = verifyForgotPasswordToken(token);
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!payload || payload.purpose !== "password-reset") {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: payload.id },
      data: { password: hashedPassword },
    });
    const response = NextResponse.json({
      message:"Password reset successful"
    });

    response.headers.append(
        "Set-Cookie",
        buildClearForgotPasswordCookie()
    );

    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
