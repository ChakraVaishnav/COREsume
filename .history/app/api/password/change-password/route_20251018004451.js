import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { parse } from "path";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
            const cookies = parse(cookieHeader);
            const token = cookies.token;
            const payload = verify(token, process.env.JWT_SECRET);
            const user =  await prisma.user.findUnique({
          where: { id: payload.id },
          select: {creds: true },
        });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
