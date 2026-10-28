import { expect, test } from '@playwright/test'

const business = {
  id: 'smoke-business',
  name: 'Smoke Test Business',
  category: 'Local business',
  slug: 'demo',
  google_review_url: 'https://search.google.com/local/writereview?placeid=smoke',
}

const routes = [
  '/',
  '/login',
  '/signup',
  '/verify-otp',
  '/pricing',
  '/faq',
  '/billing/success?order_id=smoke-order&business_id=smoke-business',
  '/billing/failed?order_id=smoke-order&business_id=smoke-business',
  '/billing/result?order_id=smoke-order&business_id=smoke-business',
  '/terms',
  '/privacy',
  '/refund',
  '/contact',
  '/how-it-works',
  '/r/demo',
  '/r/demo/result?session=smoke-session',
  '/dashboard',
  '/dashboard/business',
  '/dashboard/qr',
  '/dashboard/analytics',
  '/dashboard/settings',
  '/__smoke_not_found__',
]

async function mockApi(page) {
  await page.route('**/api/**', async (route) => {
    const { pathname, searchParams } = new URL(route.request().url())
    const method = route.request().method()

    if (pathname.endsWith('/review/events')) {
      await route.fulfill({ status: 204 })
      return
    }

    // Billing status endpoint
    if (pathname.includes('/billing/status')) {
      const businessId = searchParams.get('business_id')
      const orderId = searchParams.get('order_id')
      const mockBusiness = {
        id: businessId || 'smoke-business',
        subscription_status: 'active',
        subscription_plan: 'monthly',
        paid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trial_ends_at: null,
        trial_used: true,
        is_trial: false,
        is_active: true,
        is_expired: false,
        in_grace: false,
        days_left: 30,
        ...(orderId && { order_id: orderId }),
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBusiness),
      })
      return
    }

    // Billing verify endpoint
    if (pathname.includes('/billing/verify')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ verified: true, paid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }),
      })
      return
    }

    let body = {}
    if (pathname.includes('/review/public/business/')) {
      body = business
    } else if (pathname.includes('/review/session/')) {
      body = {
        rating: 5,
        feedback_data: ['good_service'],
        customer_text: 'Helpful staff and clear communication.',
        generated_review: 'The staff were helpful and the service was clear.',
      }
    } else if (method === 'POST' && pathname.includes('/review/start/')) {
      body = { session_id: 'smoke-session', business_id: business.id }
    } else if (method === 'POST' && pathname.includes('/review/generate/')) {
      body = { generated_review: 'The staff were helpful and the service was clear.' }
    } else if (pathname === '/api/business') {
      body = [business]
    } else if (pathname.startsWith('/api/business/')) {
      body = business
    } else if (pathname.startsWith('/api/analytics/')) {
      body = {
        stats: {
          totalScans: 0,
          totalRatings: 0,
          totalGenerated: 0,
          totalClicks: 0,
          avgRating: 0,
        },
        recentActivity: [],
      }
    } else if (pathname.startsWith('/api/billing/')) {
      body = {}
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })

  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  )
}

async function mockAuthenticatedSession(page) {
  await page.addInitScript(() => {
    const now = Math.floor(Date.now() / 1000)
    localStorage.setItem('sb-smoke-auth-token', JSON.stringify({
      access_token: 'smoke-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: now + 3600,
      refresh_token: 'smoke-refresh-token',
      user: {
        id: 'smoke-user',
        email: 'smoke@example.test',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
    }))
  })
}

for (const route of routes) {
  for (const width of [390, 1280]) {
    test(`${route} renders at ${width}px`, async ({ page }) => {
      const consoleErrors = []
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text())
      })
      page.on('pageerror', (error) => consoleErrors.push(error.message))
      await mockApi(page)
      if (route.startsWith('/dashboard')) await mockAuthenticatedSession(page)

      await page.setViewportSize({ width, height: 900 })
      await page.goto(route)
      await expect(page.locator('body')).not.toBeEmpty()
      await expect(page.getByText('Something went wrong', { exact: true })).toHaveCount(0)

      const pageState = await page.evaluate(() => ({
        text: document.body.innerText.trim(),
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      }))

      expect(pageState.text).not.toBe('')
      expect(pageState.documentWidth).toBeLessThanOrEqual(pageState.viewportWidth)
      expect(consoleErrors).toEqual([])
    })
  }
}

test('customer review flow supports feedback, editing, regeneration, and Google handoff', async ({ page }) => {
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))
  await mockApi(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/r/demo')

  await page.getByRole('button', { name: '5 stars' }).click()
  await page.getByRole('checkbox', { name: 'Good service' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByPlaceholder(/doctor explained/).fill('Helpful staff and clear communication.')
  await page.getByRole('button', { name: 'Generate Review' }).click()
  await expect(page).toHaveURL(/\/r\/demo\/result\?session=smoke-session/)
  await expect(page.getByRole('heading', { name: 'Your Review' })).toBeVisible()

  const reviewEditor = page.locator('textarea')
  await reviewEditor.fill('My edited review.')
  await page.getByRole('button', { name: 'Regenerate' }).click()
  await expect(reviewEditor).toHaveValue('The staff were helpful and the service was clear.')

  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'Copy & Open Google Review' }).click()
  const popup = await popupPromise
  await expect(popup).toHaveURL(/search\.google\.com\/local\/writereview/)
  await popup.close()
  expect(consoleErrors).toEqual([])
})