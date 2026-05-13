import { prisma } from '@/lib/prisma'

export function getTodayIST(): string {
  return new Date().toLocaleDateString('en-CA', { 
    timeZone: 'Asia/Kolkata' 
  }) // returns "YYYY-MM-DD"
}

export function getNextMidnightIST(): string {
  const now = new Date()
  const ist = new Date(now.toLocaleString('en-US', { 
    timeZone: 'Asia/Kolkata' 
  }))
  ist.setHours(24, 0, 0, 0)
  return ist.toISOString()
}

export async function getOrCreateFeatureUsage(userId: number) {
  const date = getTodayIST()
  
  let usage = await prisma.featureUsage.findUnique({
    where: {
      userId_date: {
        userId,
        date
      }
    }
  })
  
  if (!usage) {
    try {
      usage = await prisma.featureUsage.create({
        data: {
          userId,
          date,
          atsUsed: 0,
          pdfUsed: 0
        }
      })
    } catch (e) {
      // In case of race condition, try to fetch again
      usage = await prisma.featureUsage.findUnique({
        where: {
          userId_date: {
            userId,
            date
          }
        }
      })
    }
  }
  
  return usage
}

export async function checkAtsLimit(userId: number) {
  const usage = await getOrCreateFeatureUsage(userId)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creds: true }
  })
  
  const credits = user?.creds || 0
  const allowed = usage!.atsUsed < 2 || credits >= 3
  
  return {
    allowed,
    freeUsed: usage!.atsUsed,
    freeLimit: 2,
    freeSearchesRemainingToday: Math.max(0, 2 - usage!.atsUsed),
    creditsRemaining: credits,
    creditsRequired: 3,
    freeResetsAt: getNextMidnightIST()
  }
}

export async function checkPdfLimit(userId: number) {
  const usage = await getOrCreateFeatureUsage(userId)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creds: true }
  })
  
  const credits = user?.creds || 0
  const allowed = usage!.pdfUsed < 2 || credits >= 3
  
  return {
    allowed,
    freeUsed: usage!.pdfUsed,
    freeLimit: 2,
    freeSearchesRemainingToday: Math.max(0, 2 - usage!.pdfUsed),
    creditsRemaining: credits,
    creditsRequired: 3,
    freeResetsAt: getNextMidnightIST()
  }
}

export async function incrementAts(userId: number, usedCredit: boolean) {
  const date = getTodayIST()
  
  if (!usedCredit) {
    await prisma.featureUsage.update({
      where: { userId_date: { userId, date } },
      data: { atsUsed: { increment: 1 } }
    })
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { creds: { decrement: 3 } }
    })
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: { atsChecksTotal: { increment: 1 } }
  })
}

export async function incrementPdf(userId: number, usedCredit: boolean) {
  const date = getTodayIST()
  
  if (!usedCredit) {
    await prisma.featureUsage.update({
      where: { userId_date: { userId, date } },
      data: { pdfUsed: { increment: 1 } }
    })
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { creds: { decrement: 3 } }
    })
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: { pdfUploadsTotal: { increment: 1 } }
  })
}
