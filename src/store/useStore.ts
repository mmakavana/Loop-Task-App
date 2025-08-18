import { create } from 'zustand'
import { nanoid } from './util_nanoid'
import { ALLOWED_EMOJI, DEFAULT_PIN, PIN_SESSION_MS } from '../utils/constants'
import { loadState, saveState } from './persistence'
import type { AppState, Child, Task, Completion, Adjustment, Payout, ChildId, TaskId } from './types'
import { toISODate } from '../utils/date'

function now(){ return Date.now() }

const initial: AppState = { schema:1, ready:false, children:[], tasks:[], completions:[], adjustments:[], payouts:[], config:{ moneyPerPoint:0.1, pin:DEFAULT_PIN } }

export const useStore = create<AppState & {
  addChild:(c:Omit<Child,'id'>)=>void; updateChild:(id:ChildId,patch:Partial<Omit<Child,'id'>>)=>void; removeChild:(id:ChildId)=>void;
  addTask:(t:Omit<Task,'id'>)=>void; updateTask:(id:TaskId,patch:Partial<Omit<Task,'id'>>)=>void; removeTask:(id:TaskId)=>void;
  toggleCompletion:(childId:ChildId, taskId:TaskId, dateISO:string)=>void;
  addAdjustment:(a:Omit<Adjustment,'id'>)=>void; addPayout:(p:Omit<Payout,'id'|'paidOnISO'|'rateAtPayout'>)=>void;
  setRate:(v:number)=>void; setPIN:(pin:string,hint?:string,rq?:string,ra?:string)=>void; unlockPIN:(pin:string)=>boolean; forgotPIN:(answer:string,newPin:string)=>boolean; relock:()=>void;
  importData:(raw:any)=>boolean; exportData:()=>string; init:()=>void
}>( (set,get)=> ({
  ...initial,
  init(){ const loaded=loadState(); if(loaded){ set({...loaded,ready:true}) } else { set({...initial,ready:true}) } },
  addChild(c){ if(!ALLOWED_EMOJI.includes(c.avatarEmoji as any)) throw new Error('Please choose an avatar from the approved set.'); set(s=>({children:[...s.children,{...c,id:nanoid()}]})); saveState(get()) },
  updateChild(id,patch){ set(s=>({children:s.children.map(c=>c.id===id?{...c,...patch}:c)})); saveState(get()) },
  removeChild(id){ set(s=>({children:s.children.filter(c=>c.id!==id)})); saveState(get()) },
  addTask(t){ set(s=>({tasks:[...s.tasks,{...t,id:nanoid()}]})); saveState(get()) },
  updateTask(id,patch){ set(s=>({tasks:s.tasks.map(t=>t.id===id?{...t,...patch}:t)})); saveState(get()) },
  removeTask(id){ set(s=>({tasks:s.tasks.filter(t=>t.id!==id)})); saveState(get()) },
  toggleCompletion(childId,taskId,dateISO){ set(s=>{const f=s.completions.find(c=>c.childId===childId&&c.taskId===taskId&&c.dateISO===dateISO); if(f){ f.completed=!f.completed; return {completions:[...s.completions]} } const c:Completion={id:nanoid(),childId,taskId,dateISO,completed:true}; return {completions:[...s.completions,c]} }); saveState(get()) },
  addAdjustment(a){ set(s=>({adjustments:[...s.adjustments,{...a,id:nanoid()}]})); saveState(get()) },
  addPayout(p){ const rate=get().config.moneyPerPoint??0; const paidOnISO=toISODate(new Date()); set(s=>({payouts:[...s.payouts,{...p,id:nanoid(),paidOnISO,rateAtPayout:rate}]})); saveState(get()) },
  setRate(v){ set(s=>({config:{...s.config,moneyPerPoint:v}})); saveState(get()) },
  setPIN(pin,hint,rq,ra){ set(s=>({config:{...s.config,pin,pinHint:hint,recoveryQ:rq,recoveryA:ra}})); saveState(get()) },
  unlockPIN(pin){ if(pin===get().config.pin){ set(s=>({config:{...s.config,pinUnlockedAt:now()}})); saveState(get()); return true } return false },
  relock(){ set(s=>({config:{...s.config,pinUnlockedAt:undefined}})); saveState(get()) },
  forgotPIN(answer,newPin){ const s=get(); if((s.config.recoveryA||'').toLowerCase().trim()===(answer||'').toLowerCase().trim()){ set(ss=>({config:{...ss.config,pin:newPin}})); saveState(get()); return true } return false },
  importData(raw){ try{ const obj=typeof raw==='string'?JSON.parse(raw):raw; if(!obj||typeof obj!=='object')return false; set(obj as any); saveState(get()); return true }catch{ return false } },
  exportData(){ return JSON.stringify(get(),null,2) }
}) )

useStore.subscribe((s)=>{ saveState(s as any) })

export function isPinSessionValid(s:AppState){ const t=s.config.pinUnlockedAt; if(!t) return false; return (Date.now()-t) < PIN_SESSION_MS }
