import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const token = cookies.token;

    console.log("🧠 Token from cookie:", token); // 👈 log this to confirm backend is receiving it

    if (!token) {
      console.log("❌ No token found in request cookies");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token payload:", payload);

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { creds: true },
    });

    if (!user) {
      console.log("❌ User not found for payload ID:", payload.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ User credits fetched:", user.creds);
    return NextResponse.json({ credits: user.creds }, { status: 200 });

  } catch (error) {
    console.error("💥 JWT validation error:", error.message);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
