import { useStore } from '../store/useStore'
import { WEEKDAYS } from '../utils/constants'
export default function BoardColumn({childId,dateISO}:{childId:string,dateISO:string}){
  const s=useStore(); const child=s.children.find(c=>c.id===childId)!
  const weekday=new Date(dateISO+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'}) as typeof WEEKDAYS[number]
  const tasks=s.tasks.filter(t=> t.activeDays.includes(weekday) && t.childIds.includes(childId))
  const checked=new Set(s.completions.filter(c=> c.childId===childId && c.dateISO===dateISO && c.completed).map(c=>c.taskId))
  const allDone=tasks.length>0 && tasks.every(t=>checked.has(t.id))
  const dayPts=allDone? tasks.reduce((a,b)=>a+b.points,0):0
  return (<div className="card">
    <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{child.avatarEmoji}</span><h3 className="font-semibold">{child.name}</h3>
      <span className={'badge ml-auto '+(allDone?'bg-green-100':'bg-primaryMuted')}>{allDone?'All done ⭐':'Missing'}</span></div>
    <ul className="space-y-2">{tasks.map(t=> <li key={t.id} className="flex items-center gap-3"><input type="checkbox" checked={checked.has(t.id)} onChange={()=>useStore.getState().toggleCompletion(childId,t.id,dateISO)}/><span>{t.title}</span><span className="ml-auto text-sm text-muted">{t.points} pts</span></li>)}
      {tasks.length===0 && <p className="text-sm text-muted">No tasks for {weekday}.</p>}</ul>
    <div className="border-t mt-3 pt-2 text-sm flex justify-between"><span>Daily total</span><span className="font-semibold">{dayPts} pts</span></div>
  </div>)
}
