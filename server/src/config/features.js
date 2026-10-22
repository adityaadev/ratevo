const paymentsProvider = process.env.PAYMENTS_PROVIDER || 'manual'

export const BILLING_UI_ENABLED = process.env.BILLING_UI_ENABLED !== 'false'
export const ENFORCE_TRIAL_LOCK = process.env.ENFORCE_TRIAL_LOCK === 'true'
export const PAYMENTS_PROVIDER = ['manual', 'cashfree'].includes(paymentsProvider)
  ? paymentsProvider
  : 'manual'