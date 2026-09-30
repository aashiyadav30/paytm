import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { agentTools } from '../src/lib/agent-tools';
import { evaluateActionPolicy } from '../src/lib/policy-gate';
import * as dotenv from 'dotenv';
dotenv.config();

// Define tool schemas for Gemini
const auditPaymentGatewayDeclaration = {
  name: 'audit_payment_gateway',
  description: 'Check Payment Gateway logs for transaction status, amount, and UTR number.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      txnId: { type: SchemaType.STRING, description: 'The transaction ID, e.g. TXN_84920' },
    },
    required: ['txnId'],
  },
};

const auditBankSwitchDeclaration = {
  name: 'audit_bank_switch',
  description: 'Query downstream banking switch / NPCI for webhook timeout or drop status using the UTR.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      utr: { type: SchemaType.STRING, description: 'The UTR reference number' },
    },
    required: ['utr'],
  },
};

const checkDestinationLedgerDeclaration = {
  name: 'check_destination_ledger',
  description: 'Check current balance of the receiver account ledger.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      receiverId: { type: SchemaType.STRING, description: 'The receiver user ID' },
    },
    required: ['receiverId'],
  },
};

const executeReconciliationDeclaration = {
  name: 'execute_reconciliation',
  description: 'Execute state-changing reconciliation to credit receiver account if within policy limit (<= ₹5,000).',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      txnId: { type: SchemaType.STRING, description: 'The transaction ID to reconcile' },
    },
    required: ['txnId'],
  },
};

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log('=================================================================');
  console.log('🤖 PAYTM RESOLVEX: SAMPLE LLM AGENTIC FUNCTION CALLING TEST');
  console.log('=================================================================\n');

  if (!apiKey || apiKey === 'your_actual_gemini_api_key_here') {
    console.log('⚠️  No GEMINI_API_KEY detected in .env file.');
    console.log('👉 To run with a live Google Gemini model:');
    console.log('   1. Get a free API key at https://aistudio.google.com/app/apikey');
    console.log('   2. Add it to .env: GEMINI_API_KEY="your-key-here"');
    console.log('   3. Run: npx tsx scripts/test-agent-llm.ts\n');
    console.log('-----------------------------------------------------------------');
    console.log('🔄 Running demonstration of the Agentic ReAct Loop in local mode:');
    console.log('-----------------------------------------------------------------\n');

    // Run local ReAct demonstration
    console.log('📥 USER INPUT: "I sent ₹2,000 to Amit (TXN_84920). My HDFC account was debited but his ICICI shows ₹0."\n');

    console.log('💭 [LLM THOUGHT]: User reported uncredited transfer. First step: audit payment gateway for TXN_84920.');
    console.log('🛠️  [TOOL ACTION]: Calling audit_payment_gateway("TXN_84920")...');
    const pg = await agentTools.audit_payment_gateway('TXN_84920');
    console.log('👁️  [OBSERVATION]:', pg, '\n');

    if ('utr' in pg && 'receiverId' in pg) {
      console.log('💭 [LLM THOUGHT]: Payment Gateway confirmed SUCCESS. Next, query downstream banking switch for UTR:', pg.utr);
      console.log(`🛠️  [TOOL ACTION]: Calling audit_bank_switch("${pg.utr}")...`);
      const bank = await agentTools.audit_bank_switch(pg.utr);
      console.log('👁️  [OBSERVATION]:', bank, '\n');

      console.log('💭 [LLM THOUGHT]: Bank switch timed out during webhook delivery! Now checking destination ledger balance...');
      console.log(`🛠️  [TOOL ACTION]: Calling check_destination_ledger("${pg.receiverId}")...`);
      const ledgerBefore = await agentTools.check_destination_ledger(pg.receiverId);
      console.log('👁️  [OBSERVATION]: Initial Balance = ₹' + ledgerBefore.currentBalance, '\n');

      console.log('🛡️  [POLICY EVALUATION]: Checking financial guardrails for Amount: ₹' + pg.amount);
      const policy = evaluateActionPolicy(pg.amount, false);
      console.log('    ➔ Result:', policy.allowed ? 'PASS (<= ₹5,000)' : 'FAIL', '| Reason:', policy.reason, '\n');

      if (policy.allowed) {
        console.log('💭 [LLM THOUGHT]: Policy approved. Executing autonomous reconciliation to credit receiver...');
        console.log('🛠️  [TOOL ACTION]: Calling execute_reconciliation("TXN_84920")...');
        const reconcileRes = await agentTools.execute_reconciliation('TXN_84920');
        console.log('👁️  [OBSERVATION]:', reconcileRes, '\n');

        console.log('🔍 [STATE VERIFICATION]: Re-auditing destination ledger to verify state mutation...');
        const ledgerAfter = await agentTools.check_destination_ledger(pg.receiverId);
        console.log('👁️  [OBSERVATION]: Verified Balance = ₹' + ledgerAfter.currentBalance + ' (State confirmed! ✅)\n');

        console.log('🎯 [FINAL LLM RESPONSE TO USER]:');
        console.log(`"Good news! We audited your transaction (TXN_84920). We identified that your downstream bank webhook timed out during credit delivery. Our autonomous teammate has reconciled the ledger and confirmed ₹2,000.00 is now deposited in Amit's account. UTR: ${pg.utr}."\n`);
      }
    }
    return;
  }

  // Live Gemini Model Mode
  console.log('✨ Connecting to Live Gemini 1.5 Flash Model...\n');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    tools: [
      {
        functionDeclarations: [
          auditPaymentGatewayDeclaration,
          auditBankSwitchDeclaration,
          checkDestinationLedgerDeclaration,
          executeReconciliationDeclaration,
        ],
      },
    ],
  });

  const chat = model.startChat();
  const userPrompt = 'I sent ₹2,000 to Amit (TXN_84920). My HDFC account got debited but his ICICI account has not received it. Investigate and resolve.';
  console.log(`📥 USER PROMPT: "${userPrompt}"\n`);

  let result = await chat.sendMessage(userPrompt);
  let calls = result.response.functionCalls();

  while (calls && calls.length > 0) {
    for (const call of calls) {
      console.log(`🤖 LLM DECIDED TO CALL TOOL: [${call.name}]`);
      console.log('   Arguments:', call.args);

      let toolOutput: any;
      if (call.name === 'audit_payment_gateway') {
        toolOutput = await agentTools.audit_payment_gateway((call.args as any).txnId);
      } else if (call.name === 'audit_bank_switch') {
        toolOutput = await agentTools.audit_bank_switch((call.args as any).utr);
      } else if (call.name === 'check_destination_ledger') {
        toolOutput = await agentTools.check_destination_ledger((call.args as any).receiverId);
      } else if (call.name === 'execute_reconciliation') {
        toolOutput = await agentTools.execute_reconciliation((call.args as any).txnId);
      } else {
        toolOutput = { error: 'Unknown tool' };
      }

      console.log('   Tool Output (Returned to LLM):', toolOutput, '\n');

      result = await chat.sendMessage([
        {
          functionResponse: {
            name: call.name,
            response: { output: toolOutput },
          },
        },
      ]);
    }
    calls = result.response.functionCalls();
  }

  console.log('🎯 FINAL LLM RESPONSE:');
  console.log(result.response.text());
}

main().catch(console.error);
