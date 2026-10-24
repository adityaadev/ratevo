import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { businessApi } from '../services/api'
import QRCode from 'qrcode.react'
import { Button } from '../components'

export default function QrCodePage() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadBusiness()
  }, [])

  const loadBusiness = async () => {
    try {
      const businesses = await businessApi.getAll()
      if (businesses.length > 0) {
        const biz = businesses[0]
        setBusiness(biz)
        const publicUrl = `${window.location.origin}/r/${biz.slug}`
        setQrUrl(publicUrl)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadQr = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `${business?.name || 'ratevo'}-qr-code.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16">
          <svg className="mx-auto h-16 w-16 text-[var(--text-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <h2 className="mt-4 text-heading-md font-semibold text-white">No business found</h2>
          <p className="mt-2 text-[var(--text-muted)]">Create a business first to generate your QR code</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-heading-lg font-bold text-white">QR Code</h1>
        <p className="text-[var(--text-muted)]">Share this QR code to collect customer reviews</p>
      </div>

      <div className="card p-6 space-y-6">
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-xl border border-white/10">
            <QRCode
              value={qrUrl}
              size={200}
              level="M"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Scans open: <span className="font-mono text-white">{qrUrl}</span>
          </p>
        </div>

        <div className="border-t border-[var(--border)] pt-6 space-y-4">
          <div>
            <label className="label">Public Review URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrUrl}
                readOnly
                className="input flex-1 bg-white/5"
              />
              <Button
                variant="secondary"
                onClick={copyUrl}
                className={copied ? 'bg-white text-black' : ''}
                aria-label={copied ? 'Copied!' : 'Copy URL'}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" onClick={downloadQr} width="full">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR (PNG)
            </Button>
            <Button variant="outline" width="full" asChild>
              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Test Link
              </a>
            </Button>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-6">
          <h3 className="text-lg font-medium text-white mb-4">How to use</h3>
          <ol className="space-y-2 text-sm text-[var(--text-muted)] list-decimal list-inside">
            <li>Download the QR code as a PNG image</li>
            <li>Print it on table tents, receipts, window stickers, or menus</li>
            <li>Customers scan with their phone camera</li>
            <li>They rate their experience and AI generates a review draft</li>
            <li>They click &ldquo;Review on Google&rdquo; to post directly</li>
          </ol>
        </div>
      </div>
    </div>
  )
}