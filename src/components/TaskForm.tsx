import { useState } from 'react'
import { useStore } from '../store/useStore'
import { WEEKDAYS, Weekday } from '../utils/constants'
export function TaskForm(){
  const s=useStore(); const [title,setTitle]=useState(''); const [points,setPoints]=useState(1); const [days,setDays]=useState<Weekday[]>([]); const [childIds,setChildIds]=useState<string[]>([])
  function toggleDay(d:Weekday){ setDays(p=> p.includes(d)? p.filter(x=>x!==d): [...p,d]) } function toggleChild(id:string){ setChildIds(p=> p.includes(id)? p.filter(x=>x!==id): [...p,id]) }
  return (<div className="card space-y-3"><h3 className="font-semibold">Add Task</h3>
    <div className="grid sm:grid-cols-2 gap-3"><div><label>Title</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Homework"/></div><div><label>Points</label><input type="number" min={0} value={points} onChange={e=>setPoints(parseInt(e.target.value||'0'))}/></div></div>
    <div><label>Weekdays</label><div className="flex flex-wrap gap-2 mt-1">{WEEKDAYS.map(d=> <button key={d} type="button" className={'btn '+(days.includes(d)?'btn-primary':'btn-outline')} onClick={()=>toggleDay(d)}>{d}</button>)}</div></div>
    <div><label>Assign to Children</label><div className="flex flex-wrap gap-2 mt-1">{s.children.map(c=> <button key={c.id} type="button" className={'btn '+(childIds.includes(c.id)?'btn-primary':'btn-outline')} onClick={()=>toggleChild(c.id)}><span className="mr-1">{c.avatarEmoji}</span>{c.name}</button>)}
      {s.children.length===0 && <p className="text-sm text-muted">Add a child first.</p>}</div></div>
    <div className="flex gap-2"><button className="btn-primary" onClick={()=>{ if(!title.trim()){alert('Title required');return} if(days.length===0){alert('Pick at least one weekday');return} if(childIds.length===0){alert('Assign to at least one child');return} useStore.getState().addTask({title,points,activeDays:days,childIds}); setTitle(''); setPoints(1); setDays([]); setChildIds([])}}>Save Task</button></div>
  </div>)
}
