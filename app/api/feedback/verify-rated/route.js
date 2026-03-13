import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

// Reuse PrismaClient across lambda invocations when possible
const sharedPrisma = globalThis.__prisma || prisma;
if (!globalThis.__prisma) globalThis.__prisma = sharedPrisma;

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const template = url.searchParams.get('template');

    if (!template) {
      return NextResponse.json({ error: 'Template query parameter required' }, { status: 400 });
    }

    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // Ensure Prisma has the rating model available
    if (!sharedPrisma.rating || typeof sharedPrisma.rating.findFirst !== 'function') {
      return NextResponse.json({ error: 'Rating model not available on Prisma client' }, { status: 500 });
    }

    // Try to find a rating for this user + template. If the `template` field
    // doesn't exist in the schema, fallback to checking any rating by the user.
    let existing = null;
    try {
      existing = await sharedPrisma.rating.findFirst({ where: { userId: auth.userId, template } });
    } catch (prismaErr) {
      try {
        existing = await sharedPrisma.rating.findFirst({ where: { userId: auth.userId } });
      } catch (err2) {
        throw err2;
      }
    }

    if (existing) {
      // If the user has already rated (optionally for this template), return the existing rating
      const response = NextResponse.json({ rated: true, rating: existing }, { status: 200 });
      return appendSetCookieHeaders(response, auth.cookieHeaders);
    }

    // No rating found — per your request, return a positive 200 response
    const response = NextResponse.json({ ok: true, rated: false }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (error) {
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}
