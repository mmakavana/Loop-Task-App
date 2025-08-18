import { useMemo, useState } from 'react'
import { useStore, isPinSessionValid } from '../store/useStore'
import { toISODate } from '../utils/date'
import { computeStreakAwards, dailyPointsIfAllDone } from '../utils/points'
function rangeDates(a:Date,b:Date){ const out:string[]=[]; for(let d=a; d<=b; d=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)) out.push(toISODate(d)); return out }
export default function ReportsSummary(){
  const s=useStore(); const [start,setStart]=useState<string>(toISODate(new Date(new Date().getFullYear(),new Date().getMonth(),1))); const [end,setEnd]=useState<string>(toISODate(new Date())); const [childFilter,setChildFilter]=useState<string>('all')
  function sinceLastPayout(childId:string){ const last=[...s.payouts].filter(p=>p.childId===childId).sort((a,b)=>a.paidOnISO.localeCompare(b.paidOnISO)).at(-1); if(!last) return {start,end}; const clip=toISODate(new Date(new Date(last.rangeEndISO+'T00:00:00').getTime()+24*3600*1000)); return {start: clip>start?clip:start, end} }
  const rows=(s.children.filter(c=> childFilter==='all'||c.id===childFilter)).map(ch=>{ const eff=sinceLastPayout(ch.id); const dates=rangeDates(new Date(eff.start+'T00:00:00'), new Date(eff.end+'T00:00:00')); const pts=dates.reduce((sum,d)=> sum+dailyPointsIfAllDone(s,ch.id,d),0); const aw=computeStreakAwards(s,ch.id,dates); const streak=aw.reduce((a,b)=>a+b.points,0); const adj=s.adjustments.filter(a=>a.childId===ch.id && a.dateISO>=eff.start && a.dateISO<=eff.end).reduce((s2,a)=>s2+a.deltaPoints,0); const total=pts+streak+adj; const value=total*(s.config.moneyPerPoint||0); return {ch, points:pts, streakPts:streak, adj, total, value, rangeStart:eff.start, rangeEnd:eff.end} })
  return (<div className="card space-y-3">
    <div className="flex flex-wrap gap-3 items-end">
      <div><label>Start</label><input type="date" value={start} onChange={e=>setStart(e.target.value)}/></div>
      <div><label>End</label><input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></div>
      <div><label>Child</label><select value={childFilter} onChange={e=>setChildFilter(e.target.value)}><option value="all">All children</option>{s.children.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="ml-auto"><label>Rate ($/pt)</label><input type="number" step="0.01" min="0" value={s.config.moneyPerPoint} onChange={e=>useStore.getState().setRate(parseFloat(e.target.value||'0'))}/></div>
    </div>
    <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-muted"><tr><th className="p-2">Kid</th><th className="p-2">Task Points</th><th className="p-2">Adjustments</th><th className="p-2">Streak Bonuses</th><th className="p-2">Net Points</th><th className="p-2">Value</th><th className="p-2">Action</th></tr></thead>
      <tbody>{rows.map(r=> (<tr key={r.ch.id} className="border-t"><td className="p-2"><span className="mr-1">{r.ch.avatarEmoji}</span>{r.ch.name}</td><td className="p-2">{r.points}</td><td className="p-2">{r.adj}</td><td className="p-2">{r.streakPts}</td><td className="p-2 font-semibold">{r.total}</td><td className="p-2 font-semibold">${r.value.toFixed(2)}</td><td className="p-2"><button className="btn-outline" onClick={()=>{ if(!isPinSessionValid(useStore.getState())){ const pin=prompt('Enter PIN')||''; if(!useStore.getState().unlockPIN(pin)){ alert('Incorrect PIN'); return } } useStore.getState().addPayout({ childId:r.ch.id, rangeStartISO:r.rangeStart, rangeEndISO:r.rangeEnd, points:r.total, value:r.value }); alert('Payout recorded. Summary resets going forward; history stays in logs.') }}>Mark Paid</button></td></tr>))}
        {rows.length===0 && <tr><td className="p-2 text-muted">No children</td></tr>}</tbody></table></div>
  </div>)
}
