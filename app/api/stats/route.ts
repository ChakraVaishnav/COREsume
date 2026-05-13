import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const revalidate = 3600 // cache for 1 hour

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const resumeCount = userCount * 10
    
    return NextResponse.json({
      resumeCount,
      templateCount: 9,
      languagesCount: 5
    })
  } catch (err) {
    return NextResponse.json({
      resumeCount: 250,
      templateCount: 9,
      languagesCount: 5
    })
  }
}
