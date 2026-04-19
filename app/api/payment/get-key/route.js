import { NextResponse } from 'next/server';
import { authenticateRequest } from "@/lib/auth/session";

export async function GET(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      key: process.env.RAZOR_PAY_ID,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get payment key' },
      { status: 500 }
    );
  }
} 