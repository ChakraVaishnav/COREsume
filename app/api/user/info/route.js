import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = authHeader.split(" ")[1];

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        username: true,
        email: true
        // 👇 password intentionally excluded
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error("User Info API Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
