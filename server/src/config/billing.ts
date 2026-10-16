export const BILLING_CONFIG = {
  currency: "INR",
  plans: {
    monthly: {
      id: "monthly",
      name: "Monthly",
      amountPaise: 9900,
      amountDisplay: "99",
      intervalDays: 30,
      label: "Launch Offer",
      regularPriceDisplay: "149",
    },
    yearly: {
      id: "yearly",
      name: "Yearly",
      amountPaise: 99900,
      amountDisplay: "999",
      intervalDays: 365,
      label: "Best Value",
      regularPriceDisplay: "1788",
    },
  },
  freeTrialDays: 7,
  monthlyReviewCap: 300,
  gracePeriodDays: 5,
  showGstInclusive: true,
  gstRate: 0.18,
};

export function getPlanById(id: string) {
  return BILLING_CONFIG.plans[id as keyof typeof BILLING_CONFIG.plans];
}

export function formatAmount(paise: number): string {
  const rupees = (paise / 100).toFixed(2);
  return `₹${rupees}`;
}

export function calculatePaidUntil(planId: string, fromDate: Date = new Date()): Date {
  const plan = getPlanById(planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  const result = new Date(fromDate);
  result.setDate(result.getDate() + plan.intervalDays);
  return result;
}

export function getSubscriptionStatus(
  trialEndsAt: Date | null,
  paidUntil: Date | null,
  subscriptionStatus: string
): { status: string; inGrace: boolean; daysLeft: number } {
  const now = new Date();
  
  if (subscriptionStatus === "active" && paidUntil) {
    const diffMs = paidUntil.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (daysLeft > 0) {
      return { status: "active", inGrace: false, daysLeft };
    }
    
    const graceEnd = new Date(paidUntil);
    graceEnd.setDate(graceEnd.getDate() + BILLING_CONFIG.gracePeriodDays);
    const graceDiffMs = graceEnd.getTime() - now.getTime();
    const graceDaysLeft = Math.ceil(graceDiffMs / (1000 * 60 * 60 * 24));
    
    if (graceDaysLeft > 0) {
      return { status: "grace", inGrace: true, daysLeft: graceDaysLeft };
    }
    
    return { status: "expired", inGrace: false, daysLeft: 0 };
  }
  
  if (subscriptionStatus === "trial" && trialEndsAt) {
    const diffMs = trialEndsAt.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { status: "trial", inGrace: false, daysLeft: Math.max(0, daysLeft) };
  }
  
  return { status: subscriptionStatus, inGrace: false, daysLeft: 0 };
}