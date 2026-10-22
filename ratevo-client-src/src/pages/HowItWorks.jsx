import { Link } from 'react-router-dom'
import { Button } from '../components'

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Create your business profile",
      description: "Sign up and add your business details — name, category, address, and your Google Review link. Ratevo generates a unique slug for your business.",
      icon: BuildingIcon,
    },
    {
      number: 2,
      title: "Get your QR code",
      description: "Download a high-resolution QR code from your dashboard. Print it on table tents, receipts, window stickers, or menus — anywhere customers can scan.",
      icon: QrCodeIcon,
    },
    {
      number: 3,
      title: "Customers scan & rate",
      description: "Customers scan the QR code with their phone camera. They select a 1-5 star rating, choose what stood out (optional), and add a sentence in their own words.",
      icon: RatingIcon,
    },
    {
      number: 4,
      title: "AI generates a review draft",
      description: "Ratevo's AI creates a natural-sounding Google review draft using ONLY the customer's feedback. No invented details, no exaggeration — just their real experience in their voice.",
      icon: AiIcon,
    },
    {
      number: 5,
      title: "Customer reviews & edits",
      description: "The customer reads the draft, can edit it freely, or regenerate for a different tone. They stay in control of what gets posted.",
      icon: EditIcon,
    },
    {
      number: 6,
      title: "One click to post on Google",
      description: "Customer clicks 'Copy & Open Google Review' — the review text is copied to clipboard and Google Maps opens in a new tab. They paste and submit. Done.",
      icon: GoogleIcon,
    },
  ]

  const trustPoints = [
    "Reviews are drafted from the customer's actual feedback only",
    "Customers can edit or regenerate before posting",
    "Every customer sees the Google review link",
    "No incentives or review gating",
    "Business never sees customer contact info",
    "GDPR/Privacy compliant — anonymous feedback",
  ]

  return (
    <div className="min-h-screen bg-bg py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-heading-lg font-bold text-white tracking-tight">
            How Ratevo works
          </h1>
          <p className="mt-4 text-lg text-[var(--text-muted)]">
            From QR code to Google review in under 60 seconds — powered by real customer feedback.
          </p>
        </div>

        <div className="space-y-12">
          {steps.map((step) => (
            <StepRow key={step.number} {...step} />
          ))}
        </div>

        <div className="mt-16">
          <div className="card p-8">
            <h2 className="text-xl font-semibold text-white mb-8 text-center">Our review policy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trustPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[var(--text-muted)]">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button variant="primary" size="lg" asChild>
            <Link to="/pricing">Start free trial</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function StepRow({ number, title, description, icon: Icon }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="relative flex-shrink-0">
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black text-xs font-semibold flex items-center justify-center mono lg:left-auto lg:translate-x-0 lg:top-0">
          {number}
        </span>
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white lg:w-20 lg:h-20">
          <Icon className="w-8 h-8 lg:w-10 lg:h-10" />
        </div>
      </div>
      <div className="flex-1 text-center lg:text-left">
        <h3 className="text-heading-md font-bold text-white">{title}</h3>
        <p className="mt-2 text-[var(--text-muted)] leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function BuildingIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
}

function QrCodeIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
}

function RatingIcon({ className }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
}

function AiIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
}

function EditIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
}

function GoogleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}