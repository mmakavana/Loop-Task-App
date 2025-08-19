export const APP_NAME = 'Loop'
export const TAGLINE = 'Do it. Earn it. Repeat it.'

export const STORAGE_KEY = 'loop.v1.state'
export const SCHEMA_VERSION = 2  // bump when storage shape changes

export const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const
export type Weekday = typeof WEEKDAYS[number]

/** ✅ Approved avatars only (no yellow blanks). */
export const ALLOWED_HUMAN = [
  '👧🏻','👦🏻',        // light skin, dark hair (girl/boy)
  '👱🏻‍♀️','👱🏻‍♂️',  // light skin, blonde (girl/boy)
  '👧🏾','👦🏾',        // dark skin, dark hair (girl/boy)
] as const

export const ALLOWED_ANIMALS = [
  '🐶','🐱','🐰','🐻','🐼','🦊','🐨','🦁','🐯','🐸','🐵','🐧','🐮','🐷','🦄',
  '🐠','🐥','🐢','🐙','🦋','🐞','🐝'
] as const

export const ALLOWED_EMOJI = [...ALLOWED_HUMAN, ...ALLOWED_ANIMALS] as const

export const DEFAULT_PIN = '1234'
export const PIN_SESSION_MS = 5 * 60 * 1000  // 5 minutes

export const STREAK_SEGMENT = 10
export const STREAK_BONUS = 10

export type PayoutMode = 'all_done' | 'per_task'
export const DEFAULT_PAYOUT_MODE: PayoutMode = 'all_done'

/** NEW: Reward types for “Value” in Reports */
export type RewardType = 'money' | 'time' | 'custom'
export const DEFAULT_REWARD_TYPE: RewardType = 'money'

// defaults for each mode
export const DEFAULT_MONEY_PER_POINT = 0.10        // $/pt
export const DEFAULT_MINUTES_PER_POINT = 5         // minutes/pt
export const DEFAULT_CUSTOM_NAME = 'reward'        // label for custom reward
export const DEFAULT_POINTS_PER_REWARD = 10        // pts → 1 reward
