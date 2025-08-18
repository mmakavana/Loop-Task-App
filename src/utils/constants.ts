export const APP_NAME = 'Loop'
export const TAGLINE = 'Do it. Earn it. Repeat it.'

export const STORAGE_KEY = 'loop.v1.state'
export const SCHEMA_VERSION = 2  // bump when storage shape changes

export const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const
export type Weekday = typeof WEEKDAYS[number]

// Approved avatars only (no yellow emoji glitch)
export const ALLOWED_HUMAN = ['👧🏻','👦🏻','🧒🏻','🧑🏻‍🦱'] as const
export const ALLOWED_ANIMALS = ['🐶','🐱','🐰','🐻','🐼','🦊','🐨','🦁','🐯','🐸','🐵','🐧','🐮','🐷','🦄'] as const
export const ALLOWED_EMOJI = [...ALLOWED_HUMAN, ...ALLOWED_ANIMALS] as const

export const DEFAULT_PIN = '1234'
export const PIN_SESSION_MS = 5 * 60 * 1000  // 5 minutes

export const STREAK_SEGMENT = 10
export const STREAK_BONUS = 10
