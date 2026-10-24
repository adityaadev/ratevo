export const BUSINESS_CONFIG = {
  brandName: "Ratevo",
  tagline: "by Xoiex",
  legalName: "Aditya Singh",
  address: "Lucknow, Uttar Pradesh, India",
  supportEmail: "ratevo.business@gmail.com",
  supportPhone: "8887471855",
  whatsappNumber: "918887471855",
  whatsappUrl: "https://wa.me/918887471855",
  gstin: "",
  supportHours: "Mon-Sat, 10:00-18:00 IST",
  jurisdiction: "Lucknow, Uttar Pradesh, India",
  website: "https://ratevo.site",
  showLawyerReviewBanner: false,
  lastLegalReviewDate: "2025-01-15",
};

export function getWhatsAppUrl(prefilledText?: string): string {
  const base = BUSINESS_CONFIG.whatsappUrl;
  if (prefilledText) {
    return `${base}?text=${encodeURIComponent(prefilledText)}`;
  }
  return base;
}