export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  maxAutonomousLimit: number;
}

export const FINANCIAL_SAFETY_LIMIT = 5000.0; // In INR (₹5,000)

export function evaluateActionPolicy(
  amount: number,
  conflictFlag: boolean = false
): PolicyDecision {
  if (amount > FINANCIAL_SAFETY_LIMIT) {
    return {
      allowed: false,
      reason: `Amount (₹${amount.toLocaleString('en-IN')}) exceeds the autonomous limit of ₹${FINANCIAL_SAFETY_LIMIT.toLocaleString('en-IN')}. Requires human authorization.`,
      maxAutonomousLimit: FINANCIAL_SAFETY_LIMIT,
    };
  }

  if (conflictFlag) {
    return {
      allowed: false,
      reason: 'Conflicting transaction dispute flag active between institutions. Requires human investigation.',
      maxAutonomousLimit: FINANCIAL_SAFETY_LIMIT,
    };
  }

  return {
    allowed: true,
    reason: `Amount within safe autonomous limit (<= ₹${FINANCIAL_SAFETY_LIMIT.toLocaleString('en-IN')}) and zero active fraud/conflict flags.`,
    maxAutonomousLimit: FINANCIAL_SAFETY_LIMIT,
  };
}
