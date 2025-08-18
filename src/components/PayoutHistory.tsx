import { useState } from 'react'
import { useStore } from '../store/useStore'
export default function PayoutHistory(){
  const s=useStore(); const [start,setStart]=useState(''); const [end,setEnd]=useState(''); const [childId,setChildId]=useState('all')
  const rows=s.payouts.filter(p=>{ if(childId!=='all'&&p.childId!==childId) return false; if(start&&p.paidOnISO<start) return false; if(end&&p.paidOnISO>end) return false; return true }).sort((a,b)=>a.paidOnISO.localeCompare(b.paidOnISO))
  return (<div className="card space-y-3">
    <div className="flex flex-wrap gap-3"><div><label>Start</label><input type="date" value={start} onChange={e=>setStart(e.target.value)}/></div><div><label>End</label><input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></div><div><label>Child</label><select value={childId} onChange={e=>setChildId(e.target.value)}><option value="all">All</option>{s.children.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div>
    <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-muted"><tr><th className="p-2">Paid On</th><th className="p-2">Kid</th><th className="p-2">Range</th><th className="p-2">Points</th><th className="p-2">Rate Used</th><th className="p-2">Value</th></tr></thead><tbody>
      {rows.map(p=>{ const ch=s.children.find(c=>c.id===p.childId); return (<tr key={p.id} className="border-t"><td className="p-2">{p.paidOnISO}</td><td className="p-2"><span className="mr-1">{ch?.avatarEmoji}</span>{ch?.name}</td><td className="p-2">{p.rangeStartISO} → {p.rangeEndISO}</td><td className="p-2">{p.points}</td><td className="p-2">${p.rateAtPayout.toFixed(2)}/pt</td><td className="p-2">${p.value.toFixed(2)}</td></tr>) })}
      {rows.length===0 && <tr><td className="p-2 text-muted">No payouts yet</td></tr>}
    </tbody></table></div>
  </div>)
}
