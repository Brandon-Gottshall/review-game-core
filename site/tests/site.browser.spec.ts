import { expect, test } from '@playwright/test'

test('home page exposes docs and feature entry points', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /route the learner/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /read the docs/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /browse the feature gallery/i })).toBeVisible()
  await expect(page.getByText(/six phases: routing, question, staged-answer, support, recovery, complete/i)).toBeVisible()
  await expect(page.getByText(/three independent passes/i)).toBeVisible()
})

test('feature gallery lists the planned v1 features', async ({ page }) => {
  await page.goto('/showcase/features')

  await expect(page.getByRole('heading', { name: /each major surface of the core/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Planning / goal abstraction' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Scheduler' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'WF harness' })).toBeVisible()
})

test('feature detail renders source snippet and consumer example', async ({ page }) => {
  await page.goto('/showcase/features/planning-goals')

  await expect(page.getByText(/worked example/i)).toBeVisible()
  await expect(page.getByText(/Goal types and evaluator/i)).toBeVisible()
  await expect(page.getByText(/Stats goal dashboard adapter/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /read docs/i })).toBeVisible()
})

test('docs navigation resolves top-level sections', async ({ page }) => {
  await page.goto('/docs')

  await expect(page.getByRole('heading', { name: 'Introduction' })).toBeVisible()
  const sidebar = page.locator('.docs-sidebar')
  await expect(sidebar.getByRole('link', { name: /Planning \/ Goal Family/i }).first()).toBeVisible()
  await sidebar.getByRole('link', { name: /Planning \/ Goal Family/i }).first().click()
  await expect(page).toHaveURL(/\/docs\/planning-goals$/)
  await expect(page.getByRole('heading', { name: 'Planning / Goal Family' })).toBeVisible()
})

test('docs page links to the related feature example', async ({ page }) => {
  await page.goto('/docs/planning-goals')

  await expect(page.getByRole('link', { name: /planning feature page/i })).toBeVisible()
  await page.getByRole('link', { name: /planning feature page/i }).click()
  await expect(page).toHaveURL(/\/showcase\/features\/planning-goals$/)
  await expect(page.getByText(/Goal types and evaluator/i)).toBeVisible()
})
