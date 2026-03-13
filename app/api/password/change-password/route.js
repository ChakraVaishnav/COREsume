import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { currentPassword, newPassword } = await req.json();

    // Get user by token
    const user = await prisma.user.findUnique(
      { where: { id: auth.userId } ,
      select :{  password: true }}
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: auth.userId },
      data: { password: hashed },
    });

    const response = NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
