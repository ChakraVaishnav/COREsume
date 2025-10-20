import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

// Reuse PrismaClient across lambda invocations when possible
const prisma = globalThis.__prisma || new PrismaClient();
if (!globalThis.__prisma) globalThis.__prisma = prisma;

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const template = url.searchParams.get('template');

    if (!template) {
      return NextResponse.json({ error: 'Template query parameter required' }, { status: 400 });
    }

    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = parse(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = Number(payload.id);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    // Ensure Prisma has the rating model available
    if (!prisma.rating || typeof prisma.rating.findFirst !== 'function') {
      return NextResponse.json({ error: 'Rating model not available on Prisma client' }, { status: 500 });
    }

    // Try to find a rating for this user + template. If the `template` field
    // doesn't exist in the schema, fallback to checking any rating by the user.
    let existing = null;
        existing = await prisma.rating.findFirst({ where: { userId, template } });

    if (existing) {
      // If the user has already rated (optionally for this template), return the existing rating
      return NextResponse.json({ rated: true, rating: existing }, { status: 200 });
    }

    // No rating found — per your request, return a positive 200 response
    return NextResponse.json({ ok: true, rated: false }, { status: 200 });
  } catch (error) {
    console.error('verify-rated error:', error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
