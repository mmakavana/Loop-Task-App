import { Weekday, PayoutMode, RewardType } from '../utils/constants'

export type ChildId = string
export type TaskId = string
export type CompletionId = string
export type AdjustmentId = string
export type PayoutId = string

export interface Child { id: ChildId; name: string; avatarEmoji: string }
export interface Task { id: TaskId; title: string; points: number; activeDays: Weekday[]; childIds: ChildId[] }
export interface Completion { id: CompletionId; childId: ChildId; taskId: TaskId; dateISO: string; completed: boolean }
export interface Adjustment { id: AdjustmentId; childId: ChildId; dateISO: string; deltaPoints: number; note?: string }
export interface Payout {
  id: PayoutId; childId: ChildId; paidOnISO: string; rangeStartISO: string; rangeEndISO: string;
  points: number; value: number; rateAtPayout: number; note?: string
}

export interface Config {
  // money mode
  moneyPerPoint: number

  // PIN
  pin: string
  pinHint?: string
  recoveryQ?: string
  recoveryA?: string
  pinUnlockedAt?: number

  // payout aggregation
  payoutMode?: PayoutMode

  // NEW: reward type
  rewardType?: RewardType
  minutesPerPoint?: number        // for time mode
  customRewardName?: string       // for custom mode
  pointsPerReward?: number        // for custom mode
}

export interface AppState {
  schema: number
  ready: boolean
  children: Child[]
  tasks: Task[]
  completions: Completion[]
  adjustments: Adjustment[]
  payouts: Payout[]
  config: Config
}
