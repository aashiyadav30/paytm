import { NextResponse } from 'next/server';
import { agentTools } from '@/lib/agent-tools';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const txnId = searchParams.get('txnId');

  if (!txnId) return NextResponse.json({ error: 'txnId required' }, { status: 400 });

  const result = await agentTools.trace_refund_pipeline(txnId);
  return NextResponse.json(result);
}
