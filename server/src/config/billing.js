export const BILLING_CONFIG = {
  currency: "INR",
  plans: {
    monthly: {
      id: "monthly",
      name: "Monthly",
      amountPaise: 9900,
      amountDisplay: "99",
      intervalDays: 30,
      label: "Limited time offer",
      regularPriceDisplay: "149",
    },
    yearly: {
      id: "yearly",
      name: "Yearly",
      amountPaise: 109900,
      amountDisplay: "1099",
      intervalDays: 365,
      label: "Limited time offer",
      regularPriceDisplay: "1788",
    },
  },
  freeTrialDays: 7,
  monthlyReviewCap: 300,
  gracePeriodDays: 5,
  showGstInclusive: false,
  gstRate: 0.18,
};

export function getPlanById(id) {
  return BILLING_CONFIG.plans[id];
}

export function formatAmount(paise) {
  const rupees = (paise / 100).toFixed(2);
  return `₹${rupees}`;
}

export function calculatePaidUntil(planId, fromDate = new Date()) {
  const plan = getPlanById(planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  const result = new Date(fromDate);
  result.setDate(result.getDate() + plan.intervalDays);
  return result;
}

export function getSubscriptionStatus(
  trialEndsAt,
  paidUntil,
  subscriptionStatus
) {
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