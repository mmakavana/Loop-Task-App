import { STORAGE_KEY } from '../utils/constants'
import type { AppState } from './types'
import { CURRENT_VERSION } from './migrations'

/** Load raw JSON (untyped). Migration happens elsewhere. */
export function loadRaw(): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

let saveTimer: number | undefined

/** Save with a small debounce; stamp current version. */
export function saveState(state: AppState) {
  try {
    const payload = { ...state, schema: CURRENT_VERSION, _version: CURRENT_VERSION }
    const json = JSON.stringify(payload)
    if (saveTimer) window.clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => localStorage.setItem(STORAGE_KEY, json), 120)
  } catch {
    // best-effort
  }
}
