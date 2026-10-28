with open('client/src/pages/QrCodePage.jsx', 'r') as f:
    content = f.read()

old = '''  return (
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
                    <path className="opacity-75" fill="currentColor" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
  )'''

new = '''  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-heading-lg font-bold text-white">QR Code</h1>
        <p className="text-[var(--text-muted)]">Share this QR code to collect customer reviews</p>
      </div>

      <div className="card p-6 space-y-6">
        {/* Design Selector */}
        <div className="space-y-4 animate-fade-in delay-1">
          <label className="label">Design Style</label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="QR Design Style">
            {Object.entries(DESIGN_OPTIONS).map(([key, design]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDesign(key)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all flex flex-col items-center gap-3 design-selector-item ${
                  selectedDesign === key
                    ? 'border-white bg-white/5 ring-2 ring-white ring-offset-2 ring-offset-bg selected'
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
        <div className="text-center animate-fade-in delay-2">
          <div className="inline-block p-4 bg-white rounded-xl border border-white/10 qr-preview-transition">
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

        <div className="border-t border-[var(--border)] pt-6 space-y-4 animate-fade-in delay-3">
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
                <span className="flex items-center justify-center gap-2 download-generating">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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

        <div className="border-t border-[var(--border)] pt-6 animate-fade-in delay-3">
          <h3 className="text-lg font-medium text-white mb-4">How to use</h3>
          <ol className="space-y-2 text-sm text-[var(--text-muted)] list-decimal list-inside">
            <li className="animate-fade-in delay-4">Choose a design style (Light or Dark)</li>
            <li className="animate-fade-in delay-5">Download the QR code as a branded PNG image</li>
            <li className="animate-fade-in delay-6">Print it on table tents, receipts, window stickers, or menus</li>
            <li className="animate-fade-in delay-6">Customers scan with their phone camera</li>
            <li className="animate-fade-in delay-6">They rate their experience and AI generates a review draft</li>
            <li className="animate-fade-in delay-6">They click &ldquo;Review on Google&rdquo; to post directly</li>
          </ol>
        </div>
      </div>
    </div>
  )'''

with open('client/src/pages/QrCodePage.jsx', 'r') as f:
    content = f.read()

content = content.replace(old, new)

with open('client/src/pages/QrCodePage.jsx', 'w') as f:
    f.write(content)

print('Done')