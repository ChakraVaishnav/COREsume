import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import { parse } from "cookie";
import { verify } from "jsonwebtoken";
const prisma = new PrismaClient();
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
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.creds < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id:payload.id },
      data: { creds: { decrement: 1 } },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
