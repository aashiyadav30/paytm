import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const utr = searchParams.get('utr');

  if (!utr) return NextResponse.json({ error: 'utr required' }, { status: 400 });

  const txn = await db.transaction.findFirst({ where: { utr } });
  if (!txn) return NextResponse.json({ error: 'Bank switch record not found' }, { status: 404 });

  return NextResponse.json({
    switchNetwork: 'NPCI / UPI 2.0 Switch',
    utr: txn.utr,
    status: txn.bankSwitchStatus,
    isWebhookTimeout: txn.bankSwitchStatus === 'TIMEOUT',
    timestamp: txn.updatedAt,
  });
}
