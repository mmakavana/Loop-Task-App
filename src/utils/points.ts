import { Weekday } from './constants'
import { isSameISO } from './date'
import { AppState, ChildId } from '../store/types'

export function tasksEligibleForChildOnDate(state:AppState, childId:ChildId, dateISO:string){
  const weekday=(new Date(dateISO+'T00:00:00')).toLocaleDateString('en-US',{weekday:'short'}) as Weekday
  return state.tasks.filter(t=> t.activeDays.includes(weekday) && t.childIds.includes(childId))
}

export function isAllDoneForChildOnDate(state:AppState, childId:ChildId, dateISO:string){
  const tasks=tasksEligibleForChildOnDate(state,childId,dateISO); if(tasks.length===0) return false
  return tasks.every(t=> state.completions.some(c=> c.childId===childId && c.taskId===t.id && c.dateISO===dateISO && c.completed))
}

// OLD: only-all-done version (kept for star logic or reference)
export function dailyPointsIfAllDone(state:AppState, childId:ChildId, dateISO:string){
  const tasks=tasksEligibleForChildOnDate(state,childId,dateISO); if(tasks.length===0) return 0
  const allDone=tasks.every(t=> state.completions.some(c=> c.childId===childId && c.taskId===t.id && isSameISO(c.dateISO,dateISO) && c.completed))
  return allDone? tasks.reduce((s,t)=>s+t.points,0):0
}

// NEW: flexible daily points based on payout mode
export function dailyPointsFlexible(state:AppState, childId:ChildId, dateISO:string, mode:'all_done'|'per_task'){
  const tasks = tasksEligibleForChildOnDate(state, childId, dateISO)
  if (tasks.length===0) return 0
  if (mode === 'all_done') return dailyPointsIfAllDone(state, childId, dateISO)

  // per_task: sum points for completed tasks, regardless of all-done
  const completedIds = new Set(
    state.completions.filter(c => c.childId===childId && c.dateISO===dateISO && c.completed).map(c=>c.taskId)
  )
  return tasks.reduce((sum,t)=> sum + (completedIds.has(t.id) ? t.points : 0), 0)
}

// Streaks still based on ALL tasks completed days
export function computeStarDays(state:AppState, childId:ChildId, dates:string[]){
  const set=new Set<string>(); for(const d of dates){ if(isAllDoneForChildOnDate(state,childId,d)) set.add(d) } return set
}
export function computeStreakAwards(state:AppState, childId:ChildId, dates:string[], seg=10, bonus=10){
  const stars=computeStarDays(state,childId,dates); let run=0; const out:{dateISO:string,segment:number,points:number}[]=[]
  for(const d of dates){ if(stars.has(d)){run++}else{run=0}; if(run>0 && run%seg===0){ out.push({dateISO:d,segment:seg,points:bonus}) } }
  return out
}
