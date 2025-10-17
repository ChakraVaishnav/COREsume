import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found please SignIn" }, { status: 404 });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

const cookieString = serialize("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // only true in production
  maxAge: 3600,
  path: "/",
  sameSite: "lax", // or "strict" if you don’t need cross-site requests
});


  console.log("Login successful for user:", email,token, cookieString);
  return NextResponse.json(
    { message: "Login successful" },
    { status: 200, headers: { "Set-Cookie": cookieString } }
  );
  }catch (error) {
  console.error("Login Error:", error);
  return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
}

}