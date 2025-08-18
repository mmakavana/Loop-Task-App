import { useState } from 'react'
import BoardColumn from '../components/BoardColumn'
import { useStore } from '../store/useStore'
import { toISODate, addLocalDays } from '../utils/date'
export default function BoardPage(){
  const s=useStore(); const [dateISO,setDateISO]=useState<string>(toISODate(new Date()))
  return (<div>
    <div className="flex items-end gap-2 mb-3"><div><label>Date</label><input type="date" value={dateISO} onChange={e=>setDateISO(e.target.value)}/></div>
      <div className="ml-auto flex gap-2"><button className="btn-outline" onClick={()=>setDateISO(toISODate(addLocalDays(new Date(dateISO+'T00:00:00'),-1)))}>Prev</button><button className="btn-outline" onClick={()=>setDateISO(toISODate(new Date()))}>Today</button><button className="btn-outline" onClick={()=>setDateISO(toISODate(addLocalDays(new Date(dateISO+'T00:00:00'),1)))}>Next</button></div></div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{s.children.map(ch=> <BoardColumn key={ch.id} childId={ch.id} dateISO={dateISO}/>)}
      {s.children.length===0 && <div className="text-muted">No children yet. Go to Manage to add one.</div>}</div>
  </div>)
}
