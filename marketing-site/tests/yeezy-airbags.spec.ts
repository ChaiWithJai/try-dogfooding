import { expect, test } from '@playwright/test'

test.describe('Yeezy Airbags parody product page', () => {
  test('home page shows a single AB-01 product tile', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('button', { name: /YEEZY AIRBAGS/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /AB-01/i })).toBeVisible()
    await expect(page.getByText('Yeezy Airbags', { exact: true })).toHaveCount(0)
  })

  test('clicking the product opens the product detail page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /AB-01/i }).click()

    await expect(page.getByRole('heading', { name: /Yeezy Airbags/i })).toBeVisible()
    await expect(page.getByText('FOR WHEN YOU ARE CRASHING OUT')).toBeVisible()
    await expect(page.getByText(/mistake a compliment for a crime scene/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /Deploy airbag/i })).toHaveAttribute(
      'href',
      'https://x.com/ninepixelgrid/status/2050635687792095531',
    )
    await expect(page.locator('.ya-product__media img')).toHaveAttribute('src', '/products/ab-01-cut.png')
    await expect(page.locator('audio')).toHaveAttribute('src', '/audio/whatever-works-preview.mp3')
  })

  test('mobile keeps the single-product flow usable', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-chromium', 'Mobile layout is covered in the mobile project.')

    await page.goto('/')
    await page.getByRole('button', { name: /AB-01/i }).click()

    await expect(page.getByRole('heading', { name: /Yeezy Airbags/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Deploy airbag/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Details/i })).toBeVisible()
  })

  test('details copy stays satirical without naming a private target', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /AB-01/i }).click()
    await page.getByRole('button', { name: /Details/i }).click()

    await expect(page.getByText(/brand-protection theatre/i)).toBeVisible()
    await expect(page.getByText(/grand theft homepage/i)).toBeVisible()
    await expect(page.getByText(/Cuckoo Cory/i)).toHaveCount(0)
  })
})
