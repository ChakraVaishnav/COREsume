import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/session'
import { checkAtsLimit, checkPdfLimit } from '@/lib/featureUsage'

export async function GET(req: Request, props: { params: Promise<{ feature: string }> }) {
  try {
    const params = await props.params;
    const auth = await authenticateRequest(req)
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    let result
    if (params.feature === 'ats') {
      result = await checkAtsLimit(auth.userId)
    } else if (params.feature === 'pdf') {
      result = await checkPdfLimit(auth.userId)
    } else {
      return NextResponse.json({ error: "Invalid feature" }, { status: 400 })
    }
    
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
