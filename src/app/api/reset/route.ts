import { NextResponse } from 'next/server';
import { resetAndSeedDatabase } from '../../../../prisma/seed';

export async function POST() {
  try {
    await resetAndSeedDatabase();
    return NextResponse.json({ success: true, message: 'Database reset to initial demo state.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
