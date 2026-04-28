import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export async function POST(req) {
  try {
  const body = await req.json();
  const { score, comment, template } = body;

    if (typeof score !== 'number' || score < 1 || score > 5) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // Validate Prisma client has the rating model available
    if (!prisma.rating || typeof prisma.rating.create !== 'function') {
      throw new Error('Prisma client missing `rating` model. Did you run prisma generate/migrate?');
    }

    if (!template || typeof template !== 'string') {
      return NextResponse.json({ error: 'Template is required' }, { status: 400 });
    }

    const rating = await prisma.rating.create({
      data: {
        userId: auth.userId,
        score,
        comment: comment || null,
        template,
      },
    });

    const response = NextResponse.json({ success: true, rating }, { status: 201 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (error) {
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
