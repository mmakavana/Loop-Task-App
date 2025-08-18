import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { toISODate } from '../utils/date'
import { computeStreakAwards } from '../utils/points'
function rangeDates(a:Date,b:Date){ const out:string[]=[]; for(let d=a; d<=b; d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)) out.push(toISODate(d)); return out }
export default function StreakBonusLog(){
  const s=useStore(); const [start,setStart]=useState(''); const [end,setEnd]=useState(''); const [childId,setChildId]=useState('all')
  const dates=useMemo(()=>{ const a=start?new Date(start+'T00:00:00'):new Date('2000-01-01T00:00:00'); const b=end?new Date(end+'T00:00:00'):new Date(); return rangeDates(a,b) },[start,end])
  const rows=(childId==='all'? s.children: s.children.filter(c=>c.id===childId)).flatMap(ch=> computeStreakAwards(s,ch.id,dates).map(aw=>({ch,aw})))
  return (<div className="card space-y-3">
    <div className="flex flex-wrap gap-3"><div><label>Start</label><input type="date" value={start} onChange={e=>setStart(e.target.value)}/></div><div><label>End</label><input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></div><div><label>Child</label><select value={childId} onChange={e=>setChildId(e.target.value)}><option value="all">All</option>{s.children.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div>
    <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-muted"><tr><th className="p-2">Date Awarded</th><th className="p-2">Kid</th><th className="p-2">Segment</th><th className="p-2">Bonus Points</th></tr></thead><tbody>
      {rows.map((r,i)=> <tr key={i} className="border-t"><td className="p-2">{r.aw.dateISO}</td><td className="p-2"><span className="mr-1">{r.ch.avatarEmoji}</span>{r.ch.name}</td><td className="p-2">10-day</td><td className="p-2">{r.aw.points}</td></tr>)}
      {rows.length===0 && <tr><td className="p-2 text-muted">No streak bonuses in this range.</td></tr>}
    </tbody></table></div>
  </div>)
}
