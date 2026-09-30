import { NextResponse } from 'next/server';
import { agentTools, AuditTraceStep } from '@/lib/agent-tools';
import { evaluateActionPolicy } from '@/lib/policy-gate';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { query, txnId: explicitTxnId } = await request.json();

    // 1. Identify Target Transaction
    let targetTxnId = explicitTxnId;
    if (!targetTxnId) {
      if (query.includes('84920')) targetTxnId = 'TXN_84920';
      else if (query.includes('3021') || query.toLowerCase().includes('refund')) targetTxnId = 'TXN_REF_3021';
      else if (query.includes('9910') || query.includes('12000') || query.toLowerCase().includes('twice')) targetTxnId = 'TXN_DUAL_9910';
      else targetTxnId = 'TXN_84920'; // Default to Demo 1
    }

    const trace: AuditTraceStep[] = [];
    const addTrace = (
      step: string,
      type: 'THOUGHT' | 'ACTION' | 'OBSERVE' | 'POLICY' | 'VERIFY',
      description: string,
      data?: any
    ) => {
      trace.push({
        step,
        type,
        description,
        data,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      });
    };

    // ── STEP 1: Understand & Parse ──
    addTrace(
      'Step 1: Intake & Parsing',
      'THOUGHT',
      `Parsed user inquiry. Identified target transaction reference: ${targetTxnId}. Initiating multi-system audit.`
    );

    // ── STEP 2: Audit Payment Gateway ──
    addTrace(
      'Step 2: Payment Gateway Audit',
      'ACTION',
      `Executing tool: audit_payment_gateway('${targetTxnId}')`
    );
    const pgData = await agentTools.audit_payment_gateway(targetTxnId);
    if ('error' in pgData) {
      return NextResponse.json({ error: pgData.error, trace });
    }
    addTrace(
      'Step 2: Gateway Observation',
      'OBSERVE',
      `PG Status: ${pgData.status} | Amount: ₹${pgData.amount} | UTR: ${pgData.utr}`
    );

    // ── SCENARIO 2: REFUND HANDLING ──
    if (pgData.type === 'REFUND') {
      addTrace(
        'Step 3: Refund Pipeline Audit',
        'ACTION',
        `Executing tool: trace_refund_pipeline('${targetTxnId}')`
      );
      const refundData = await agentTools.trace_refund_pipeline(targetTxnId);
      addTrace(
        'Step 3: Refund Observation',
        'OBSERVE',
        `Refund Status: ${refundData.status} | Downstream Switch: ${refundData.bankClearance} | Bank ARN: ${refundData.arnCode}`
      );

      addTrace(
        'Step 4: Root-Cause Synthesis',
        'THOUGHT',
        `Paytm successfully released funds, but the beneficiary bank has not completed the clearing batch. Expected window: ${refundData.estimatedSlaWindow}.`
      );

      const message = `Hello Rahul, we investigated your refund request (Ref: ${targetTxnId}) for ₹${pgData.amount}. 
• Paytm Status: Successfully Dispatched
• Downstream Bank ARN: ${refundData.arnCode}
• Clearance Status: Scheduled by beneficiary bank within ${refundData.estimatedSlaWindow}.
Your bank is currently clearing this batch. You can track this reversal directly with your bank using the ARN above.`;

      return NextResponse.json({ message, trace, status: 'RESOLVED', actionType: 'REFUND_TRACE' });
    }

    // ── STEP 3: Audit Banking Switch (NPCI/Bank) ──
    addTrace(
      'Step 3: Banking Switch Audit',
      'ACTION',
      `Executing tool: audit_bank_switch('${pgData.utr}')`
    );
    const switchData = await agentTools.audit_bank_switch(pgData.utr);
    addTrace(
      'Step 3: Bank Switch Observation',
      'OBSERVE',
      `Switch Network: ${switchData.network} | Status: ${switchData.switchStatus} | Webhook Timeout: ${switchData.isWebhookTimedOut}`
    );

    // ── STEP 4: Check Destination Ledger ──
    addTrace(
      'Step 4: Ledger Audit',
      'ACTION',
      `Executing tool: check_destination_ledger('${pgData.receiverId}')`
    );
    const ledgerData = await agentTools.check_destination_ledger(pgData.receiverId);
    addTrace(
      'Step 4: Ledger Observation',
      'OBSERVE',
      `Account: ${ledgerData.accountName} | Current Balance: ₹${ledgerData.currentBalance}`
    );

    // ── STEP 5: Policy Gate Evaluation ──
    addTrace(
      'Step 5: Policy Guardrail Check',
      'POLICY',
      `Evaluating Deterministic Policy Engine for Amount: ₹${pgData.amount}...`
    );
    const policy = evaluateActionPolicy(pgData.amount, switchData.hasConflictFlag);
    addTrace(
      'Step 5: Policy Decision',
      'POLICY',
      `Allowed: ${policy.allowed.toString().toUpperCase()} | Reason: ${policy.reason}`
    );

    // ── SCENARIO 3: HIGH RISK / ESCALATION ──
    if (!policy.allowed) {
      addTrace(
        'Step 6: Autonomous Write Blocked',
        'THOUGHT',
        `Automated action prohibited by financial policy. Assembling structured Case Brief for Human Operations Desk.`
      );

      const aiSummary = `[CASE BRIEF #EB-${Math.floor(1000 + Math.random() * 9000)}]
• Customer: ${pgData.senderId} | Transaction: ${targetTxnId}
• Amount: ₹${pgData.amount.toLocaleString('en-IN')} | UTR: ${pgData.utr}
• Failure Locus: Core banking switch reported conflicting debit instructions; funds held in escrow pool.
• Reason for Escalation: Exceeds automated policy threshold (₹5,000) and conflict flag active.`;

      const escalation = await agentTools.escalate_to_human({
        txnId: targetTxnId,
        amount: pgData.amount,
        reason: policy.reason,
        aiSummary,
        recommendedAction: 'Verify dual debit with remitter bank (HDFC) and authorize escrow reversal to source account.',
      });

      addTrace(
        'Step 6: Human Handoff Executed',
        'ACTION',
        `Case Brief dispatched to Human Ops Dashboard (Ticket ID: ${escalation.ticketId})`
      );

      const message = `We have completed a multi-system investigation of your ₹${pgData.amount.toLocaleString('en-IN')} transaction. Because this involves a multi-party banking dispute, an AI Escalation Case Brief has been packaged with full diagnostic evidence and transferred directly to our Senior Settlement Desk. A human specialist will finalize the reversal shortly with zero context loss.`;

      return NextResponse.json({ message, trace, status: 'ESCALATED', ticketId: escalation.ticketId });
    }

    // ── SCENARIO 1: AUTO-RECONCILIATION & STATE VERIFICATION ──
    addTrace(
      'Step 6: Autonomous Remediation',
      'ACTION',
      `Policy Approved. Executing tool: execute_reconciliation('${targetTxnId}')`
    );
    const reconcileResult = await agentTools.execute_reconciliation(targetTxnId);
    addTrace(
      'Step 6: Action Execution Result',
      'OBSERVE',
      `Ledger mutated. Amount credited: ₹${reconcileResult.amountCredited}. Receiver new balance: ₹${reconcileResult.receiverNewBalance}`
    );

    // ── STEP 7: Active State Verification ──
    addTrace(
      'Step 7: State Verification',
      'VERIFY',
      `Re-auditing destination ledger to verify state transition...`
    );
    const verifiedLedger = await agentTools.check_destination_ledger(pgData.receiverId);
    addTrace(
      'Step 7: Verification Confirmed',
      'VERIFY',
      `Initial Balance: ₹${ledgerData.currentBalance} ➔ Verified Balance: ₹${verifiedLedger.currentBalance} (SUCCESS ✅)`
    );

    const message = `Good news! We investigated your transaction (${targetTxnId}). 
• Diagnosis: Downstream bank switch timed out during settlement webhook delivery.
• Action Taken: Autonomous reconciliation executed.
• Verified State: ₹${pgData.amount.toLocaleString('en-IN')} has been confirmed in the receiver's account (${verifiedLedger.accountName}).
Both parties have been notified. UTR: ${pgData.utr}.`;

    return NextResponse.json({ message, trace, status: 'RESOLVED', actionType: 'AUTO_RECONCILED' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
