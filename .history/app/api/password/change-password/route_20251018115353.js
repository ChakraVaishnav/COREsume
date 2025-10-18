import { PrismaClient } from "../../../generated/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
export async function POST(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const token = cookies.token;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { currentPassword, newPassword } = await req.json();

    // Get user by token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = payload.id;
    const user = await prisma.user.findUnique(
      { where: { id } ,
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
      where: { id },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
