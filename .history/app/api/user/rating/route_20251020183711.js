import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { score, comment } = body;

    if (typeof score !== 'number' || score < 1 || score > 5) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = parse(cookieHeader || '');
    const token = cookies.token;

    if (!token) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const rating = await prisma.rating.create({
      data: {
        userId: user.id,
        score,
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, rating }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
