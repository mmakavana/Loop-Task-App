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
export function dailyPointsIfAllDone(state:AppState, childId:ChildId, dateISO:string){
  const tasks=tasksEligibleForChildOnDate(state,childId,dateISO); if(tasks.length===0) return 0
  const allDone=tasks.every(t=> state.completions.some(c=> c.childId===childId && c.taskId===t.id && isSameISO(c.dateISO,dateISO) && c.completed))
  return allDone? tasks.reduce((s,t)=>s+t.points,0):0
}
export function computeStarDays(state:AppState, childId:ChildId, dates:string[]){
  const set=new Set<string>(); for(const d of dates){ if(isAllDoneForChildOnDate(state,childId,d)) set.add(d) } return set
}
export function computeStreakAwards(state:AppState, childId:ChildId, dates:string[], seg=10, bonus=10){
  const stars=computeStarDays(state,childId,dates); let run=0; const out:{dateISO:string,segment:number,points:number}[]=[]
  for(const d of dates){ if(stars.has(d)){run++}else{run=0}; if(run>0 && run%seg===0){ out.push({dateISO:d,segment:seg,points:bonus}) } }
  return out
}
