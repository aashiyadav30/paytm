import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const txnId = searchParams.get('txnId');

  if (!txnId) return NextResponse.json({ error: 'txnId required' }, { status: 400 });

  const txn = await db.transaction.findUnique({ where: { id: txnId } });
  if (!txn) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  return NextResponse.json({
    gateway: 'Paytm Payment Gateway Core',
    txnId: txn.id,
    utr: txn.utr,
    status: txn.pgStatus,
    amount: txn.amount,
    timestamp: txn.createdAt,
  });
}
