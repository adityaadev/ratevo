import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { businessApi } from '../services/api'
import QRCode from 'qrcode.react'
import QRCodeLib from 'qrcode'
import { Button } from '../components'

function getQrSize() {
  if (typeof window === 'undefined') return 200
  const maxWidth = window.innerWidth - 64 // account for padding
  return Math.min(200, Math.max(150, maxWidth))
}

const DESIGN_OPTIONS = {
  light: { label: 'Light', bg: '#FFFFFF', qrFg: '#000000', text: '#000000', subText: '#4B4B4B', border: '#E5E5E5' },
  dark: { label: 'Dark', bg: '#000000', qrFg: '#000000', text: '#FFFFFF', subText: '#E5E5E5', border: '#333333' }
}

export default function QrCodePage() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [qrSize, setQrSize] = useState(200)
  const [selectedDesign, setSelectedDesign] = useState('light')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const handleResize = () => setQrSize(getQrSize())
    setQrSize(getQrSize())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const generateBrandedQrCanvas = async (design) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const colors = DESIGN_OPTIONS[design]
    const padding = 40
    const qrModuleSize = 300 // 300x300 QR
    const headerHeight = 80
    const footerHeight = 50
    const totalHeight = headerHeight + qrModuleSize + footerHeight + padding * 2
    const totalWidth = qrModuleSize + padding * 2

    canvas.width = totalWidth * 2
    canvas.height = totalHeight * 2
    ctx.scale(2, 2)

    // Background
    ctx.fillStyle = colors.bg
    ctx.fillRect(0, 0, totalWidth, totalHeight)

    // Border
    ctx.strokeStyle = colors.border
    ctx.lineWidth = 2
    ctx.strokeRect(padding, padding, qrModuleSize, qrModuleSize)

    // Business name
    ctx.fillStyle = colors.text
    ctx.font = 'bold 24px Geist, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    let businessName = business?.name || 'Ratevo'
    // Truncate if too long
    const maxNameWidth = qrModuleSize - 20
    const metrics = ctx.measureText(businessName)
    if (metrics.width > maxNameWidth) {
      ctx.font = 'bold 20px Geist, system-ui, sans-serif'
      while (ctx.measureText(businessName).width > maxNameWidth && businessName.length > 3) {
        businessName = businessName.slice(0, -1)
      }
      businessName += '...'
    }
    ctx.fillText(businessName, totalWidth / 2, padding / 2)

    // Brand text
    ctx.fillStyle = colors.subText
    ctx.font = '14px Geist, system-ui, sans-serif'
    ctx.fillText('RATEVO BY XOIEX', totalWidth / 2, totalHeight - footerHeight / 2)

    // Generate QR code as image and draw it
    const qrCanvas = document.createElement('canvas')
    const qrCtx = qrCanvas.getContext('2d')
    qrCanvas.width = qrModuleSize
    qrCanvas.height = qrModuleSize

    // Use QRCode library to generate to canvas
    // We'll create a temporary QRCode component render to canvas
    await new Promise((resolve, reject) => {
      QRCodeLib.toCanvas(qrCanvas, qrUrl, {
        width: qrModuleSize,
        margin: 2,
        color: {
          dark: colors.qrFg,
          light: design === 'light' ? '#FFFFFF' : '#000000'
        },
        errorCorrectionLevel: 'M'
      }, (err) => {
        if (err) {
          console.error('QR generation error:', err)
          reject(err)
        } else {
          resolve()
        }
      })
    })

    // Draw QR code onto main canvas
    const qrX = padding
    const qrY = padding + headerHeight / 2 - qrModuleSize / 2
    ctx.drawImage(qrCanvas, qrX, qrY, qrModuleSize, qrModuleSize)

    return canvas
  }

  const downloadQr = async () => {
    if (!business || downloading) return
    setDownloading(true)
    try {
      const canvas = await generateBrandedQrCanvas(selectedDesign)
      // Safety check: ensure canvas has content
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error('Generated canvas is empty')
      }
      const link = document.createElement('a')
      const safeName = (business.name || 'ratevo').replace(/[^a-z0-9]/gi, '_').toLowerCase()
      link.download = `${safeName}-qr-${selectedDesign}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to download QR:', err)
      // Fallback to simple QR
      try {
        const fallbackCanvas = document.createElement('canvas')
        await new Promise((resolve, reject) => {
          QRCodeLib.toCanvas(fallbackCanvas, qrUrl, {
            width: 400,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' },
            errorCorrectionLevel: 'M'
          }, (err) => {
            if (err) reject(err)
            else resolve()
          })
        })
        const link = document.createElement('a')
        const safeName = (business.name || 'ratevo').replace(/[^a-z0-9]/gi, '_').toLowerCase()
        // Safety check for fallback canvas
        if (!fallbackCanvas || fallbackCanvas.width === 0 || fallbackCanvas.height === 0) {
          throw new Error('Fallback canvas is empty')
        }
        link.download = `${safeName}-qr.png`
        link.href = fallbackCanvas.toDataURL('image/png')
        link.click()
      } catch (fallbackErr) {
        console.error('Fallback download also failed:', fallbackErr)
      }
    } finally {
      setDownloading(false)
    }
  }

  // QRCode component import already at top

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
        {/* Design Selector */}
        <div className="space-y-4">
          <label className="label">Design Style</label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="QR Design Style">
            {Object.entries(DESIGN_OPTIONS).map(([key, design]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDesign(key)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all flex flex-col items-center gap-3 ${
                  selectedDesign === key
                    ? 'border-white bg-white/5 ring-2 ring-white ring-offset-2 ring-offset-bg'
                    : 'border-[var(--border)] hover:border-white/50 hover:bg-white/5'
                }`}
                role="radio"
                aria-checked={selectedDesign === key}
              >
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                  design === 'light' ? 'bg-white border border-[var(--border)]' : 'bg-black border border-white/20'
                }`}>
                  <span className={`text-2xl font-bold ${design === 'light' ? 'text-black' : 'text-white'}`}>
                    {'▓░▓'}
                  </span>
                </div>
                <span className="text-sm font-medium text-white capitalize">{design.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview & QR Code */}
        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-xl border border-white/10">
            <QRCode
              value={qrUrl}
              size={qrSize}
              level="M"
              includeMargin={true}
              bgColor={DESIGN_OPTIONS[selectedDesign].bg === '#FFFFFF' ? '#FFFFFF' : '#000000'}
              fgColor={DESIGN_OPTIONS[selectedDesign].qrFg}
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
            <Button
              variant="primary"
              onClick={downloadQr}
              width="full"
              disabled={downloading}
            >
              {downloading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR ({DESIGN_OPTIONS[selectedDesign].label})
                </>
              )}
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
            <li>Choose a design style (Light or Dark)</li>
            <li>Download the QR code as a branded PNG image</li>
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