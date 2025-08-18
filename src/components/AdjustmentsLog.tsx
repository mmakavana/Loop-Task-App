import { useState } from 'react'
import { useStore, isPinSessionValid } from '../store/useStore'
import { toISODate } from '../utils/date'
export default function AdjustmentsLog(){
  const s=useStore(); const [start,setStart]=useState(''); const [end,setEnd]=useState(''); const [childId,setChildId]=useState('all'); const [delta,setDelta]=useState(0); const [note,setNote]=useState('')
  const rows=s.adjustments.filter(a=>{ if(childId!=='all'&&a.childId!==childId) return false; if(start&&a.dateISO<start) return false; if(end&&a.dateISO>end) return false; return true })
  return (<div className="card space-y-3">
    <div className="flex flex-wrap gap-3"><div><label>Start</label><input type="date" value={start} onChange={e=>setStart(e.target.value)}/></div><div><label>End</label><input type="date" value={end} onChange={e=>setEnd(e.target.value)}/></div><div><label>Child</label><select value={childId} onChange={e=>setChildId(e.target.value)}><option value="all">All</option>{s.children.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div>
    <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-left text-muted"><tr><th className="p-2">Date</th><th className="p-2">Kid</th><th className="p-2">±Points</th><th className="p-2">Note</th></tr></thead><tbody>
      {rows.map(a=>{ const ch=s.children.find(c=>c.id===a.childId); return (<tr key={a.id} className="border-t"><td className="p-2">{a.dateISO}</td><td className="p-2"><span className="mr-1">{ch?.avatarEmoji}</span>{ch?.name}</td><td className="p-2">{a.deltaPoints>0?'+':''}{a.deltaPoints}</td><td className="p-2">{a.note}</td></tr>) })}
      {rows.length===0 && <tr><td className="p-2 text-muted">No adjustments</td></tr>}
    </tbody></table></div>
    <div className="border-t pt-3"><h4 className="font-semibold mb-2">Add Adjustment (PIN required)</h4>
      <div className="grid sm:grid-cols-4 gap-3"><div><label>Child</label><select value={childId} onChange={e=>setChildId(e.target.value)}><option value="all" disabled>Select a child</option>{s.children.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div><label>Points (±)</label><input type="number" value={delta} onChange={e=>setDelta(parseInt(e.target.value||'0'))}/></div><div><label>Note</label><input value={note} onChange={e=>setNote(e.target.value)}/></div><div className="flex items-end"><button className="btn-outline" onClick={()=>{ if(childId==='all'){alert('Select a child');return} if(!isPinSessionValid(s)){ const pin=prompt('Enter PIN')||''; if(!useStore.getState().unlockPIN(pin)){ alert('Incorrect PIN'); return } } useStore.getState().addAdjustment({childId,dateISO:toISODate(new Date()),deltaPoints:delta,note}); setNote(''); setDelta(0) }}>Add</button></div></div>
    </div>
  </div>)
}
