export const cx = (...values: Array<string | false | null | undefined>): string => (
  values.filter(Boolean).join(' ')
)

export const formatIsoDate = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
): string => {
  if (!value) return 'No date'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-US', options).format(parsed)
}

export const formatLocalDateLabel = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
): string => {
  if (!value) return 'No date'

  const [yearToken, monthToken, dayToken] = value.split('-')
  const year = Number(yearToken)
  const month = Number(monthToken)
  const day = Number(dayToken)

  if (
    !Number.isInteger(year)
    || !Number.isInteger(month)
    || !Number.isInteger(day)
    || month < 1
    || month > 12
    || day < 1
    || day > 31
  ) {
    return value
  }

  const parsed = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(parsed.getTime())) return value
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    ...options,
  }).format(parsed)
}

export const formatRelativeDay = (value: string | null | undefined, now: Date): string => {
  if (!value) return 'No deadline'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  const msPerDay = 24 * 60 * 60 * 1000
  const startOfNow = new Date(now)
  startOfNow.setHours(0, 0, 0, 0)
  const startOfTarget = new Date(parsed)
  startOfTarget.setHours(0, 0, 0, 0)
  const diffDays = Math.round((startOfTarget.getTime() - startOfNow.getTime()) / msPerDay)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1) return `In ${diffDays} days`
  return `${Math.abs(diffDays)} days ago`
}

export const getFocusableSibling = (
  currentTarget: EventTarget | null,
  selector: string,
  direction: -1 | 1,
): HTMLElement | null => {
  const current = currentTarget instanceof HTMLElement ? currentTarget : null
  const root = current?.closest('[data-rg-rowlist]')
  if (!current || !root) return null

  const items = Array.from(root.querySelectorAll<HTMLElement>(selector))
  const currentIndex = items.indexOf(current)
  if (currentIndex === -1) return null

  const nextIndex = currentIndex + direction
  if (nextIndex < 0 || nextIndex >= items.length) return null
  return items[nextIndex] ?? null
}
