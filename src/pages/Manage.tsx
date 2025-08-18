import { useState } from 'react'
import { useStore } from '../store/useStore'
import { ChildForm } from '../components/ChildForm'
import { TaskForm } from '../components/TaskForm'
import { PinGate } from '../components/PinGate'
export default function ManagePage(){ return (<PinGate><ManageInner/></PinGate>) }
function ManageInner(){
  const s=useStore(); const [pin,setPin]=useState(s.config.pin||'1234'); const [hint,setHint]=useState(s.config.pinHint||''); const [rq,setRq]=useState(s.config.recoveryQ||'Recovery question'); const [ra,setRa]=useState(s.config.recoveryA||'')
  return (<div className="grid lg:grid-cols-2 gap-4">
    <div className="space-y-4"><ChildForm/><TaskForm/></div>
    <div className="space-y-4">
      <div className="card"><h3 className="font-semibold mb-2">Children</h3><ul className="space-y-1">{s.children.map(c=> <li key={c.id} className="flex items-center gap-2"><span className="text-2xl">{c.avatarEmoji}</span><span>{c.name}</span></li>)}
        {s.children.length===0 && <p className="text-sm text-muted">No children yet.</p>}</ul></div>
      <div className="card"><h3 className="font-semibold mb-2">Tasks</h3><ul className="space-y-1">{s.tasks.map(t=> <li key={t.id} className="flex items-center gap-2"><span>{t.title}</span><span className="text-xs text-muted">({t.points} pts)</span></li>)}
        {s.tasks.length===0 && <p className="text-sm text-muted">No tasks yet.</p>}</ul></div>
      <div className="card space-y-2"><h3 className="font-semibold">Settings</h3>
        <div><label>Money conversion ($ per point)</label><input type="number" min="0" step="0.01" value={s.config.moneyPerPoint} onChange={e=>useStore.getState().setRate(parseFloat(e.target.value||'0'))}/></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label>PIN</label><input value={pin} onChange={e=>setPin(e.target.value)}/></div>
          <div><label>PIN Hint</label><input value={hint} onChange={e=>setHint(e.target.value)}/></div>
          <div><label>Recovery Question</label><input value={rq} onChange={e=>setRq(e.target.value)}/></div>
          <div><label>Recovery Answer</label><input value={ra} onChange={e=>setRa(e.target.value)}/></div>
          <div className="sm:col-span-2"><button className="btn-outline" onClick={()=> useStore.getState().setPIN(pin,hint,rq,ra)}>Save PIN & Recovery</button><button className="btn-outline ml-2" onClick={()=> useStore.getState().relock()}>Lock Now</button></div>
        </div>
      </div>
    </div>
  </div>)
}
