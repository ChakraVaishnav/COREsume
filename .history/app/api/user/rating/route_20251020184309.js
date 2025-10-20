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
    // coerce id to number (jwt may serialize numbers as strings in some setups)
    const userId = Number(payload.id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Validate Prisma client has the rating model available
    if (!prisma.rating || typeof prisma.rating.create !== 'function') {
      throw new Error('Prisma client missing `rating` model. Did you run prisma generate/migrate?');
    }

    const rating = await prisma.rating.create({
      data: {
        userId: user.id,
        score,
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, rating }, { status: 201 });
  } catch (error) {
    console.error('Rating API error:', error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
