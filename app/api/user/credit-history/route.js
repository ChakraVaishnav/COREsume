import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth/session'

export async function GET(req) {
  try {
    const auth = await authenticateRequest(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = 10
    const skip = (page - 1) * limit

    let history, total;

    if (prisma.creditHistory) {
      const [h, t] = await Promise.all([
        prisma.creditHistory.findMany({
          where: { userId: auth.userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.creditHistory.count({
          where: { userId: auth.userId }
        })
      ]);
      history = h;
      total = t;
    } else {
      // Fallback for when the dev server is locking the prisma client generation
      const [h, t] = await Promise.all([
        prisma.$queryRaw`
          SELECT * FROM "CreditHistory"
          WHERE "userId" = ${auth.userId}
          ORDER BY "createdAt" DESC
          LIMIT ${limit} OFFSET ${skip}
        `,
        prisma.$queryRaw`
          SELECT COUNT(*) as count FROM "CreditHistory"
          WHERE "userId" = ${auth.userId}
        `
      ]);
      history = h;
      total = Number(t[0]?.count || 0);
    }

    return NextResponse.json({
      history,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (err) {
    console.error("Credit history fetch error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
