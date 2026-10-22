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
  showGstInclusive: false,
  gstRate: 0.18,
  showTaxNote: false,
};

export function getPlanById(id: string) {
  return BILLING_CONFIG.plans[id as keyof typeof BILLING_CONFIG.plans];
}

export function formatAmount(paise: number): string {
  const rupees = (paise / 100).toFixed(0);
  return `₹${rupees}`;
}

export function getPlanFeatures(planId: string): string[] {
  const baseFeatures = [
    "Unlimited QR codes & scans",
    "AI-powered review generation",
    "Real-time analytics dashboard",
    "“Copy & Open Google Review” flow",
    "QR code download (PNG)",
    "Email support",
  ];

  if (planId === "yearly") {
    return [...baseFeatures, "Priority support", "Save ₹689 vs monthly"];
  }

  return baseFeatures;
}