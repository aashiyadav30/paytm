import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function resetAndSeedDatabase() {
  console.log('🔄 Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.escalatedTicket.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Seeding users...');
  const rahul = await prisma.user.create({
    data: {
      id: 'USR_RAHUL',
      name: 'Rahul Sharma (Sender)',
      phone: '+91 98765 43210',
      upiId: 'rahul@paytm',
      bankName: 'HDFC Bank',
      accountNo: 'XXXX-XXXX-4921',
      balance: 15000.0,
      role: 'PAYER',
    },
  });

  const amit = await prisma.user.create({
    data: {
      id: 'USR_AMIT',
      name: 'Amit Verma (Receiver / Shop)',
      phone: '+91 91234 56789',
      upiId: 'amit@paytm',
      bankName: 'ICICI Bank',
      accountNo: 'XXXX-XXXX-8812',
      balance: 0.0, // Initial balance: 0.0, so the AI can reconcile and credit!
      role: 'PAYEE',
    },
  });

  console.log('🌱 Seeding 3 Golden Demo Scenarios...');
  
  // Case 1: Routine Webhook Timeout (Auto-Reconciled by AI)
  await prisma.transaction.create({
    data: {
      id: 'TXN_84920',
      utr: '409218491028',
      amount: 2000.0,
      senderId: rahul.id,
      receiverId: amit.id,
      type: 'P2P',
      pgStatus: 'SUCCESS',          // Payment Gateway received funds
      bankSwitchStatus: 'TIMEOUT',  // Webhook dropped by bank switch
      ledgerStatus: 'UNCREDITED',   // Amit's ledger balance not yet updated
      issueDescription: '₹2,000 debited from HDFC, but receiver account shows ₹0.',
    },
  });

  // Case 2: Delayed Refund (Automated ARN Trace)
  await prisma.transaction.create({
    data: {
      id: 'TXN_REF_3021',
      utr: '409218499999',
      amount: 1500.0,
      senderId: rahul.id,
      receiverId: 'MERCH_IRCTC',
      type: 'REFUND',
      pgStatus: 'REFUND_INITIATED',
      bankSwitchStatus: 'PENDING_CLEARING',
      ledgerStatus: 'AWAITING_BANK_ACK',
      arnCode: 'ARN-849201948201-HDFC',
      issueDescription: 'Booking cancelled 4 days ago. ₹1,500 refund not credited.',
    },
  });

  // Case 3: High-Value Dual-Debit (Intelligent Human Escalation)
  await prisma.transaction.create({
    data: {
      id: 'TXN_DUAL_9910',
      utr: '409218551122',
      amount: 12000.0,             // Exceeds ₹5,000 threshold
      senderId: rahul.id,
      receiverId: amit.id,
      type: 'P2M',
      pgStatus: 'SUCCESS',
      bankSwitchStatus: 'CONFLICT_FLAGGED',
      ledgerStatus: 'HELD_IN_ESCROW',
      issueDescription: '₹12,000 debited twice within 30 seconds for a single order.',
    },
  });

  console.log('✅ Seeding completed successfully!');
}

if (require.main === module) {
  resetAndSeedDatabase()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
