import { Link } from 'react-router-dom'
import { Button } from '../components'

export default function FAQ() {
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create a Ratevo account?",
          a: "Click 'Get Started' on the homepage or go to /signup. You can sign up with email/password or use Google OAuth. After verifying your email, you'll land on the business setup page."
        },
        {
          q: "What information do I need to set up my business?",
          a: "You'll need: business name, category, full address, phone number (optional), and your Google Review URL (the 'Ask for reviews' link from Google Business Profile or a Google Maps link)."
        },
        {
          q: "How do I get my Google Review link?",
          a: "In Google Business Profile, go to 'Get more reviews' → 'Share review form' and copy the link. It looks like https://g.page/yourbusiness/review or https://maps.app.goo.gl/... Ratevo automatically converts Maps links to review links."
        },
      ]
    },
    {
      category: "Customer Review Flow",
      questions: [
        {
          q: "What does the customer see when they scan the QR code?",
          a: "They see your business name and category, then a 5-star rating selector. After rating, they can choose feedback tags (e.g., 'Helpful staff', 'Clean environment') and add custom text. AI then generates a review draft they can edit."
        },
        {
          q: "Can customers skip the feedback tags?",
          a: "Yes, the 'Skip & Write Review' button lets them go straight to the custom text step."
        },
        {
          q: "What if the AI generates something inaccurate?",
          a: "The customer sees the draft and can edit it freely before copying. They can also click 'Regenerate' for a different version. The business never posts automatically — the customer controls the final review."
        },
        {
          q: "Does Ratevo post reviews automatically?",
          a: "No. Ratevo never posts automatically. The customer clicks 'Copy & Open Google Review', which copies the text to clipboard and opens Google Maps in a new tab. They paste and submit manually."
        },
      ]
    },
    {
      category: "Billing & Subscription",
      questions: [
        {
          q: "What are the current prices?",
          a: "Monthly: ₹99/month (regular ₹149) — limited time offer. Yearly: ₹1,099/year (regular ₹1,788) — limited time offer, saves ₹689 vs monthly (about ₹92/month)."
        },
        {
          q: "Can I switch between monthly and yearly plans?",
          a: "Yes. Upgrades take effect immediately with prorated charges. Downgrades take effect at the end of your current billing period."
        },
        {
          q: "What payment methods are accepted?",
          a: "All major payment methods: UPI, credit/debit cards, net banking, and wallets. Payments are processed in INR."
        },
        {
          q: "What's your refund policy?",
          a: "Monthly plan: no refund after activation except for a billing error (duplicate or wrong charge). Yearly plan: refund on request within 7 days of activation. Contact ratevo.business@gmail.com or WhatsApp to request. Refund review within 7 working days."
        },
        {
          q: "How does the monthly review cap work?",
          a: "Each business can generate up to 300 AI reviews per month. This resets at the start of each billing cycle. The limit applies per business, not per account."
        },
      ]
    },
    {
      category: "Technical & Privacy",
      questions: [
        {
          q: "What data does Ratevo collect from customers?",
          a: "Only anonymous feedback: star rating, selected tags, and optional custom text. We never collect names, emails, or phone numbers from customers leaving reviews."
        },
        {
          q: "Is customer feedback used to train AI models?",
          a: "No, customer feedback is not used for AI model training. It's only used to generate that specific review draft and is not shared with third parties beyond the AI provider (Google Gemini) for that single generation request."
        },
        {
          q: "How is my business data handled?",
          a: "Data is stored in Supabase (PostgreSQL) with Row Level Security — you can only access your own businesses. All traffic uses TLS. Authentication uses Supabase Auth with JWT tokens."
        },
        {
          q: "Can I export my data?",
          a: "Yes, you can download your QR code as PNG. For full data export (analytics, review sessions), contact ratevo.business@gmail.com. Account deletion requests go to ratevo.business@gmail.com."
        },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-bg py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-heading-lg font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-[var(--text-muted)]">
            Can&apos;t find your answer? <Link to="/contact" className="text-white hover:underline font-medium">Contact us</Link>
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category} className="card p-6">
              <h2 className="text-xl font-semibold text-white mb-6">{section.category}</h2>
              <div className="space-y-3">
                {section.questions.map(({ q, a }) => (
                  <details key={q} className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-white/5 rounded-xl">
                      <span className="font-medium text-white pr-4">{q}</span>
                      <svg className="w-5 h-5 text-[var(--text-subtle)] transition-transform duration-200 group-open:rotate-180 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-4 pb-4 text-[var(--text-muted)] animate-slide-down">
                      {a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[var(--text-muted)] mb-4">
            Still have questions?
          </p>
          <Button variant="primary" size="lg" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}