import { NextResponse } from 'next/server';

export async function GET() {
  try {
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