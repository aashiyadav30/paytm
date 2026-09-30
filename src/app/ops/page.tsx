import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { revalidatePath } from 'next/cache';

// Action to resolve ticket
async function resolveTicket(ticketId: string) {
  'use server';
  await db.escalatedTicket.update({
    where: { id: ticketId },
    data: { status: 'RESOLVED' },
  });
  revalidatePath('/ops');
}

export default async function OpsDashboard() {
  const users = await db.user.findMany();
  const tickets = await db.escalatedTicket.findMany({ orderBy: { createdAt: 'desc' } });
  const auditLogs = await db.auditLog.findMany({ take: 6, orderBy: { timestamp: 'desc' } });
  const transactions = await db.transaction.findMany({ orderBy: { createdAt: 'desc' } });

  const amit = users.find((u) => u.id === 'USR_AMIT');
  const rahul = users.find((u) => u.id === 'USR_RAHUL');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:bg-slate-800 p-1.5 rounded-lg transition text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              Paytm Internal Operations Center <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded font-semibold">Tier-2 Settlement Desk</span>
            </h1>
            <p className="text-xs text-slate-400">Human-in-the-Loop Collaboration Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dispute" className="text-xs bg-[#00baf2] hover:bg-sky-400 text-white font-medium px-3 py-1.5 rounded-lg transition">
            &larr; Return to User Dispute Chat
          </Link>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto p-4 md:p-8 flex-1 space-y-8">
        
        {/* Row 1: Live Ledger Balances (Proof of State Change) */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Live Core Ledger State Monitor
            </h2>
            <span className="text-xs text-slate-500">Auto-refreshes on agent reconciliation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender Account */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Sender (Payer)</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{rahul?.name}</div>
                <div className="text-xs text-slate-500 font-mono mt-1">{rahul?.upiId} • {rahul?.bankName} ({rahul?.accountNo})</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block">Available Balance</span>
                <span className="text-2xl font-extrabold text-slate-900 font-mono">
                  ₹{rahul?.balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Receiver Account (Watch this update live!) */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#00baf2] shadow-sm flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#00baf2] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">
                Destination Ledger
              </div>
              <div>
                <span className="text-xs text-sky-600 uppercase font-semibold">Receiver (Payee Account)</span>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{amit?.name}</div>
                <div className="text-xs text-slate-500 font-mono mt-1">{amit?.upiId} • {amit?.bankName} ({amit?.accountNo})</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block">Destination Balance</span>
                <span className={`text-2xl font-extrabold font-mono transition-all duration-500 ${amit && amit.balance > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  ₹{amit?.balance.toLocaleString('en-IN')}
                </span>
                {amit && amit.balance > 0 && (
                  <span className="text-[10px] text-emerald-600 font-bold block">✓ Credited via AI Action</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Escalated AI Case Briefs (Human Takeover) */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Escalated Case Briefs Queue
            </h2>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              {tickets.filter((t) => t.status === 'OPEN').length} Pending Human Review
            </span>
          </div>

          {tickets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
              No escalated tickets in queue. Run <b>Demo 3: Escalation Case</b> from the User Dispute screen to see an AI Case Brief generated here!
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className={`bg-white rounded-2xl p-6 border shadow-sm transition ${
                    t.status === 'RESOLVED' ? 'border-emerald-200 opacity-60' : 'border-amber-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-500 mr-2">TICKET #{t.id.slice(0, 8)}</span>
                      <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded mr-2">HIGH PRIORITY</span>
                      <span className="text-xs font-mono text-slate-600">Txn Ref: {t.txnId}</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-900 font-mono">₹{t.amount.toLocaleString('en-IN')}</span>
                      {t.status === 'OPEN' ? (
                        <form action={resolveTicket.bind(null, t.id)}>
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> 1-Click Approve Reversal
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Resolved by Human Agent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Case Dossier Box */}
                  <div className="mt-4 bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs leading-relaxed">
                    <div className="text-[#00baf2] font-bold uppercase mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> AI Investigation Case Brief (Zero Context Loss)
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300">{t.aiSummary}</pre>
                    <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col md:flex-row justify-between gap-2 text-slate-400">
                      <div>
                        <span className="text-amber-400 font-bold">Policy Gate Trigger:</span> {t.reason}
                      </div>
                      <div>
                        <span className="text-emerald-400 font-bold">Recommended Human Action:</span> {t.recommendedAction}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row 3: Automated Audit Trails */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            Immutable Action Audit Trail
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No automated actions logged yet.</div>
            ) : (
              <div className="divide-y divide-slate-100 font-mono">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                        {log.step}
                      </span>
                      <span className="text-slate-800 font-medium">{log.details}</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
