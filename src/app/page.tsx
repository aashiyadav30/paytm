'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShieldCheck, MessageSquare, LayoutDashboard, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

export default function Home() {
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handleReset = async () => {
    setResetting(true);
    setResetMsg('');
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResetMsg('✅ Database reset to initial state (Amit balance = ₹0.00)!');
      } else {
        setResetMsg('❌ Failed to reset: ' + data.error);
      }
    } catch (e: any) {
      setResetMsg('❌ Error: ' + e.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#002970] text-white px-2.5 py-1 rounded text-xs font-bold tracking-wider">
                PAYTM RESOLVEX
              </span>
              <span className="text-xs bg-sky-100 text-[#00baf2] font-semibold px-2 py-0.5 rounded">
                Track 3: Autonomous AI Teammate
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#002970] mt-2">
              Autonomous FinTech Resolution Digital Employee
            </h1>
            <p className="text-slate-600 mt-1 max-w-2xl">
              An agentic AI teammate that investigates cross-system banking ledgers, safely executes permitted reconciliations, verifies real state changes, and escalates complex disputes.
            </p>
          </div>

          {/* 1-Click Demo Reset Button */}
          <div className="flex flex-col items-end">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? 'Resetting DB...' : 'Reset Demo Data'}
            </button>
            {resetMsg && <span className="text-xs text-emerald-600 font-medium mt-1">{resetMsg}</span>}
          </div>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Card 1: User Dispute Portal */}
          <Link
            href="/dispute"
            className="group block p-8 bg-white border border-slate-200 hover:border-[#00baf2] rounded-2xl shadow-sm hover:shadow-md transition relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-[#00baf2] group-hover:w-3 transition-all" />
            <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-[#00baf2] mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#002970]">User Dispute Portal</h2>
            <p className="text-slate-500 text-sm mt-2">
              The customer-facing conversational interface where users report missing funds, track delayed refunds, and trigger automated reconciliations.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#00baf2]">
              Launch User Screen &rarr;
            </div>
          </Link>

          {/* Card 2: Human Operations Center */}
          <Link
            href="/ops"
            className="group block p-8 bg-white border border-slate-200 hover:border-[#002970] rounded-2xl shadow-sm hover:shadow-md transition relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-[#002970] group-hover:w-3 transition-all" />
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-[#002970] mb-4">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-[#002970]">Human Operations Center</h2>
            <p className="text-slate-500 text-sm mt-2">
              The internal command center for Paytm operations. Inspect live ledger balance changes, view automated audit logs, and resolve pre-investigated AI Case Briefs.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#002970]">
              Launch Operations Desk &rarr;
            </div>
          </Link>
        </div>

        {/* 3 Benchmark Demos Info Bar */}
        <div className="mt-10 bg-slate-900 text-slate-200 p-6 rounded-2xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#00baf2] uppercase tracking-wider mb-2">
            <Cpu className="w-4 h-4" /> Live Hackathon Demo Scenarios Included
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-3">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="font-bold text-emerald-400 block mb-1">Demo 1: Auto-Reconcile (₹2,000)</span>
              Webhook timeout between banks. Agent audits PG, verifies policy, reconciles ledger, confirms state change live.
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="font-bold text-sky-400 block mb-1">Demo 2: Refund Trace (₹1,500)</span>
              Delayed reversal past SLA. Agent queries bank switch, pulls exact Bank ARN reference, updates user.
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="font-bold text-amber-400 block mb-1">Demo 3: Escalation (₹12,000)</span>
              Duplicate debit dispute. Exceeds ₹5,000 limit; agent halts auto-write, compiles Case Brief for human ops.
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-4">
        Paytm ResolveX • Smart India Hackathon 2026 • Team Abhiyantas
      </footer>
    </main>
  );
}
