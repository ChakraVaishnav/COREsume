import { NextResponse } from "next/server";
import { PrismaClient } from '../../../generated/prisma';

import { parse } from "cookie";
import { verify } from "jsonwebtoken";
const prisma = new PrismaClient();
export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verify(token, process.env.JWT_SECRET); 

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { creds: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ credits: user.creds }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
