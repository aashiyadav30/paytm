'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, Bot, User, ArrowLeft, RefreshCw, CheckCircle, ShieldAlert, Clock, Sparkles } from 'lucide-react';

interface TraceStep {
  step: string;
  type: 'THOUGHT' | 'ACTION' | 'OBSERVE' | 'POLICY' | 'VERIFY';
  description: string;
  timestamp: string;
}

interface Message {
  sender: 'user' | 'agent';
  text: string;
  trace?: TraceStep[];
  status?: string;
}

export default function DisputePortal() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      text: 'Hello Rahul! I am your Paytm ResolveX AI Teammate. If you have any payment failure, delayed refund, or uncredited transfer, tell me below or pick one of the test scenarios to inspect live.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTrace, setActiveTrace] = useState<TraceStep[]>([]);

  const handleSend = async (queryText?: string, explicitTxnId?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend, txnId: explicitTxnId }),
      });
      const data = await res.json();

      if (data.trace) {
        setActiveTrace(data.trace);
      }

      setMessages([
        ...newMessages,
        {
          sender: 'agent',
          text: data.message || data.error,
          trace: data.trace,
          status: data.status,
        },
      ]);
    } catch (e: any) {
      setMessages([
        ...newMessages,
        { sender: 'agent', text: 'An error occurred during agent processing: ' + e.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#002970] text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:bg-slate-800 p-1.5 rounded-lg transition text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              Paytm ResolveX <span className="text-xs bg-[#00baf2] text-white px-2 py-0.5 rounded font-semibold">User Dispute Portal</span>
            </h1>
            <p className="text-xs text-sky-200">Autonomous FinTech Agentic Resolver</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ops" className="text-xs bg-sky-500 hover:bg-sky-400 text-white font-medium px-3 py-1.5 rounded-lg transition">
            View Ops Center &rarr;
          </Link>
        </div>
      </header>

      {/* Main Grid: Chat + Live Agent Trace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chat Thread (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-[80vh]">
          {/* Quick Demo Launchers */}
          <div className="bg-slate-50 border-b border-slate-200 p-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00baf2]" /> Quick Hackathon Scenarios (1-Click Run)
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSend("I paid ₹2,000 for dinner to Amit (Txn TXN_84920). My HDFC account got debited, but his ICICI account hasn't received it.", "TXN_84920")}
                disabled={loading}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 px-2.5 py-1.5 rounded-lg font-medium transition"
              >
                1. Auto-Reconcile (₹2,000)
              </button>
              <button
                onClick={() => handleSend("I cancelled my booking 4 days ago. My ₹1,500 refund (TXN_REF_3021) has not arrived in my account.", "TXN_REF_3021")}
                disabled={loading}
                className="text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 px-2.5 py-1.5 rounded-lg font-medium transition"
              >
                2. Trace Refund ARN (₹1,500)
              </button>
              <button
                onClick={() => handleSend("₹12,000 was debited twice from my account within 30 seconds (Txn TXN_DUAL_9910).", "TXN_DUAL_9910")}
                disabled={loading}
                className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 px-2.5 py-1.5 rounded-lg font-medium transition"
              >
                3. Escalation Case (₹12,000)
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'agent' && (
                  <div className="w-8 h-8 rounded-full bg-[#002970] text-[#00baf2] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#002970] text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.status && (
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-xs font-bold">
                      {m.status === 'RESOLVED' ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Autonomously Resolved
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Escalated to Human Operations Desk
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 items-center text-slate-500 text-xs p-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#00baf2]" />
                Paytm AI Teammate is auditing banking ledgers & evaluating policy gates...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your transaction issue (or click a scenario above)..."
              className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00baf2]"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="bg-[#002970] hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Live Agent Reasoning & State Trace (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col h-[80vh] overflow-hidden">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Agent Reasoning & Action Trace
              </h2>
              <p className="text-[11px] text-slate-400">ReAct Loop (Thought &rarr; Tool Action &rarr; Observe &rarr; Verify)</p>
            </div>
            <span className="text-xs bg-slate-800 text-[#00baf2] px-2 py-0.5 rounded font-mono">
              {activeTrace.length} Steps Executed
            </span>
          </div>

          {/* Trace Timeline */}
          <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-1">
            {activeTrace.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-6">
                <Clock className="w-8 h-8 mb-2 stroke-1 text-slate-600" />
                No active investigation. Trigger a scenario on the left to watch the agent reason across banking systems.
              </div>
            ) : (
              activeTrace.map((step, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide ${
                        step.type === 'THOUGHT'
                          ? 'bg-purple-900/60 text-purple-300'
                          : step.type === 'ACTION'
                          ? 'bg-blue-900/60 text-sky-300'
                          : step.type === 'POLICY'
                          ? 'bg-amber-900/60 text-amber-300'
                          : step.type === 'VERIFY'
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {step.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                  </div>
                  <div className="font-semibold text-slate-200 mt-1">{step.step}</div>
                  <div className="text-slate-300 font-mono mt-1 text-[11px] leading-relaxed bg-slate-900/50 p-2 rounded border border-slate-800">
                    {step.description}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
