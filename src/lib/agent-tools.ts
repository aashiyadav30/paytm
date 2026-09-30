import { db } from './db';
import { evaluateActionPolicy } from './policy-gate';

export interface AuditTraceStep {
  step: string;
  type: 'THOUGHT' | 'ACTION' | 'OBSERVE' | 'POLICY' | 'VERIFY';
  description: string;
  data?: any;
  timestamp: string;
}

export const agentTools = {
  // Tool 1: Audit Payment Gateway
  audit_payment_gateway: async (txnId: string) => {
    const txn = await db.transaction.findUnique({ where: { id: txnId } });
    if (!txn) return { error: `Transaction ${txnId} not found in Payment Gateway.` };

    return {
      status: txn.pgStatus,
      utr: txn.utr,
      amount: txn.amount,
      type: txn.type,
      senderId: txn.senderId,
      receiverId: txn.receiverId,
      gatewayTimestamp: txn.createdAt,
    };
  },

  // Tool 2: Audit Downstream Banking Switch
  audit_bank_switch: async (utr: string) => {
    const txn = await db.transaction.findFirst({ where: { utr } });
    if (!txn) return { error: `Bank switch log for UTR ${utr} not found.` };

    return {
      utr: txn.utr,
      switchStatus: txn.bankSwitchStatus,
      network: 'NPCI / UPI 2.0',
      isWebhookTimedOut: txn.bankSwitchStatus === 'TIMEOUT',
      hasConflictFlag: txn.bankSwitchStatus === 'CONFLICT_FLAGGED',
    };
  },

  // Tool 3: Check Destination Ledger
  check_destination_ledger: async (receiverId: string) => {
    const user = await db.user.findUnique({ where: { id: receiverId } });
    if (!user) return { error: `Receiver account ${receiverId} not found.` };

    return {
      accountId: user.id,
      accountName: user.name,
      bank: user.bankName,
      accountNo: user.accountNo,
      currentBalance: user.balance,
    };
  },

  // Tool 4: Trace Refund Status (For Scenario 2)
  trace_refund_pipeline: async (txnId: string) => {
    const txn = await db.transaction.findUnique({ where: { id: txnId } });
    if (!txn) return { error: `Refund record ${txnId} not found.` };

    return {
      refundId: txn.id,
      amount: txn.amount,
      status: txn.pgStatus,
      bankClearance: txn.bankSwitchStatus,
      arnCode: txn.arnCode,
      estimatedSlaWindow: '2-4 business hours',
    };
  },

  // Tool 5: State-Changing Autonomous Action (Reconciliation)
  execute_reconciliation: async (txnId: string) => {
    const txn = await db.transaction.findUnique({ where: { id: txnId } });
    if (!txn) throw new Error('Transaction not found');

    // Run deterministic policy check
    const policy = evaluateActionPolicy(txn.amount, txn.bankSwitchStatus === 'CONFLICT_FLAGGED');
    if (!policy.allowed) {
      throw new Error(`Policy Violation: ${policy.reason}`);
    }

    // Mutate state in DB
    const updatedUser = await db.user.update({
      where: { id: txn.receiverId },
      data: {
        balance: { increment: txn.amount },
      },
    });

    const updatedTxn = await db.transaction.update({
      where: { id: txnId },
      data: {
        ledgerStatus: 'CREDITED',
        bankSwitchStatus: 'SUCCESS',
      },
    });

    // Record audit log
    await db.auditLog.create({
      data: {
        step: 'ACTION_EXECUTE',
        action: 'execute_reconciliation',
        details: `Credited ₹${txn.amount} to ${updatedUser.name} (Txn: ${txnId}). New balance: ₹${updatedUser.balance}`,
      },
    });

    return {
      success: true,
      txnId,
      amountCredited: txn.amount,
      receiverNewBalance: updatedUser.balance,
      ledgerStatus: updatedTxn.ledgerStatus,
    };
  },

  // Tool 6: Intelligent Escalation (For Scenario 3)
  escalate_to_human: async (data: {
    txnId: string;
    amount: number;
    reason: string;
    aiSummary: string;
    recommendedAction: string;
  }) => {
    const ticket = await db.escalatedTicket.create({
      data: {
        txnId: data.txnId,
        amount: data.amount,
        priority: 'HIGH',
        reason: data.reason,
        aiSummary: data.aiSummary,
        recommendedAction: data.recommendedAction,
        status: 'OPEN',
      },
    });

    await db.auditLog.create({
      data: {
        step: 'ESCALATION_TRIGGER',
        action: 'escalate_to_human',
        details: `Case #${ticket.id} created for human operations desk. Reason: ${data.reason}`,
      },
    });

    return {
      escalated: true,
      ticketId: ticket.id,
      status: ticket.status,
      message: 'Escalation Case Brief delivered to internal Human Operations Center.',
    };
  },
};
