import { NextResponse } from 'next/server';
import { agentTools } from '@/lib/agent-tools';

export async function POST(request: Request) {
  try {
    const { txnId } = await request.json();
    if (!txnId) return NextResponse.json({ error: 'txnId required' }, { status: 400 });

    const result = await agentTools.execute_reconciliation(txnId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
