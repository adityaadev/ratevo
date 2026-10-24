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

export function getPlanFeatures(planId: string): string[] {
  const baseFeatures = [
    "Unlimited QR codes",
    "AI review generation",
    "Analytics dashboard",
    "Google review integration",
    "Email support",
  ];
  
  if (planId === "yearly") {
    return [...baseFeatures, "Priority support", "2 months free vs monthly"];
  }
  
  return baseFeatures;
}