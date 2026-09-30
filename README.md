# Paytm ResolveX: Autonomous AI Teammate
*Smart India Hackathon 2026 — Track 3: Autonomous AI Teammate*

An enterprise FinTech digital employee that investigates payment and refund discrepancies across core banking ledgers, takes permitted corrective actions, verifies real system state changes, and escalates complex disputes to human teams with zero context loss.

---

## 🚀 How to Run the App

1. **Install Dependencies** (Already completed):
   ```bash
   npm install
   ```

2. **Start the Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Reset Database to Initial State** (Anytime before a presentation):
   ```bash
   npm run seed
   ```
   *(Or click the "Reset Demo Data" button directly on the homepage!)*

---

## 🖥️ The 2 Main Screens

1. **User Dispute Portal** (`http://localhost:3000/dispute`):
   - Interactive WhatsApp/Paytm-style support interface.
   - 3 Quick 1-Click buttons to trigger the 3 Golden Demo Scenarios.
   - **Live Agent Reasoning & Action Trace drawer**: Shows Thoughts, Actions, Observations, Policy Checks, and Verifications live!

2. **Human Operations Center** (`http://localhost:3000/ops`):
   - **Live Core Ledger State Monitor**: Watch the destination ledger balance update live from ₹0 to ₹2,000 when Demo 1 is executed.
   - **Escalated Case Briefs Queue**: Rich AI Case Brief cards for high-value cases with 1-click human resolution.
   - **Immutable Action Audit Trail**: Complete log of all automated actions.

---

## 🎯 The 3 Live Demo Scenarios

| Scenario | Trigger | Agentic Loop Behavior | Outcome |
| :--- | :--- | :--- | :--- |
| **Demo 1: Auto-Reconciliation** | "I sent ₹2,000 to Amit (TXN_84920)..." | Audits PG, identifies bank switch webhook timeout, checks destination ledger (₹0), passes policy gate (<= ₹5,000), executes reconciliation. | **Live balance mutates from ₹0 $\rightarrow$ ₹2,000**. Confirmed via state verification. |
| **Demo 2: Refund Trace** | "Cancelled booking 4 days ago (TXN_REF_3021)..." | Audits refund pipeline, pulls Bank ARN from switch (`ARN-849201948201-HDFC`), calculates SLA window. | Returns exact bank reference code and expected settlement window. |
| **Demo 3: Escalation Case** | "₹12,000 debited twice (TXN_DUAL_9910)..." | Audits transaction, policy gate halts auto-write (> ₹5,000 limit), compiles structured Case Brief. | Dispatched to **Human Ops Desk** (`/ops`) with zero context loss. |
