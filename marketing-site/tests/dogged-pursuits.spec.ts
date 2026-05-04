import { expect, test } from '@playwright/test'

test.describe('Dogged Pursuits promotion', () => {
  test('desktop shows a closable popup over the marketing site', async ({ page }) => {
    test.skip(test.info().project.name !== 'desktop-chromium', 'Desktop popup behavior is covered in the desktop project.')

    await page.goto('/')

    const popup = page.getByTestId('dogged-popup')
    await expect(popup).toBeVisible()
    await expect(popup.getByRole('heading', { name: /Build the software you wish existed/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Watch latest build/i })).toHaveAttribute(
      'href',
      'https://x.com/i/broadcasts/1aKbdbpMVbdJX',
    )
    await expect(page.getByRole('link', { name: /Watch the Instagram mirror/i })).toHaveAttribute(
      'href',
      /instagram\.com\/reel\/DXvOpxmjPfG/,
    )

    await page.getByRole('button', { name: /Close Dogged Pursuits popup/i }).click()
    await expect(popup).toBeHidden()
    await expect(page.locator('.reader-window')).toBeVisible()
  })

  test('mobile renders only the Dogged Pursuits takeover', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-chromium', 'Mobile takeover behavior is covered in the mobile project.')

    await page.goto('/')

    await expect(page.getByTestId('dogged-popup')).toBeVisible()
    await expect(page.getByText('Dogged Pursuits').first()).toBeVisible()
    await expect(page.locator('.reader-window')).toHaveCount(0)
    await expect(page.locator('.taskbar')).toHaveCount(0)
    await expect(page.getByRole('link', { name: /Get the build notes/i })).toHaveAttribute(
      'href',
      'https://doggedpursuits.substack.com',
    )
  })

  test('mobile takeover remains usable on a slow network', async ({ page, browserName }) => {
    test.skip(test.info().project.name !== 'mobile-chromium', 'Slow-network sanity is mobile-specific.')
    test.setTimeout(60_000)

    if (browserName === 'chromium') {
      const client = await page.context().newCDPSession(page)
      await client.send('Network.enable')
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 350,
        downloadThroughput: (750 * 1024) / 8,
        uploadThroughput: (250 * 1024) / 8,
      })
    }

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    await expect(page.getByTestId('dogged-popup')).toBeVisible()
    await expect(page.getByRole('link', { name: /Watch latest build/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Watch the Instagram mirror/i })).toBeVisible()
  })
})
