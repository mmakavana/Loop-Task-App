import { useState } from 'react'
import { useStore, isPinSessionValid } from '../store/useStore'
export function PinGate({children}:{children:React.ReactNode}){
  const s=useStore(); const [pin,setPin]=useState(''); const [show,setShow]=useState(false)
  if(isPinSessionValid(s)) return <>{children}</>
  const hint=s.config.pinHint
  return (<div className="card">
    <h3 className="font-semibold mb-2">Enter PIN</h3>
    {hint && <p className="text-xs text-muted mb-2">Hint: {hint}</p>}
    <div className="flex gap-2 items-center">
      <input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN"/>
      <button className="btn-primary" onClick={()=>{ if(!useStore.getState().unlockPIN(pin)) alert('Incorrect PIN') }}>Unlock</button>
      <button className="btn-outline" onClick={()=>setShow(v=>!v)}>Forgot?</button>
    </div>
    {show && <ForgotForm/>}
  </div>)
}
function ForgotForm(){
  const s=useStore(); const [ans,setAns]=useState(''); const [np,setNp]=useState(''); const q=s.config.recoveryQ||'Recovery answer'
  return (<div className="mt-3 space-y-2">
    <label className="block">{q}</label><input value={ans} onChange={e=>setAns(e.target.value)} placeholder="Answer"/>
    <label className="block">New PIN</label><input value={np} onChange={e=>setNp(e.target.value)} placeholder="New PIN"/>
    <button className="btn-outline" onClick={()=>{ const ok=useStore.getState().forgotPIN?.(ans,np as any); alert(ok?'PIN reset. Use new PIN.':'Incorrect recovery answer.') }}>Reset PIN</button>
  </div>)
}
