// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { IdentityFloat } from '../src/ui/identity-float.js'
import { readStoredEmailConfirmation, writeStoredEmailConfirmation } from '../src/ui/identity-client.js'

let container: HTMLDivElement | null = null

const clickButton = (label: string): void => {
  const buttons = Array.from(container?.querySelectorAll<HTMLButtonElement>('button') ?? [])
  const element = buttons.find((candidate) => candidate.textContent?.includes(label))
  if (!element) {
    throw new Error(`Missing button: ${label}`)
  }
  element.click()
}

const createStorage = (): Storage => {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key)
    },
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

afterEach(() => {
  container?.remove()
  container = null
  document.body.innerHTML = ''
})

describe('IdentityFloat confirmation loop', () => {
  it('shows the confirmation strip for an unconfirmed saved email and calls confirm', async () => {
    const onConfirmEmail = vi.fn(async () => undefined)
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <IdentityFloat
          currentEmail="learner@example.com"
          emailConfirmed={false}
          defaultOpen
          onSave={() => undefined}
          onConfirmEmail={onConfirmEmail}
          onGoAnonymous={() => undefined}
        />,
      )
    })

    expect(container?.textContent).toContain('Is learner@example.com correct?')

    await act(async () => {
      clickButton('Yes, save')
    })

    expect(onConfirmEmail).toHaveBeenCalledWith('learner@example.com')
  })

  it('persists per-email confirmation state locally', () => {
    const storage = createStorage()
    expect(readStoredEmailConfirmation('learner@example.com', storage)).toBeNull()

    writeStoredEmailConfirmation('learner@example.com', false, storage)
    expect(readStoredEmailConfirmation('learner@example.com', storage)).toBe(false)

    writeStoredEmailConfirmation('learner@example.com', true, storage)
    expect(readStoredEmailConfirmation('learner@example.com', storage)).toBe(true)
  })

  it('lets the learner edit a pending email without throwing on email inputs', async () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <IdentityFloat
          currentEmail="typo@example.co"
          emailConfirmed={false}
          defaultOpen
          onSave={() => undefined}
          onConfirmEmail={() => undefined}
          onGoAnonymous={() => undefined}
        />,
      )
    })

    await act(async () => {
      clickButton('Edit')
    })

    const emailInput = container?.querySelector<HTMLInputElement>('input[name="email"]')
    expect(emailInput?.value).toBe('typo@example.co')

    expect(container?.textContent).toContain('Is typo@example.co correct?')
  })
})
