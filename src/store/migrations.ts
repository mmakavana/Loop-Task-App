import { SCHEMA_VERSION, STORAGE_KEY } from '../utils/constants'
import type { AppState } from './types'

export const CURRENT_VERSION = SCHEMA_VERSION

// Create a timestamped backup in localStorage, just in case.
function backupRaw(raw: unknown) {
  try {
    const key = `${STORAGE_KEY}.backup.${Date.now()}`
    localStorage.setItem(key, JSON.stringify(raw))
  } catch {
    // best-effort
  }
}

// Ensure required fields exist and normalize shapes.
function normalize(data: any): AppState {
  const safe = (v: any, fallback: any) => (v === undefined || v === null ? fallback : v)

  const state: AppState = {
    schema: CURRENT_VERSION,
    ready: true, // set true when mounted by store
    children: safe(data.children, []),
    tasks: safe(data.tasks, []),
    completions: safe(data.completions, []),
    adjustments: safe(data.adjustments, []),
    payouts: safe(data.payouts, []),
    config: {
      moneyPerPoint: safe(data.config?.moneyPerPoint, 0.1),
      pin: safe(data.config?.pin, '1234'),
      pinHint: safe(data.config?.pinHint, ''),
      recoveryQ: safe(data.config?.recoveryQ, ''),
      recoveryA: safe(data.config?.recoveryA, ''),
      pinUnlockedAt: data.config?.pinUnlockedAt,
    },
  }
  return state
}

/**
 * Migrate any previous saved object to CURRENT_VERSION.
 * - If no version present, assume v1 and upgrade.
 * - If version < CURRENT_VERSION, backup then transform.
 * - If version >= CURRENT_VERSION, just normalize & stamp current version.
 */
export function migrate(raw: any): AppState {
  if (!raw || typeof raw !== 'object') {
    return normalize({ schema: CURRENT_VERSION })
  }
  const foundVersion =
    (typeof raw._version === 'number' && raw._version) ||
    (typeof raw.schema === 'number' && raw.schema) ||
    1

  let working = { ...raw }

  if (foundVersion < CURRENT_VERSION) {
    // ----- Example v1 → v2 adjustments go here (none needed right now) -----
    // Keep for future: rename keys, add defaults, etc.
    // working.tasks = working.tasks ?? working.chores ?? []

    // Backup the original prior to overwriting
    backupRaw(raw)
  }

  const migrated = normalize(working)
  migrated.schema = CURRENT_VERSION
  ;(migrated as any)._version = CURRENT_VERSION
  return migrated
}
